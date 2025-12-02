import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Ride } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";
import { useRides } from "@/lib/rides-context";
import { useLocation } from "wouter";

export default function PublishPage() {
  const { addRide } = useRides();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const formData = new FormData(e.currentTarget);
    const newRide: Ride = {
      id: Math.random().toString(36).substr(2, 9),
      driverName: formData.get("name") as string,
      origin: formData.get("origin") as string,
      destination: formData.get("destination") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      seats: parseInt(formData.get("seats") as string),
      contact: formData.get("contact") as string,
      notes: formData.get("notes") as string,
    };

    addRide(newRide);
    setIsLoading(false);
    
    toast({
      title: "¡Viaje publicado!",
      description: "Tu viaje ya está visible para otros vecinos. ¡Gracias por compartir!",
      action: <CheckCircle2 className="h-6 w-6 text-green-500" />,
      duration: 5000,
    });

    // Redirect to rides page to see the new ride
    setTimeout(() => setLocation("/viajes"), 1000);
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

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-lg h-12 mt-2" disabled={isLoading}>
              {isLoading ? "Publicando..." : "Publicar viaje ahora"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
