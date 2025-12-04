import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { type InsertRide } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, LogIn, User } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRide } from "@/lib/api";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { useAuth } from "@/lib/auth-context";
import { saveDraft, loadDraft, isDraftPending, clearDraft } from "@/lib/publish-draft";

export default function PublishPage() {
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
  const [isRestoringDraft, setIsRestoringDraft] = useState(true);

  const profileName = profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : '';
  const profilePhone = profile?.phone || '';
  
  // Use draft contact if profile phone is empty (for users who just logged in after filling form)
  const effectivePhone = profilePhone || contact;

  const mutation = useMutation({
    mutationFn: createRide,
    onSuccess: () => {
      clearDraft();
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      queryClient.invalidateQueries({ queryKey: ["my-rides"] });
      toast({
        title: "¡Viaje publicado!",
        description: "Tu viaje ya está visible para otros vecinos. ¡Gracias por compartir!",
        action: <CheckCircle2 className="h-6 w-6 text-green-500" />,
        duration: 5000,
      });
      setTimeout(() => setLocation("/mis-viajes"), 1000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo publicar el viaje. Inténtalo de nuevo.",
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
      setDate(draft.date);
      setTime(draft.time);
      setSeats(draft.seats);
      setNotes(draft.notes);
      
      if (isAuthenticated && isDraftPending() && !hasAttemptedAutoSubmit.current) {
        hasAttemptedAutoSubmit.current = true;
        toast({
          title: "Borrador restaurado",
          description: "Pulsa 'Publicar' para completar la publicación de tu viaje.",
          duration: 5000,
        });
      }
    }
    setIsRestoringDraft(false);
  }, [isAuthenticated]);

  const validateForm = (): boolean => {
    const finalName = isAuthenticated ? profileName : driverName;
    const finalPhone = isAuthenticated ? effectivePhone : contact;
    
    if (!finalName || !origin || !destination || !date || !time) {
      toast({
        title: "Faltan datos",
        description: "Por favor, rellena todos los campos obligatorios.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!finalPhone) {
      toast({
        title: "Falta el teléfono",
        description: "Por favor, añade un número de teléfono para que puedan contactarte.",
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
      });
      setLocation("/entrar?from=publicar");
      return;
    }

    const newRide: InsertRide = {
      driverName: isAuthenticated ? profileName : driverName,
      origin,
      destination,
      date,
      time,
      seats,
      contact: isAuthenticated ? effectivePhone : contact,
      notes: notes || "",
    };

    mutation.mutate(newRide);
  };

  if (authLoading || isRestoringDraft) {
    return (
      <div className="container px-4 md:px-6 py-12 text-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-12 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold font-serif text-foreground mb-3">Publicar un viaje</h1>
        <p className="text-muted-foreground">Comparte tu coche y ayuda a tus vecinos a moverse.</p>
      </div>

      <Card className="border border-border shadow-lg bg-white">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isAuthenticated ? (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
                <User className="h-5 w-5 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Publicando como: {profileName}</p>
                  {effectivePhone ? (
                    <p className="text-muted-foreground">Teléfono: {effectivePhone}</p>
                  ) : (
                    <p className="text-amber-600">Añade tu teléfono en tu perfil para que puedan contactarte</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tu Nombre</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Ej. María" 
                    required 
                    className="bg-card border-border"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    data-testid="input-driver-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Teléfono / WhatsApp</Label>
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
                <Label htmlFor="origin_form">Origen</Label>
                <LocationAutocomplete
                  id="origin_form"
                  placeholder="Pueblo de salida"
                  value={origin}
                  onChange={setOrigin}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination_form">Destino</Label>
                <LocationAutocomplete
                  id="destination_form"
                  placeholder="Pueblo o ciudad de llegada"
                  value={destination}
                  onChange={setDestination}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_form">Fecha</Label>
                <Input 
                  id="date_form" 
                  name="date" 
                  type="date" 
                  required 
                  min={new Date().toISOString().split('T')[0]} 
                  className="bg-card border-border"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  data-testid="input-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time_form">Hora</Label>
                <Input 
                  id="time_form" 
                  name="time" 
                  type="time" 
                  required 
                  className="bg-card border-border"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  data-testid="input-time"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seats">Plazas libres</Label>
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

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                placeholder="Ej. Vuelvo sobre las 18h, salgo de la plaza, llevo maletero vacío..." 
                className="resize-none bg-card border-border"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                data-testid="input-notes"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-[#70b681] text-lg h-12 mt-2 rounded-full" 
              disabled={mutation.isPending}
              data-testid="button-publish"
            >
              {mutation.isPending ? "Publicando..." : "Publicar viaje ahora"}
            </Button>

            {!isAuthenticated && (
              <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground mt-3">
                <LogIn className="h-4 w-4" />
                <p>Al pulsar publicar te pediremos iniciar sesión para gestionar tu viaje después.</p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
