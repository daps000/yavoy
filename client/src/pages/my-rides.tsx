import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyRides, deleteRide, updateRide } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { RideCard } from "./rides";
import { Button } from "@/components/ui/button";
import { Car, Plus, PartyPopper, ChevronDown, ChevronRight, MapPin, Calendar, Clock } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Ride } from "@shared/schema";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";

export default function MyRidesPage() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, profile, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [editingRide, setEditingRide] = useState<Ride | null>(null);
  const [deleteConfirmRide, setDeleteConfirmRide] = useState<Ride | null>(null);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [pastRidesOpen, setPastRidesOpen] = useState(false);
  
  const { data: myRides = [], isLoading } = useQuery({
    queryKey: ["my-rides"],
    queryFn: fetchMyRides,
    enabled: isAuthenticated,
  });

  const { activeRides, pastRides } = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const active: Ride[] = [];
    const past: Ride[] = [];
    for (const ride of myRides) {
      if (ride.isRecurrent || ride.date >= today) {
        active.push(ride);
      } else {
        past.push(ride);
      }
    }
    return { activeRides: active, pastRides: past };
  }, [myRides]);

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    if (params.get("bienvenido") === "1" && !hasShownWelcome && isAuthenticated) {
      setHasShownWelcome(true);
      const userName = profile?.firstName || t("myRides.welcome.neighbor");
      toast({
        title: t("myRides.welcome.title", { name: userName }),
        description: t("myRides.welcome.description"),
        action: <PartyPopper className="h-6 w-6 text-primary" />,
        duration: 5000,
      });
      navigate("/mis-viajes", { replace: true });
    }
  }, [searchString, hasShownWelcome, isAuthenticated, profile, toast, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const editRideId = params.get("editar");
    if (editRideId && myRides.length > 0 && !editingRide) {
      const rideToEdit = myRides.find(r => r.id === parseInt(editRideId));
      if (rideToEdit) {
        setEditingRide(rideToEdit);
        navigate("/mis-viajes", { replace: true });
      }
    }
  }, [searchString, myRides, editingRide, navigate]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRide(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-rides"] });
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      toast({
        title: t("myRides.deleted.title"),
        description: t("myRides.deleted.description"),
      });
      setDeleteConfirmRide(null);
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error"),
        description: error.message || t("myRides.deleted.error"),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Ride> }) => updateRide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-rides"] });
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      toast({
        title: t("myRides.updated.title"),
        description: t("myRides.updated.description"),
      });
      setEditingRide(null);
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error"),
        description: error.message || t("myRides.updated.error"),
        variant: "destructive",
      });
    },
  });

  const handleEdit = (ride: Ride) => {
    setEditingRide(ride);
  };

  const handleDelete = (ride: Ride) => {
    setDeleteConfirmRide(ride);
  };

  const [editIsRecurrent, setEditIsRecurrent] = useState(false);
  const [editRecurrentDay, setEditRecurrentDay] = useState("");
  const [editFlexibleTime, setEditFlexibleTime] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const editUserNotes = useRef("");
  
  const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

  const buildEditAutoNote = (recurrent: boolean, day: string, flexible: boolean): string => {
    const parts: string[] = [];
    if (recurrent && day) {
      parts.push(t("publish.form.recurrentNote", { day: t(`days.${day}`) }));
    }
    if (flexible) {
      parts.push(t("publish.form.flexibleTimeNote"));
    }
    return parts.join(" ");
  };

  const handleEditNotesChange = (value: string) => {
    setEditNotes(value);
    const currentAuto = buildEditAutoNote(editIsRecurrent, editRecurrentDay, editFlexibleTime);
    if (currentAuto) {
      editUserNotes.current = value.replace(currentAuto, "").trim();
    } else {
      editUserNotes.current = value.trim();
    }
  };

  useEffect(() => {
    if (editingRide) {
      setEditIsRecurrent(!!editingRide.isRecurrent);
      setEditRecurrentDay(editingRide.recurrentDay || "");
      setEditFlexibleTime(!!editingRide.flexibleTime);
      const autoNote = buildEditAutoNote(!!editingRide.isRecurrent, editingRide.recurrentDay || "", !!editingRide.flexibleTime);
      const rawNotes = editingRide.notes || "";
      editUserNotes.current = autoNote ? rawNotes.replace(autoNote, "").trim() : rawNotes.trim();
      setEditNotes(rawNotes);
    }
  }, [editingRide]);

  useEffect(() => {
    if (!editingRide) return;
    const autoNote = buildEditAutoNote(editIsRecurrent, editRecurrentDay, editFlexibleTime);
    const combined = [editUserNotes.current, autoNote].filter(Boolean).join("\n");
    setEditNotes(combined);
  }, [editIsRecurrent, editRecurrentDay, editFlexibleTime, editingRide, t]);

  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingRide) return;
    
    if (editIsRecurrent && !editRecurrentDay) {
      toast({
        title: t("publish.error.missingData"),
        description: t("publish.error.fillRequired"),
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    const dateVal = editIsRecurrent ? new Date().toISOString().split('T')[0] : formData.get("date") as string;
    const timeVal = editFlexibleTime ? "flexible" : formData.get("time") as string;
    
    if (!editIsRecurrent && !dateVal) {
      toast({
        title: t("publish.error.missingData"),
        description: t("publish.error.fillRequired"),
        variant: "destructive",
      });
      return;
    }
    
    const data: Partial<Ride> = {
      origin: formData.get("origin") as string,
      destination: formData.get("destination") as string,
      date: dateVal,
      time: timeVal,
      seats: parseInt(formData.get("seats") as string),
      notes: editNotes.trim() || undefined,
      isRecurrent: editIsRecurrent ? 1 : 0,
      recurrentDay: editIsRecurrent ? editRecurrentDay : null,
      flexibleTime: editFlexibleTime ? 1 : 0,
    };
    
    updateMutation.mutate({ id: editingRide.id, data });
  };

  if (authLoading) {
    return (
      <div className="container px-4 md:px-6 py-12 text-center">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container px-4 md:px-6 py-12">
        <div className="text-center py-16 bg-secondary/20 rounded-xl border border-dashed">
          <Car className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
          <h3 className="text-lg font-medium">{t("myRides.loginRequired.title")}</h3>
          <p className="text-muted-foreground mb-6">
            {t("myRides.loginRequired.description")}
          </p>
          <Button onClick={() => navigate("/entrar")} data-testid="button-login-myrides">
            {t("nav.login")}
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container px-4 md:px-6 py-12 text-center">
        <p className="text-muted-foreground">{t("myRides.loading")}</p>
      </div>
    );
  }

  const formatPastDate = (dateStr: string) => {
    try {
      const locale = i18n.language === 'en' ? enUS : es;
      const formatStr = i18n.language === 'en' ? "MMM d, yyyy" : "d MMM yyyy";
      return format(new Date(dateStr), formatStr, { locale });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="container px-4 md:px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">{t("myRides.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("myRides.subtitle")}</p>
        </div>
        <Link href="/publicar">
          <Button className="bg-primary hover:bg-[#70b681]" data-testid="button-publish-new">
            <Plus className="mr-2 h-4 w-4" /> {t("myRides.publishNew")}
          </Button>
        </Link>
      </div>

      {activeRides.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeRides.map((ride) => (
            <RideCard 
              key={ride.id} 
              ride={ride} 
              showAsOwn={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-secondary/20 rounded-xl border border-dashed">
          <Car className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
          <h3 className="text-lg font-medium">{t("myRides.noRides.title")}</h3>
          <p className="text-muted-foreground mb-6">{t("myRides.noRides.description")}</p>
          <Link href="/publicar">
            <Button data-testid="button-publish-first">{t("rides.card.publishRide")}</Button>
          </Link>
        </div>
      )}

      {pastRides.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setPastRidesOpen(!pastRidesOpen)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-full"
            data-testid="toggle-past-rides"
          >
            {pastRidesOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            <span className="text-lg font-semibold">{t("myRides.pastRides")}</span>
            <span className="text-sm">({pastRides.length})</span>
          </button>
          {pastRidesOpen && (
            <div className="grid gap-3 mt-4">
              {pastRides.map((ride) => (
                <div
                  key={ride.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border bg-muted/30 text-sm"
                  data-testid={`past-ride-${ride.id}`}
                >
                  <div className="flex items-center gap-1.5 text-muted-foreground min-w-[100px]">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatPastDate(ride.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{ride.origin}</span>
                    <span className="text-muted-foreground mx-1">→</span>
                    <span className="truncate">{ride.destination}</span>
                  </div>
                  {ride.time && ride.time !== "flexible" && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{ride.time}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={!!editingRide} onOpenChange={(open) => !open && setEditingRide(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("myRides.edit.title")}</DialogTitle>
            <DialogDescription>
              {t("myRides.edit.description")}
            </DialogDescription>
          </DialogHeader>
          {editingRide && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="origin">{t("publish.form.origin")}</Label>
                <Input
                  id="origin"
                  name="origin"
                  defaultValue={editingRide.origin}
                  required
                  data-testid="input-edit-origin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">{t("publish.form.destination")}</Label>
                <Input
                  id="destination"
                  name="destination"
                  defaultValue={editingRide.destination}
                  required
                  data-testid="input-edit-destination"
                />
              </div>
              <div className="space-y-2">
                {editIsRecurrent ? (
                  <>
                    <Label htmlFor="edit-day">{t("publish.form.dayOfWeek")}</Label>
                    <Select value={editRecurrentDay} onValueChange={setEditRecurrentDay}>
                      <SelectTrigger className="bg-card border-border" data-testid="select-edit-day">
                        <SelectValue placeholder={t("publish.form.dayOfWeek")} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {DAYS_OF_WEEK.map(day => (
                          <SelectItem key={day} value={day}>
                            {t(`days.${day}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <Label htmlFor="date">{t("publish.form.date")}</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      defaultValue={editingRide.date.split(' ')[0]}
                      required={!editIsRecurrent}
                      data-testid="input-edit-date"
                    />
                  </>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Checkbox
                    id="edit-recurrent"
                    checked={editIsRecurrent}
                    onCheckedChange={(checked) => setEditIsRecurrent(checked === true)}
                    data-testid="checkbox-edit-recurrent"
                  />
                  <label htmlFor="edit-recurrent" className="text-sm text-muted-foreground cursor-pointer">
                    {t("publish.form.recurrentTrip")}
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">{t("publish.form.time")}</Label>
                {editFlexibleTime ? (
                  <div className="flex items-center h-10 px-3 rounded-md bg-card border border-border text-muted-foreground text-sm">
                    {t("publish.form.flexibleTimeHint")}
                  </div>
                ) : (
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    defaultValue={editingRide.flexibleTime ? "" : editingRide.time}
                    required={!editFlexibleTime}
                    data-testid="input-edit-time"
                  />
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Checkbox
                    id="edit-flexible-time"
                    checked={editFlexibleTime}
                    onCheckedChange={(checked) => setEditFlexibleTime(checked === true)}
                    data-testid="checkbox-edit-flexible-time"
                  />
                  <label htmlFor="edit-flexible-time" className="text-sm text-muted-foreground cursor-pointer">
                    {t("publish.form.flexibleTime")}
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seats">{t("myRides.edit.availableSeats")}</Label>
                <Input
                  id="seats"
                  name="seats"
                  type="number"
                  min="1"
                  max="8"
                  defaultValue={editingRide.seats}
                  required
                  data-testid="input-edit-seats"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">{t("publish.form.notes")}</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={editNotes}
                  onChange={(e) => handleEditNotesChange(e.target.value)}
                  placeholder={t("myRides.edit.notesPlaceholder")}
                  data-testid="input-edit-notes"
                />
              </div>
              <DialogFooter className="gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingRide(null)}
                >
                  {t("common.cancel")}
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  data-testid="button-save-edit"
                >
                  {updateMutation.isPending ? t("common.saving") : t("common.saveChanges")}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmRide} onOpenChange={(open) => !open && setDeleteConfirmRide(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("myRides.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("myRides.delete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmRide && deleteMutation.mutate(deleteConfirmRide.id)}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? t("common.deleting") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
