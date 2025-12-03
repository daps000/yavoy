import { Link, useLocation } from "wouter";
import { Heart, Menu, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import logoImage from "@assets/logo-verde.png";
import logoWhite from "@assets/logo-yavoy-white.png";

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
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center cursor-pointer hover:opacity-90 transition-opacity">
            <img 
              src={logoImage} 
              alt="YaVoy" 
              className="h-10 md:h-12 w-auto"
            />
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
          <div className="md:hidden flex items-center gap-2">
            <Link href="/publicar">
              <Button variant="ghost" size="icon" className="h-12 w-12 text-primary">
                <PlusCircle className="h-8 w-8" />
              </Button>
            </Link>
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-14 w-14">
                  <Menu className="h-10 w-10" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <VisuallyHidden>
                  <SheetTitle>Menú de navegación</SheetTitle>
                </VisuallyHidden>
                <div className="flex flex-col gap-6 mt-8 items-start">
                  <img 
                    src={logoImage} 
                    alt="YaVoy" 
                    className="h-10 w-auto object-contain"
                  />
                  <nav className="flex flex-col gap-4">
                    {navItems.map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        className="font-medium hover:text-primary transition-colors text-foreground/80 text-[16px]"
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
            <img 
              src={logoWhite} 
              alt="YaVoy" 
              className="h-10 w-auto"
            />
          </div>
          <p className="text-primary-foreground/80 max-w-md mx-auto">
            YaVoy – piloto en fase de prueba para mejorar la movilidad rural.
          </p>
          <div className="pt-4 text-xs opacity-50">
            Hecho con <Heart className="inline h-3 w-3 mx-1 fill-current" /> para nuestros pueblos
          </div>
        </div>
      </footer>
    </div>
  );
}
