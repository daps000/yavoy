import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Ride, type DriverRating } from "@shared/schema";
import { Car, MapPin, Calendar, Clock, Users, MessageCircle, Search, Star, Pencil } from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Link, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { fetchRides, fetchDriverRating, recordRideContact } from "@/lib/api";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { ReviewDialog } from "@/components/ReviewDialog";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function RidesPage() {
  const { t, i18n } = useTranslation();
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
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">{t("rides.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("rides.subtitle")}</p>
        </div>
        <div className="hidden md:block text-sm text-muted-foreground bg-secondary/30 px-3 py-1 rounded-full">
          {t("rides.ridesFound", { count: filteredRides.length })}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-border mb-8 grid gap-4 md:grid-cols-[1fr_1fr_auto_auto]">
        <div className="space-y-2">
          <Label htmlFor="origin" className="text-xs text-muted-foreground uppercase font-bold tracking-wide">{t("rides.filter.origin")}</Label>
          <LocationAutocomplete
            id="origin"
            placeholder={t("rides.filter.originPlaceholder")}
            value={filterOrigin}
            onChange={setFilterOrigin}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dest" className="text-xs text-muted-foreground uppercase font-bold tracking-wide">{t("rides.filter.destination")}</Label>
          <LocationAutocomplete
            id="dest"
            placeholder={t("rides.filter.destinationPlaceholder")}
            value={filterDest}
            onChange={setFilterDest}
          />
        </div>
        
        <div className="space-y-2 min-w-[180px]">
          <Label htmlFor="date" className="text-xs text-muted-foreground uppercase font-bold tracking-wide">{t("rides.filter.date")}</Label>
          <Select value={filterDate} onValueChange={setFilterDate}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder={t("rides.filter.anyDate")} />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">{t("rides.filter.anyDate")}</SelectItem>
              <SelectItem value="today">{t("rides.filter.today")}</SelectItem>
              <SelectItem value="tomorrow">{t("rides.filter.tomorrow")}</SelectItem>
              <SelectItem value="upcoming">{t("rides.filter.upcoming")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button className="w-full md:w-auto bg-primary hover:bg-[#70b681]">
            <Search className="mr-2 h-4 w-4" /> {t("common.filter")}
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
            <h3 className="text-lg font-medium">{t("rides.noRides")}</h3>
            <p className="text-muted-foreground mb-6">{t("rides.beFirst")}</p>
            <Link href="/publicar">
              <Button>{t("rides.card.publishRide")}</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function DriverRatingDisplay({ driverProfileId }: { driverProfileId: number | null }) {
  const { t } = useTranslation();
  const { data: rating } = useQuery({
    queryKey: ["driverRating", driverProfileId],
    queryFn: () => driverProfileId ? fetchDriverRating(driverProfileId) : Promise.resolve({ averageStars: 0, totalReviews: 0 }),
    enabled: !!driverProfileId,
  });

  if (!driverProfileId || !rating || rating.totalReviews === 0) {
    return <span className="text-xs text-muted-foreground">({t("rides.card.new")})</span>;
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
  const { t, i18n } = useTranslation();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  const isOwnRide = showAsOwn || (isAuthenticated && ride.userId === user?.id);
  
  const formatDate = (dateStr: string) => {
    try {
      const locale = i18n.language === 'en' ? enUS : es;
      const formatStr = i18n.language === 'en' ? "MMMM d" : "d 'de' MMMM";
      return format(new Date(dateStr), formatStr, { locale });
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
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wide">
                {t("rides.card.myPublishedRide")}
              </span>
              <Link href={`/mis-viajes?editar=${ride.id}`}>
                <button 
                  className="p-1.5 rounded-full hover:bg-primary/20 transition-colors"
                  title={t("common.edit")}
                  data-testid={`button-edit-ride-${ride.id}`}
                >
                  <Pencil className="h-4 w-4 text-primary" />
                </button>
              </Link>
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
          
          {!isOwnRide && (
            <div className={`p-3 rounded-lg space-y-2 text-sm bg-card`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">{ride.driverName}</span>
                  <DriverRatingDisplay driverProfileId={ride.driverProfileId} />
                </div>
                {ride.driverProfileId && (
                  <button
                    onClick={() => setReviewDialogOpen(true)}
                    className="text-xs text-primary hover:underline"
                    data-testid={`button-review-${ride.id}`}
                  >
                    {t("rides.card.rate")}
                  </button>
                )}
              </div>
              {ride.notes && (
                <p className="text-muted-foreground text-xs italic">"{ride.notes}"</p>
              )}
            </div>
          )}
          {isOwnRide && ride.notes && (
            <div className="p-3 rounded-lg bg-white/50 text-sm">
              <p className="text-muted-foreground text-xs italic">"{ride.notes}"</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${isOwnRide ? "bg-white text-primary" : "bg-primary/15 text-primary"}`} data-testid={`text-seats-${ride.id}`}>
              {t("rides.card.freeSeats", { count: ride.seats })}
            </span>
            {isOwnRide ? (
              <div className="flex gap-2">
                {onDelete && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="bg-white text-accent border-accent hover:bg-accent/10"
                    onClick={() => onDelete(ride)}
                    data-testid={`button-delete-${ride.id}`}
                  >
                    {t("common.delete")}
                  </Button>
                )}
                {onEdit && (
                  <Button 
                    size="sm" 
                    className="bg-primary hover:bg-[#70b681] text-white"
                    onClick={() => onEdit(ride)}
                    data-testid={`button-edit-${ride.id}`}
                  >
                    {t("common.edit")}
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
                <MessageCircle className="mr-2 h-4 w-4" /> {t("rides.card.contact")}
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
