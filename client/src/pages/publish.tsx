import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { type InsertRide } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, LogIn, User, CalendarDays, Repeat } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRide } from "@/lib/api";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { useAuth } from "@/lib/auth-context";
import { saveDraft, loadDraft, isDraftPending, clearDraft } from "@/lib/publish-draft";
import { useTranslation } from "react-i18next";

export default function PublishPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { isAuthenticated, profile, isLoading: authLoading } = useAuth();
  const hasAttemptedAutoSubmit = useRef(false);
  
  const [driverName, setDriverName] = useState("");
  const [contact, setContact] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState(3);
  const [notes, setNotes] = useState("");
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [recurrentDay, setRecurrentDay] = useState("");
  const [flexibleTime, setFlexibleTime] = useState(false);
  const [isRestoringDraft, setIsRestoringDraft] = useState(true);

  const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

  const profileName = profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : '';
  const profilePhone = profile?.phone || '';
  
  // Use draft contact if profile phone is empty (for users who just logged in after filling form)
  const effectivePhone = profilePhone || contact;

  const userNotes = useRef("");

  const handleNotesChange = (value: string) => {
    setNotes(value);
    const currentAuto = buildAutoNote(isRecurrent, recurrentDay, flexibleTime);
    if (currentAuto) {
      userNotes.current = value.replace(currentAuto, "").trim();
    } else {
      userNotes.current = value.trim();
    }
  };

  const buildAutoNote = (recurrent: boolean, day: string, flexible: boolean): string => {
    const parts: string[] = [];
    if (recurrent && day) {
      parts.push(t("publish.form.recurrentNote", { day: t(`days.${day}`) }));
    }
    if (flexible) {
      parts.push(t("publish.form.flexibleTimeNote"));
    }
    return parts.join(" ");
  };

  useEffect(() => {
    const autoNote = buildAutoNote(isRecurrent, recurrentDay, flexibleTime);
    const combined = [userNotes.current, autoNote].filter(Boolean).join("\n");
    setNotes(combined);
  }, [isRecurrent, recurrentDay, flexibleTime, t]);

  const mutation = useMutation({
    mutationFn: createRide,
    onSuccess: () => {
      clearDraft();
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      queryClient.invalidateQueries({ queryKey: ["my-rides"] });
      toast({
        title: t("publish.success.title"),
        description: t("publish.success.description"),
        action: <CheckCircle2 className="h-6 w-6 text-green-500" />,
        duration: 5000,
      });
      setTimeout(() => setLocation("/mis-viajes"), 1000);
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message || t("publish.error.generic"),
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setDriverName(draft.driverName);
      setContact(draft.contact);
      setOrigin(draft.origin);
      setDestination(draft.destination);
      setDate(draft.date || "");
      setTime(draft.time || "");
      setSeats(draft.seats);
      setNotes(draft.notes);
      if (draft.isRecurrent) {
        setIsRecurrent(true);
        setRecurrentDay(draft.recurrentDay || "");
      }
      if (draft.flexibleTime) {
        setFlexibleTime(true);
      }
      
      if (isAuthenticated && isDraftPending() && !hasAttemptedAutoSubmit.current) {
        hasAttemptedAutoSubmit.current = true;
        toast({
          title: t("publish.draftRestored.title"),
          description: t("publish.draftRestored.description"),
          duration: 5000,
        });
      }
    }
    setIsRestoringDraft(false);
  }, [isAuthenticated]);

  const validateForm = (): boolean => {
    const finalName = isAuthenticated ? profileName : driverName;
    const finalPhone = isAuthenticated ? effectivePhone : contact;
    
    const needsDate = !isRecurrent;
    const needsTime = !flexibleTime;
    const needsDay = isRecurrent;
    
    if (!finalName || !origin || !destination || (needsDate && !date) || (needsTime && !time) || (needsDay && !recurrentDay)) {
      toast({
        title: t("publish.error.missingData"),
        description: t("publish.error.fillRequired"),
        variant: "destructive",
      });
      return false;
    }
    
    if (!finalPhone) {
      toast({
        title: t("publish.error.missingPhone"),
        description: t("publish.error.addPhone"),
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!isAuthenticated) {
      saveDraft({
        driverName,
        contact,
        origin,
        destination,
        date,
        time,
        seats,
        notes,
        isRecurrent,
        recurrentDay: isRecurrent ? recurrentDay : undefined,
        flexibleTime,
      });
      setLocation("/entrar?from=publicar");
      return;
    }

    const finalDate = isRecurrent ? new Date().toISOString().split('T')[0] : date;
    const finalTime = flexibleTime ? "flexible" : time;

    const newRide: InsertRide = {
      driverName: isAuthenticated ? profileName : driverName,
      origin,
      destination,
      date: finalDate,
      time: finalTime,
      seats,
      contact: isAuthenticated ? effectivePhone : contact,
      notes: notes.trim() || "",
      isRecurrent: isRecurrent ? 1 : 0,
      recurrentDay: isRecurrent ? recurrentDay : null,
      flexibleTime: flexibleTime ? 1 : 0,
    };

    mutation.mutate(newRide);
  };

  if (authLoading || isRestoringDraft) {
    return (
      <div className="container px-4 md:px-6 py-12 text-center">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-12 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold font-serif text-foreground mb-3">{t("publish.title")}</h1>
        <p className="text-muted-foreground">{t("publish.subtitle")}</p>
      </div>

      <Card className="border border-border shadow-lg bg-white">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
                  <User className="h-5 w-5 text-primary shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">{t("publish.form.publishingAs")}: {profileName}</p>
                    {profilePhone && (
                      <p className="text-muted-foreground">{t("publish.form.phone")}: {profilePhone}</p>
                    )}
                  </div>
                </div>
                {!profilePhone && (
                  <div className="space-y-2">
                    <Label htmlFor="contact-auth">{t("publish.form.phoneWhatsapp")}</Label>
                    <Input 
                      id="contact-auth" 
                      name="contact" 
                      type="tel"
                      inputMode="tel"
                      placeholder="600 000 000" 
                      required 
                      className="bg-card border-border"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      data-testid="input-contact-auth"
                    />
                    <p className="text-xs text-muted-foreground">{t("publish.form.phoneWillBeSaved")}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("publish.form.yourName")}</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder={t("publish.form.namePlaceholder")} 
                    required 
                    className="bg-card border-border"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    data-testid="input-driver-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">{t("publish.form.phoneWhatsapp")}</Label>
                  <Input 
                    id="contact" 
                    name="contact" 
                    type="tel"
                    inputMode="tel"
                    placeholder="600 000 000" 
                    required 
                    className="bg-card border-border"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    data-testid="input-contact"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin_form">{t("publish.form.origin")}</Label>
                <LocationAutocomplete
                  id="origin_form"
                  placeholder={t("publish.form.originPlaceholder")}
                  value={origin}
                  onChange={setOrigin}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination_form">{t("publish.form.destination")}</Label>
                <LocationAutocomplete
                  id="destination_form"
                  placeholder={t("publish.form.destinationPlaceholder")}
                  value={destination}
                  onChange={setDestination}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("publish.form.tripType")}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRecurrent(false)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                      !isRecurrent 
                        ? "border-primary bg-primary/10 text-primary font-medium" 
                        : "border-border bg-card text-muted-foreground hover:border-primary/50"
                    }`}
                    data-testid="button-specific-date"
                  >
                    <CalendarDays className="h-4 w-4" />
                    {t("publish.form.specificDate")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRecurrent(true)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                      isRecurrent 
                        ? "border-primary bg-primary/10 text-primary font-medium" 
                        : "border-border bg-card text-muted-foreground hover:border-primary/50"
                    }`}
                    data-testid="button-recurrent-trip"
                  >
                    <Repeat className="h-4 w-4" />
                    {t("publish.form.recurrentTrip")}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isRecurrent ? (
                  <div className="space-y-2">
                    <Label htmlFor="day_form">{t("publish.form.dayOfWeek")}</Label>
                    <Select value={recurrentDay} onValueChange={setRecurrentDay}>
                      <SelectTrigger className="bg-card border-border" data-testid="select-day-of-week">
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
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="date_form">{t("publish.form.date")}</Label>
                    <Input 
                      id="date_form" 
                      name="date" 
                      type="date" 
                      required={!isRecurrent}
                      min={new Date().toISOString().split('T')[0]} 
                      max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      className="bg-card border-border"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      data-testid="input-date"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="time_form">{t("publish.form.time")}</Label>
                  {flexibleTime ? (
                    <div className="flex items-center h-10 px-3 rounded-md bg-card border border-border text-muted-foreground text-sm">
                      {t("publish.form.flexibleTimeHint")}
                    </div>
                  ) : (
                    <Input 
                      id="time_form" 
                      name="time" 
                      type="time" 
                      required={!flexibleTime}
                      className="bg-card border-border"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      data-testid="input-time"
                    />
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Checkbox
                      id="flexible-time"
                      checked={flexibleTime}
                      onCheckedChange={(checked) => setFlexibleTime(checked === true)}
                      data-testid="checkbox-flexible-time"
                    />
                    <label htmlFor="flexible-time" className="text-sm text-muted-foreground cursor-pointer">
                      {t("publish.form.flexibleTime")}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seats">{t("publish.form.seats")}</Label>
                  <Input 
                    id="seats" 
                    name="seats" 
                    type="number" 
                    min="1" 
                    max="8" 
                    required 
                    className="bg-card border-border"
                    value={seats}
                    onChange={(e) => setSeats(parseInt(e.target.value) || 3)}
                    data-testid="input-seats"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t("publish.form.notes")}</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                placeholder={t("publish.form.notesPlaceholder")} 
                className="resize-none bg-card border-border"
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                data-testid="input-notes"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-[#70b681] text-lg h-12 mt-2 rounded-full" 
              disabled={mutation.isPending}
              data-testid="button-publish"
            >
              {mutation.isPending ? t("publish.form.publishing") : t("publish.form.publishNow")}
            </Button>

            {!isAuthenticated && (
              <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground mt-3">
                <LogIn className="h-4 w-4" />
                <p>{t("publish.form.loginHint")}</p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
