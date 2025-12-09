import { Link, useLocation } from "wouter";
import { Heart, Menu, PlusCircle, User, LogOut, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import logoImage from "@assets/logo-verde.png";
import logoWhite from "@assets/logo-yavoy-white.png";
import logoTrans from "@assets/logo-trans.png";
import { useAuth } from "@/lib/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const navItems = [
    { label: "Inicio", href: "/" },
    { label: "Ver viajes disponibles", href: "/viajes" },
    { label: "Publicar viaje", href: "/publicar" },
    { label: "Preguntas frecuentes", href: "/faq" },
  ];

  const getUserDisplayName = () => {
    if (user?.firstName) return user.firstName;
    if (user?.email) return user.email.split("@")[0];
    return "Usuario";
  };

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
          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground items-center">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`transition-colors hover:text-primary ${location === item.href ? "text-primary font-bold" : ""}`}
              >
                {item.label}
              </Link>
            ))}
            
            {!isLoading && (
              isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2" data-testid="button-user-menu">
                      <User className="h-4 w-4" />
                      <span>{getUserDisplayName()}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Link href="/mi-perfil">
                      <DropdownMenuItem className="cursor-pointer font-medium" data-testid="button-my-profile">
                        <User className="h-4 w-4 mr-2" />
                        {getUserDisplayName()}
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem className="text-muted-foreground text-xs">
                      {user?.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <Link href="/mis-viajes">
                      <DropdownMenuItem className="cursor-pointer" data-testid="button-my-rides">
                        <Car className="h-4 w-4 mr-2" />
                        Mis viajes
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600" data-testid="button-logout">
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/entrar">
                  <Button variant="outline" className="ml-2" data-testid="button-login">
                    Iniciar sesión
                  </Button>
                </Link>
              )
            )}
          </nav>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center gap-0">
            <Link href="/publicar">
              <button className="p-2 text-primary touch-manipulation" style={{ minWidth: '48px', minHeight: '48px' }}>
                <PlusCircle style={{ width: '28px', height: '28px' }} />
              </button>
            </Link>
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="p-2 touch-manipulation" style={{ minWidth: '48px', minHeight: '48px' }}>
                  <Menu style={{ width: '28px', height: '28px' }} />
                </button>
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
                  
                  <div className="border-t pt-4 w-full">
                    {!isLoading && (
                      isAuthenticated ? (
                        <div className="flex flex-col gap-2">
                          <Link 
                            href="/mi-perfil"
                            className="flex items-center gap-2 text-foreground font-medium"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            <span>{getUserDisplayName()}</span>
                          </Link>
                          <span className="text-xs text-muted-foreground">{user?.email}</span>
                          <Link 
                            href="/mis-viajes"
                            className="flex items-center gap-2 mt-3 text-primary font-medium"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Car className="h-4 w-4" />
                            Mis viajes
                          </Link>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              logout();
                            }}
                            className="mt-2 text-red-600 border-red-200"
                            data-testid="button-mobile-logout"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Cerrar sesión
                          </Button>
                        </div>
                      ) : (
                        <Link 
                          href="/entrar"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full"
                        >
                          <Button
                            className="w-full"
                            data-testid="button-mobile-login"
                          >
                            Iniciar sesión
                          </Button>
                        </Link>
                      )
                    )}
                  </div>
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
              src={logoTrans} 
              alt="YaVoy" 
              className="h-10 w-auto"
            />
          </div>
          <p className="text-primary-foreground/80 max-w-md mx-auto text-[14px]">Vavoy es un piloto en fase de pruebas. Conectamos personas, no operamos transporte</p>
          <div className="pt-4 text-xs opacity-50">
            Hecho con <Heart className="inline h-3 w-3 mx-1 fill-current" /> para nuestros pueblos
          </div>
        </div>
      </footer>
    </div>
  );
}
