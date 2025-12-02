import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { type InsertRide } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRide } from "@/lib/api";

export default function PublishPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createRide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      toast({
        title: "¡Viaje publicado!",
        description: "Tu viaje ya está visible para otros vecinos. ¡Gracias por compartir!",
        action: <CheckCircle2 className="h-6 w-6 text-green-500" />,
        duration: 5000,
      });
      setTimeout(() => setLocation("/viajes"), 1000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo publicar el viaje. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const newRide: InsertRide = {
      driverName: formData.get("name") as string,
      origin: formData.get("origin") as string,
      destination: formData.get("destination") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      seats: parseInt(formData.get("seats") as string),
      contact: formData.get("contact") as string,
      notes: (formData.get("notes") as string) || "",
    };

    mutation.mutate(newRide);
    form.reset();
  };

  return (
    <div className="container px-4 md:px-6 py-12 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold font-serif text-primary mb-3">Publicar un viaje</h1>
        <p className="text-muted-foreground">Comparte tu coche y ayuda a tus vecinos a moverse.</p>
      </div>

      <Card className="border-none shadow-lg bg-white">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tu Nombre</Label>
                <Input id="name" name="name" placeholder="Ej. María" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Teléfono / WhatsApp</Label>
                <Input id="contact" name="contact" placeholder="600 000 000" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin_form">Origen</Label>
                <Input id="origin_form" name="origin" placeholder="Pueblo de salida" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination_form">Destino</Label>
                <Input id="destination_form" name="destination" placeholder="Pueblo o ciudad de llegada" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_form">Fecha</Label>
                <Input id="date_form" name="date" type="date" required min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time_form">Hora</Label>
                <Input id="time_form" name="time" type="time" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seats">Plazas libres</Label>
                <Input id="seats" name="seats" type="number" min="1" max="8" defaultValue="3" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                placeholder="Ej. Salgo de la plaza, paso por X pueblo, llevo maletero vacío..." 
                className="resize-none"
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-lg h-12 mt-2" disabled={mutation.isPending}>
              {mutation.isPending ? "Publicando..." : "Publicar viaje ahora"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
