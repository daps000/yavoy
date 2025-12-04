import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Ride, type DriverRating } from "@shared/schema";
import { Car, MapPin, Calendar, Clock, Users, MessageCircle, Search, Star } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { fetchRides, fetchDriverRating, recordRideContact } from "@/lib/api";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { ReviewDialog } from "@/components/ReviewDialog";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

export default function RidesPage() {
  const searchString = useSearch();
  
  const urlOrigin = useMemo(() => {
    const params = new URLSearchParams(searchString);
    return params.get("origen") || "";
  }, [searchString]);
  
  const urlDest = useMemo(() => {
    const params = new URLSearchParams(searchString);
    return params.get("destino") || "";
  }, [searchString]);
  
  const urlDate = useMemo(() => {
    const params = new URLSearchParams(searchString);
    return params.get("fecha") || "all";
  }, [searchString]);
  
  const { data: rides = [], isLoading } = useQuery({
    queryKey: ["rides"],
    queryFn: fetchRides,
  });
  
  // Filter states - initialize from URL params
  const [filterOrigin, setFilterOrigin] = useState(urlOrigin);
  const [filterDest, setFilterDest] = useState(urlDest);
  const [filterDate, setFilterDate] = useState(urlDate);
  
  // Compute filtered rides using useMemo instead of useEffect
  const filteredRides = useMemo(() => {
    let result = rides;

    if (filterOrigin) {
      result = result.filter(ride => 
        ride.origin.toLowerCase().includes(filterOrigin.toLowerCase())
      );
    }

    if (filterDest) {
      result = result.filter(ride => 
        ride.destination.toLowerCase().includes(filterDest.toLowerCase())
      );
    }

    if (filterDate !== "all") {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      if (filterDate === "today") {
        result = result.filter(ride => ride.date === today);
      } else if (filterDate === "tomorrow") {
        result = result.filter(ride => ride.date === tomorrow);
      } else if (filterDate === "upcoming") {
        result = result.filter(ride => ride.date > tomorrow);
      }
    }

    return result;
  }, [rides, filterOrigin, filterDest, filterDate]);

  if (isLoading) {
    return (
      <div className="container px-4 md:px-6 py-12 text-center">
        <p className="text-muted-foreground">Cargando viajes...</p>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Viajes disponibles</h1>
          <p className="text-muted-foreground mt-2">Encuentra un vecino con quien compartir trayecto.</p>
        </div>
        <div className="hidden md:block text-sm text-muted-foreground bg-secondary/30 px-3 py-1 rounded-full">
          {filteredRides.length} viajes encontrados
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-border mb-8 grid gap-4 md:grid-cols-[1fr_1fr_auto_auto]">
        <div className="space-y-2">
          <Label htmlFor="origin" className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Origen</Label>
          <LocationAutocomplete
            id="origin"
            placeholder="¿De dónde sales?"
            value={filterOrigin}
            onChange={setFilterOrigin}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dest" className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Destino</Label>
          <LocationAutocomplete
            id="dest"
            placeholder="¿A dónde vas?"
            value={filterDest}
            onChange={setFilterDest}
          />
        </div>
        
        <div className="space-y-2 min-w-[180px]">
          <Label htmlFor="date" className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Fecha</Label>
          <Select value={filterDate} onValueChange={setFilterDate}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="Cualquier fecha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier fecha</SelectItem>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="tomorrow">Mañana</SelectItem>
              <SelectItem value="upcoming">Próximos días</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button className="w-full md:w-auto bg-primary hover:bg-[#70b681]">
            <Search className="mr-2 h-4 w-4" /> Filtrar
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRides.length > 0 ? (
          filteredRides.map((ride) => (
            <RideCard key={ride.id} ride={ride} showAsOwn={false} />
          ))
        ) : (
          <div className="col-span-full text-center py-16 bg-secondary/20 rounded-xl border border-dashed">
            <Car className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <h3 className="text-lg font-medium">No hay viajes con estos filtros</h3>
            <p className="text-muted-foreground mb-6">¡Sé el primero en publicar uno!</p>
            <Link href="/publicar">
              <Button>Publicar viaje</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function DriverRatingDisplay({ driverProfileId }: { driverProfileId: number | null }) {
  const { data: rating } = useQuery({
    queryKey: ["driverRating", driverProfileId],
    queryFn: () => driverProfileId ? fetchDriverRating(driverProfileId) : Promise.resolve({ averageStars: 0, totalReviews: 0 }),
    enabled: !!driverProfileId,
  });

  if (!driverProfileId || !rating || rating.totalReviews === 0) {
    return <span className="text-xs text-muted-foreground">(nuevo)</span>;
  }

  return (
    <span className="flex items-center gap-1 text-xs text-amber-600">
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      <span>{rating.averageStars.toFixed(1)}</span>
      <span className="text-muted-foreground">({rating.totalReviews})</span>
    </span>
  );
}

export function RideCard({ ride, showAsOwn = false, onEdit, onDelete }: { 
  ride: Ride; 
  showAsOwn?: boolean;
  onEdit?: (ride: Ride) => void;
  onDelete?: (ride: Ride) => void;
}) {
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  const isOwnRide = showAsOwn || (isAuthenticated && ride.userId === user?.id);
  
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d 'de' MMMM", { locale: es });
    } catch (e) {
      return dateStr;
    }
  };

  const handleContact = async () => {
    if (isAuthenticated && ride.driverProfileId) {
      try {
        await recordRideContact(ride.id, ride.driverProfileId);
      } catch (error) {
        console.error("Error recording ride contact:", error);
      }
    }
    window.open(`https://wa.me/34${ride.contact.replace(/\s/g, '')}`, '_blank');
  };

  return (
    <>
      <Card 
        className={`overflow-hidden hover:shadow-md transition-shadow border-border ${
          isOwnRide ? "bg-primary/10 border-primary/30" : "bg-white"
        }`} 
        data-testid={`card-ride-${ride.id}`}
      >
        <div className={`h-2 w-full ${isOwnRide ? "bg-primary" : "bg-primary"}`}></div>
        <CardContent className="pt-6 space-y-4">
          {isOwnRide && (
            <div className="text-xs font-bold text-primary uppercase tracking-wide">
              Mi viaje publicado
            </div>
          )}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-lg font-bold">
                <span className="text-foreground">{ride.origin}</span>
                <span className="text-primary">→</span>
                <span className="text-foreground">{ride.destination}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{formatDate(ride.date)}</span>
                <span className="mx-1">•</span>
                <Clock className="h-4 w-4 text-primary" />
                <span>{ride.time}</span>
              </div>
            </div>
          </div>
          
          <div className={`p-3 rounded-lg space-y-2 text-sm ${isOwnRide ? "bg-white/50" : "bg-card"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium">{ride.driverName}</span>
                {!isOwnRide && <DriverRatingDisplay driverProfileId={ride.driverProfileId} />}
              </div>
              {!isOwnRide && ride.driverProfileId && (
                <button
                  onClick={() => setReviewDialogOpen(true)}
                  className="text-xs text-primary hover:underline"
                  data-testid={`button-review-${ride.id}`}
                >
                  Valorar
                </button>
              )}
            </div>
            {ride.notes && (
              <p className="text-muted-foreground text-xs italic">"{ride.notes}"</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium bg-primary/15 text-primary px-3 py-1 rounded-full" data-testid={`text-seats-${ride.id}`}>
              {ride.seats} plazas libres
            </span>
            {isOwnRide ? (
              <div className="flex gap-2">
                {onEdit && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onEdit(ride)}
                    data-testid={`button-edit-${ride.id}`}
                  >
                    Editar
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="bg-white text-accent border-accent hover:bg-accent/10"
                    onClick={() => onDelete(ride)}
                    data-testid={`button-delete-${ride.id}`}
                  >
                    Eliminar
                  </Button>
                )}
              </div>
            ) : (
              <Button 
                size="sm" 
                className="bg-accent hover:bg-[#d9a535] text-white" 
                onClick={handleContact}
                data-testid={`button-contact-${ride.id}`}
              >
                <MessageCircle className="mr-2 h-4 w-4" /> Contactar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {!isOwnRide && ride.driverProfileId && (
        <ReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          driverProfileId={ride.driverProfileId}
          driverName={ride.driverName}
        />
      )}
    </>
  );
}
