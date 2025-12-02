import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Ride } from "@shared/schema";
import { Car, MapPin, Calendar, Clock, Users, MessageCircle, Search } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { fetchRides } from "@/lib/api";

export default function RidesPage() {
  const searchString = useSearch();
  const initialParams = useMemo(() => {
    const params = new URLSearchParams(searchString);
    return {
      origin: params.get("origen") || "",
      dest: params.get("destino") || "",
      date: params.get("fecha") || "all"
    };
  }, [searchString]);
  
  const { data: rides = [], isLoading } = useQuery({
    queryKey: ["rides"],
    queryFn: fetchRides,
  });
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  
  // Filter states - initialize from URL params
  const [filterOrigin, setFilterOrigin] = useState(initialParams.origin);
  const [filterDest, setFilterDest] = useState(initialParams.dest);
  const [filterDate, setFilterDate] = useState(initialParams.date);
  
  // Update filter states when URL params change
  useEffect(() => {
    setFilterOrigin(initialParams.origin);
    setFilterDest(initialParams.dest);
    setFilterDate(initialParams.date);
  }, [initialParams]);

  useEffect(() => {
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

    setFilteredRides(result);
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
      <div className="bg-white p-4 rounded-2xl shadow-sm border mb-8 grid gap-4 md:grid-cols-[1fr_1fr_auto_auto]">
        <div className="space-y-2">
          <Label htmlFor="origin" className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Origen</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              id="origin" 
              placeholder="¿De dónde sales?" 
              className="pl-9 border-muted bg-secondary/20"
              value={filterOrigin}
              onChange={(e) => setFilterOrigin(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dest" className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Destino</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              id="dest" 
              placeholder="¿A dónde vas?" 
              className="pl-9 border-muted bg-secondary/20"
              value={filterDest}
              onChange={(e) => setFilterDest(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2 min-w-[180px]">
          <Label htmlFor="date" className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Fecha</Label>
          <Select value={filterDate} onValueChange={setFilterDate}>
            <SelectTrigger className="bg-secondary/20 border-muted">
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
          <Button className="w-full md:w-auto bg-primary hover:bg-primary/90">
            <Search className="mr-2 h-4 w-4" /> Filtrar
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRides.length > 0 ? (
          filteredRides.map((ride) => (
            <RideCard key={ride.id} ride={ride} />
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

function RideCard({ ride }: { ride: Ride }) {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d 'de' MMMM", { locale: es });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border-muted">
      <div className="h-2 bg-primary/20 w-full"></div>
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-lg font-bold">
              <span className="text-primary">{ride.origin}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-primary">{ride.destination}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(ride.date)}</span>
              <span className="mx-1">•</span>
              <Clock className="h-4 w-4" />
              <span>{ride.time}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-secondary/30 p-3 rounded-lg space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{ride.driverName}</span>
          </div>
          {ride.notes && (
            <p className="text-muted-foreground text-xs italic">"{ride.notes}"</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
            {ride.seats} plazas libres
          </span>
          <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white" asChild>
            <a href={`https://wa.me/34${ride.contact.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" /> Contactar
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
