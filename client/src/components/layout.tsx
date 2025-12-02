import { Link, useLocation } from "wouter";
import { Leaf, Heart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Inicio", href: "/" },
    { label: "Ver viajes disponibles", href: "/viajes" },
    { label: "Publicar viaje", href: "/publicar" },
    { label: "Preguntas frecuentes", href: "/faq" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex flex-col cursor-pointer hover:opacity-90 transition-opacity">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold text-primary font-serif tracking-tight">Vavoy</span>
            </div>
            <span className="text-[10px] text-muted-foreground hidden sm:inline-block -mt-1 ml-8">Viajes compartidos entre pueblos</span>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`transition-colors hover:text-primary ${location === item.href ? "text-primary font-bold" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Nav */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <VisuallyHidden>
                  <SheetTitle>Menú de navegación</SheetTitle>
                </VisuallyHidden>
                <div className="flex flex-col gap-6 mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Leaf className="h-6 w-6 text-primary" />
                    <span className="text-2xl font-bold text-primary font-serif">Vavoy</span>
                  </div>
                  <nav className="flex flex-col gap-4">
                    {navItems.map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        className={`text-lg font-medium hover:text-primary transition-colors ${location === item.href ? "text-primary" : "text-foreground/80"}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 mt-auto">
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
