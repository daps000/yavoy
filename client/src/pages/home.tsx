import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { INITIAL_RIDES, Ride } from "@/lib/mock-data";
import { Car, MapPin, Calendar, Clock, Users, Phone, Leaf, Heart, Search, PlusCircle, MessageCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import heroImage from "@assets/generated_images/sunny_spanish_rural_road_with_green_fields.png";

export default function Home() {
  const [rides, setRides] = useState<Ride[]>(INITIAL_RIDES);
  const [filteredRides, setFilteredRides] = useState<Ride[]>(INITIAL_RIDES);
  
  // Filter states
  const [filterOrigin, setFilterOrigin] = useState("");
  const [filterDest, setFilterDest] = useState("");
  const [filterDate, setFilterDate] = useState("all");

  // Scroll handler
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Filter logic
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

  const handleNewRide = (ride: Ride) => {
    setRides([ride, ...rides]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold text-primary font-serif tracking-tight">Vavoy</span>
            </div>
            <span className="text-[10px] text-muted-foreground hidden sm:inline-block -mt-1 ml-8">Viajes compartidos entre pueblos</span>
          </div>
          
          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <button onClick={() => scrollToSection('como-funciona')} className="hover:text-primary transition-colors">Cómo funciona</button>
            <button onClick={() => scrollToSection('viajes')} className="hover:text-primary transition-colors">Ver viajes</button>
            <button onClick={() => scrollToSection('publicar')} className="hover:text-primary transition-colors">Publicar viaje</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-primary transition-colors">Preguntas</button>
          </nav>

          <Button 
            variant="outline" 
            size="sm" 
            className="md:hidden"
            onClick={() => scrollToSection('publicar')}
          >
            Publicar
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Carretera rural" 
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background"></div>
        </div>
        
        <div className="container relative z-10 px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-foreground tracking-tight leading-tight">
              Muévete entre pueblos <br/><span className="text-primary">compartiendo coche</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Vavoy conecta a vecinas y vecinos que necesitan ir al médico, al mercado o a la ciudad con quienes ya van en coche. Menos gastos, más comunidad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                className="text-lg px-8 h-14 shadow-lg bg-primary hover:bg-primary/90 rounded-full"
                onClick={() => scrollToSection('viajes')}
              >
                Ver viajes disponibles
              </Button>
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 h-14 shadow-sm bg-white text-primary border-primary/20 border hover:bg-secondary/50 rounded-full"
                onClick={() => scrollToSection('publicar')}
              >
                Publicar un viaje
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-16 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-serif text-primary mb-4">Cómo funciona</h2>
            <p className="text-muted-foreground">Tan simple como hablar con un vecino.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-none shadow-md bg-white/80 backdrop-blur">
              <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <PlusCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">1. Publica tu viaje</h3>
                <p className="text-muted-foreground">
                  Indica de dónde sales, a dónde vas y cuántos sitios libres tienes en el coche.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md bg-white/80 backdrop-blur">
              <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">2. Conecta por WhatsApp</h3>
                <p className="text-muted-foreground">
                  Las personas interesadas verán tu viaje y te escribirán directamente.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md bg-white/80 backdrop-blur">
              <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <Car className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">3. Compartís el trayecto</h3>
                <p className="text-muted-foreground">
                  Viajáis juntos, os hacéis compañía y compartís los gastos de gasolina.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ride List */}
      <section id="viajes" className="py-16 container px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h2 className="text-3xl font-bold font-serif text-foreground">Viajes disponibles</h2>
          <div className="hidden md:block text-sm text-muted-foreground">
            Hay {filteredRides.length} viajes publicados
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
            <div className="col-span-full text-center py-12 bg-secondary/20 rounded-xl border border-dashed">
              <Car className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
              <h3 className="text-lg font-medium">No hay viajes con estos filtros</h3>
              <p className="text-muted-foreground mb-4">¡Sé el primero en publicar uno!</p>
              <Button variant="outline" onClick={() => scrollToSection('publicar')}>Publicar viaje</Button>
            </div>
          )}
        </div>
      </section>

      {/* Publish Form */}
      <section id="publicar" className="py-16 bg-primary/5 border-y border-primary/10">
        <div className="container px-4 md:px-6 max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-serif text-primary mb-3">Publicar un viaje</h2>
            <p className="text-muted-foreground">Comparte tu coche y ayuda a tus vecinos a moverse.</p>
          </div>

          <Card className="border-none shadow-lg bg-white">
            <CardContent className="pt-6">
              <RideForm onNewRide={handleNewRide} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 container px-4 md:px-6 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold font-serif text-center mb-8">Preguntas frecuentes</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left text-lg">¿Vavoy es una empresa de transporte?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              No, Vavoy es solo una herramienta para conectar vecinos. No tenemos conductores contratados ni flota de coches. Son personas particulares compartiendo sus trayectos habituales.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left text-lg">¿Tengo que pagar algo por usar Vavoy?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              Usar la web es totalmente gratis. Los gastos del viaje (gasolina) los acordáis directamente entre conductor y pasajero. Vavoy no cobra ninguna comisión.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left text-lg">¿Cómo contacto con la persona conductora?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              En cada viaje verás un botón de WhatsApp o un teléfono. Contacta directamente con la persona para confirmar hora y lugar de recogida.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left text-lg">¿Es obligatorio compartir gastos?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              Es lo habitual y lo justo, pero depende de cada conductor. Algunos solo buscan compañía, otros necesitan ayuda con la gasolina. Habladlo antes de salir.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container px-4 md:px-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-6 w-6" />
            <span className="text-2xl font-bold font-serif">Vavoy</span>
          </div>
          <p className="text-primary-foreground/80 max-w-md mx-auto">
            Vavoy – piloto en fase de prueba para mejorar la movilidad rural.
          </p>
          <div className="pt-4 border-t border-primary-foreground/20 text-sm text-primary-foreground/60 max-w-2xl mx-auto">
            <p>Por ahora solo conectamos personas. Cada viaje se acuerda directamente entre quienes comparten coche. Vavoy no se hace responsable de cancelaciones o incidencias.</p>
          </div>
          <div className="pt-4 text-xs opacity-50">
            Hecho con <Heart className="inline h-3 w-3 mx-1 fill-current" /> para nuestros pueblos
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- Subcomponents ---

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

function RideForm({ onNewRide }: { onNewRide: (ride: Ride) => void }) {
  const { toast } = useToast();
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

    onNewRide(newRide);
    (e.target as HTMLFormElement).reset();
    setIsLoading(false);
    
    toast({
      title: "¡Viaje publicado!",
      description: "Tu viaje ya está visible para otros vecinos. ¡Gracias por compartir!",
      action: <CheckCircle2 className="h-6 w-6 text-green-500" />,
      duration: 5000,
    });
  };

  return (
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
  );
}
