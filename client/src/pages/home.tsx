import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, PlusCircle, MessageCircle } from "lucide-react";
import heroImage from "@assets/generated_images/sunny_spanish_rural_road_with_green_fields.png";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="w-full">
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
              <Link href="/viajes">
                <Button 
                  size="lg" 
                  className="text-lg px-8 h-14 shadow-lg bg-primary hover:bg-primary/90 rounded-full w-full sm:w-auto"
                >
                  Ver viajes disponibles
                </Button>
              </Link>
              <Link href="/publicar">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="text-lg px-8 h-14 shadow-sm bg-white text-primary border-primary/20 border hover:bg-secondary/50 rounded-full w-full sm:w-auto"
                >
                  Publicar un viaje
                </Button>
              </Link>
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
    </div>
  );
}
