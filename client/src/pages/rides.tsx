import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Ride, type DriverRating } from "@shared/schema";
import { Car, MapPin, Calendar, Clock, Users, MessageCircle, Search, Star, Pencil, Repeat, Navigation, Globe, X } from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Link, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { fetchRides, fetchDriverRating, recordRideContact, type RidesResponse } from "@/lib/api";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { ReviewDialog } from "@/components/ReviewDialog";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function RidesPage() {
  const { t, i18n } = useTranslation();
  const searchString = useSearch();
  const [showAll, setShowAll] = useState(false);
  
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
  
  const { data: ridesData, isLoading } = useQuery({
    queryKey: ["rides", showAll],
    queryFn: () => fetchRides(showAll),
  });
  
  const rides = ridesData?.rides ?? [];
  const isFiltered = ridesData?.filtered ?? false;
  const homeTown = ridesData?.homeTown;
  const totalCount = ridesData?.totalCount ?? 0;
  const nearbyCount = ridesData?.nearbyCount ?? 0;
  
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
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const tomorrowDate = new Date(Date.now() + 86400000);
      const tomorrow = tomorrowDate.toISOString().split('T')[0];
      
      const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const todayDayName = dayNames[now.getDay()];
      const tomorrowDayName = dayNames[tomorrowDate.getDay()];

      const recurrentMatchesDay = (ride: typeof rides[0], targetDays: string[]): boolean => {
        return !!ride.isRecurrent && !!ride.recurrentDay && targetDays.includes(ride.recurrentDay);
      };

      if (filterDate === "today") {
        result = result.filter(ride => recurrentMatchesDay(ride, [todayDayName]) || (!ride.isRecurrent && ride.date === today));
      } else if (filterDate === "tomorrow") {
        result = result.filter(ride => recurrentMatchesDay(ride, [tomorrowDayName]) || (!ride.isRecurrent && ride.date === tomorrow));
      } else if (filterDate === "upcoming") {
        result = result.filter(ride => !!ride.isRecurrent || ride.date > tomorrow);
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
    <div className="container px-4 md:px-6 py-4 md:py-6">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl md:text-2xl font-bold font-serif text-foreground">{t("rides.title")}</h1>
        <span className="text-xs text-muted-foreground bg-secondary/30 px-2.5 py-1 rounded-full">
          {t("rides.ridesFound", { count: filteredRides.length })}
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-border mb-4 grid gap-2 grid-cols-[1fr_1fr] md:grid-cols-[1fr_1fr_auto_auto]">
        <div>
          <LocationAutocomplete
            id="origin"
            placeholder={t("rides.filter.originPlaceholder")}
            value={filterOrigin}
            onChange={setFilterOrigin}
          />
        </div>
        
        <div>
          <LocationAutocomplete
            id="dest"
            placeholder={t("rides.filter.destinationPlaceholder")}
            value={filterDest}
            onChange={setFilterDest}
          />
        </div>
        
        <div>
          <Select value={filterDate} onValueChange={setFilterDate}>
            <SelectTrigger className="bg-card border-border h-9 text-sm">
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

        <div className="flex items-center">
          {(filterOrigin || filterDest || filterDate !== "all") ? (
            <Button 
              variant="outline"
              size="sm"
              className="w-full md:w-auto h-9"
              onClick={() => { setFilterOrigin(""); setFilterDest(""); setFilterDate("all"); }}
              data-testid="button-clear-filters"
            >
              <X className="mr-1.5 h-3.5 w-3.5" /> {t("common.clearFilters")}
            </Button>
          ) : (
            <Button size="sm" className="w-full md:w-auto h-9 bg-primary hover:bg-[#70b681] pointer-events-none opacity-50" tabIndex={-1}>
              <Search className="mr-1.5 h-3.5 w-3.5" /> {t("common.filter")}
            </Button>
          )}
        </div>
      </div>

      {/* Proximity indicator - hide when using origin/destination text filters */}
      {isFiltered && !showAll && !filterOrigin && !filterDest && (
        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 mb-3" data-testid="proximity-indicator">
          <div className="flex items-center gap-1.5 text-xs">
            <Navigation className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground">
              {t("rides.nearbyFilter", { town: homeTown, count: nearbyCount })}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAll(true)}
            className="text-primary hover:text-primary hover:bg-primary/10 text-xs gap-1 h-7 px-2"
            data-testid="button-show-all-rides"
          >
            <Globe className="h-3 w-3" />
            {t("rides.showAll", { count: totalCount })}
          </Button>
        </div>
      )}
      
      {showAll && homeTown && !filterOrigin && !filterDest && (
        <div className="flex items-center justify-between bg-muted/50 border border-border rounded-lg px-3 py-2 mb-3" data-testid="showing-all-indicator">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            <span>{t("rides.showingAll")}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAll(false)}
            className="text-primary hover:bg-primary/10 text-xs gap-1 h-7 px-2"
            data-testid="button-show-nearby"
          >
            <Navigation className="h-3 w-3" />
            {t("rides.showNearby", { town: homeTown })}
          </Button>
        </div>
      )}

      {/* Results */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
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

  const handleContact = () => {
    const timeText = ride.flexibleTime ? "" : t("rides.card.whatsappAtTime", { time: ride.time });
    let message: string;
    if (ride.isRecurrent && ride.recurrentDay) {
      message = t("rides.card.whatsappMessageRecurrent", {
        origin: ride.origin,
        destination: ride.destination,
        day: t(`days.${ride.recurrentDay}`),
        time: timeText,
      });
    } else {
      message = t("rides.card.whatsappMessage", {
        origin: ride.origin,
        destination: ride.destination,
        date: formatDate(ride.date),
        time: timeText,
      });
    }
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/34${ride.contact.replace(/\s/g, '')}?text=${encoded}`, '_blank');

    if (isAuthenticated && ride.driverProfileId) {
      recordRideContact(ride.id, ride.driverProfileId).catch(() => {});
    }
  };

  return (
    <>
      <Card 
        className={`overflow-hidden hover:shadow-md transition-shadow border-border ${
          isOwnRide ? "bg-primary/10 border-primary/30" : "bg-white"
        }`} 
        data-testid={`card-ride-${ride.id}`}
      >
        <div className={`h-1.5 w-full bg-primary`}></div>
        <CardContent className="pt-4 pb-4 space-y-3">
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
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium flex-wrap">
                {ride.isRecurrent ? (
                  <>
                    <Repeat className="h-4 w-4 text-primary" />
                    <span className="text-primary font-medium">
                      {t("rides.recurrentBadge", { day: t(`days.${ride.recurrentDay}`) })}
                    </span>
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{formatDate(ride.date)}</span>
                  </>
                )}
                <span className="mx-1">•</span>
                {ride.flexibleTime ? (
                  <>
                    <Clock className="h-4 w-4 text-accent" />
                    <span className="text-accent font-medium">{t("rides.flexibleTimeBadge")}</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{ride.time}</span>
                  </>
                )}
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
