import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Circle, Calendar } from "lucide-react";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { Input } from "@/components/ui/input";
import heroImage from "@assets/road-car_1764761779971.jpg";
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
      <section className="relative w-full py-16 md:py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Carretera rural" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent"></div>
        </div>
        
        <div className="container relative z-10 px-4 md:px-6">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-foreground tracking-tight leading-tight">
              Muévete entre pueblos <br/><span className="text-primary">compartiendo coche</span>
            </h1>
            <p className="md:text-xl max-w-xl text-[14px] text-[#454545] ml-[3px] mr-[3px]">
              YaVoy conecta a vecinas y vecinos que necesitan ir al médico, al mercado o a la ciudad con quienes ya van en coche. Menos gastos, más comunidad.
            </p>
            
            {/* Search Card */}
            <form onSubmit={handleSearch} className="pt-4">
              <Card className="border-0 shadow-xl bg-white rounded-2xl overflow-hidden max-w-md">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                    <Circle className="h-5 w-5 text-primary" />
                    <input
                      type="text"
                      placeholder="De"
                      value={searchOrigin}
                      onChange={(e) => setSearchOrigin(e.target.value)}
                      className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground"
                      data-testid="input-hero-origin"
                    />
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                    <Circle className="h-5 w-5 text-primary" />
                    <input
                      type="text"
                      placeholder="A"
                      value={searchDest}
                      onChange={(e) => setSearchDest(e.target.value)}
                      className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground"
                      data-testid="input-hero-dest"
                    />
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                    <Calendar className="h-5 w-5 text-primary" />
                    <Select value={searchDate} onValueChange={setSearchDate}>
                      <SelectTrigger className="flex-1 border-0 bg-transparent shadow-none p-0 h-auto focus:ring-0">
                        <SelectValue placeholder="Hoy" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[99]">
                        <SelectItem value="all">Cualquier fecha</SelectItem>
                        <SelectItem value="today">Hoy</SelectItem>
                        <SelectItem value="tomorrow">Mañana</SelectItem>
                        <SelectItem value="upcoming">Próximos días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg bg-primary hover:bg-[#70b681] text-white rounded-none">
                    Buscar
                  </Button>
                </CardContent>
              </Card>
            </form>
            
            <div className="pt-2">
              <Link href="/publicar">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 h-14 shadow-sm bg-white text-primary border-primary border-2 hover:bg-primary/10 rounded-full"
                >
                  Publicar un viaje
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* How it works */}
      <section id="como-funciona" className="py-16 bg-card">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-serif text-foreground mb-4">Cómo funciona</h2>
            <p className="text-muted-foreground text-[15px]">Tan simple como pedirle un favor a un vecino</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-[0px] pb-[0px]">
            <Card className="border border-border shadow-sm bg-white relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-md">
                1
              </div>
              <CardContent className="pt-8 pb-6 flex flex-col items-center text-center space-y-3">
                <h3 className="text-xl font-bold text-foreground">Publica tu viaje</h3>
                <p className="text-muted-foreground text-sm">
                  Indica de dónde sales, a dónde vas y cuántos sitios libres tienes en el coche.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-sm bg-white relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-md">
                2
              </div>
              <CardContent className="pt-8 pb-6 flex flex-col items-center text-center space-y-3">
                <h3 className="text-xl font-bold text-foreground">Conecta por WhatsApp</h3>
                <p className="text-muted-foreground text-sm">
                  Las personas interesadas verán tu viaje y te escribirán directamente.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-sm bg-white relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-md">
                3
              </div>
              <CardContent className="pt-8 pb-6 flex flex-col items-center text-center space-y-3">
                <h3 className="text-xl font-bold text-foreground">Compartís el trayecto</h3>
                <p className="text-muted-foreground text-sm">
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
            <Card className="border border-border shadow-lg bg-white">
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                  <div className="space-y-2">
                    <Label htmlFor="search-origin" className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Origen</Label>
                    <LocationAutocomplete
                      id="search-origin"
                      placeholder="¿De dónde sales?"
                      value={searchOrigin}
                      onChange={setSearchOrigin}
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="search-dest" className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Destino</Label>
                    <LocationAutocomplete
                      id="search-dest"
                      placeholder="¿A dónde vas?"
                      value={searchDest}
                      onChange={setSearchDest}
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="search-date" className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Fecha</Label>
                    <Select value={searchDate} onValueChange={setSearchDate}>
                      <SelectTrigger className="bg-white border-border h-12 min-w-[160px]">
                        <SelectValue placeholder="Cualquier fecha" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[99]">
                        <SelectItem value="all">Cualquier fecha</SelectItem>
                        <SelectItem value="today">Hoy</SelectItem>
                        <SelectItem value="tomorrow">Mañana</SelectItem>
                        <SelectItem value="upcoming">Próximos días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-6 h-14 text-lg bg-accent hover:bg-[#d9a535] text-white rounded-full">
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
