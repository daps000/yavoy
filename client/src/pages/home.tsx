import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search } from "lucide-react";
import heroImage from "@assets/generated_images/sunny_spanish_rural_road_with_green_fields.png";
import { Link, useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchOrigin, setSearchOrigin] = useState("");
  const [searchDest, setSearchDest] = useState("");
  const [searchDate, setSearchDate] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchOrigin) params.set("origen", searchOrigin);
    if (searchDest) params.set("destino", searchDest);
    if (searchDate !== "all") params.set("fecha", searchDate);
    
    const queryString = params.toString();
    setLocation(`/viajes${queryString ? `?${queryString}` : ""}`);
  };

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
              <Link href="/viajes" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="text-lg px-8 h-14 shadow-lg bg-primary hover:bg-primary/90 rounded-full w-full"
                >
                  Ver viajes disponibles
                </Button>
              </Link>
              <Link href="/publicar" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="text-lg px-8 h-14 shadow-sm bg-white text-primary border-primary/20 border hover:bg-secondary/50 rounded-full w-full"
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
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold">Publica tu viaje</h3>
                <p className="text-muted-foreground">
                  Indica de dónde sales, a dónde vas y cuántos sitios libres tienes en el coche.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md bg-white/80 backdrop-blur">
              <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold">Conecta por WhatsApp</h3>
                <p className="text-muted-foreground">
                  Las personas interesadas verán tu viaje y te escribirán directamente.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md bg-white/80 backdrop-blur">
              <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold">Compartís el trayecto</h3>
                <p className="text-muted-foreground">
                  Viajáis juntos, os hacéis compañía y compartís los gastos de gasolina.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 container px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-serif text-foreground mb-4">Busca tu viaje</h2>
            <p className="text-muted-foreground">Encuentra vecinos que vayan a tu destino.</p>
          </div>

          <form onSubmit={handleSearch}>
            <Card className="border-none shadow-lg bg-white">
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                  <div className="space-y-2">
                    <Label htmlFor="search-origin" className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Origen</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="search-origin" 
                        placeholder="¿De dónde sales?" 
                        className="pl-9 border-muted bg-secondary/20 h-12"
                        value={searchOrigin}
                        onChange={(e) => setSearchOrigin(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="search-dest" className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Destino</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="search-dest" 
                        placeholder="¿A dónde vas?" 
                        className="pl-9 border-muted bg-secondary/20 h-12"
                        value={searchDest}
                        onChange={(e) => setSearchDest(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="search-date" className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Fecha</Label>
                    <Select value={searchDate} onValueChange={setSearchDate}>
                      <SelectTrigger className="bg-secondary/20 border-muted h-12 min-w-[160px]">
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
                </div>

                <Button type="submit" className="w-full mt-6 h-14 text-lg bg-primary hover:bg-primary/90 rounded-full">
                  <Search className="mr-2 h-5 w-5" /> Buscar viajes
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </section>
    </div>
  );
}
