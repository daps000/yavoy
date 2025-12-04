import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Car, Users, MapPin, Shield, Loader2 } from "lucide-react";
import logoImage from "@assets/logo-verde.png";

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
            src={logoImage} 
            alt="YaVoy" 
            className="h-16 mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold font-serif text-foreground mb-3">
            Bienvenido a YaVoy
          </h1>
          <p className="text-muted-foreground text-lg">
            La forma más fácil de compartir viajes entre vecinos
          </p>
        </div>

        <Card className="border-2 border-primary/20 shadow-xl bg-white">
          <CardContent className="pt-8 pb-8 px-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Publica tus viajes</h3>
                    <p className="text-sm text-muted-foreground">Comparte tu coche y ayuda a tus vecinos</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Encuentra compañeros</h3>
                    <p className="text-sm text-muted-foreground">Conecta con vecinos que van al mismo sitio</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Sin complicaciones</h3>
                    <p className="text-sm text-muted-foreground">Contacto directo por WhatsApp, sin pagos online</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button
                  onClick={login}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-medium"
                  data-testid="button-login-main"
                >
                  <Shield className="h-5 w-5 mr-2" />
                  Iniciar sesión de forma segura
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  Puedes usar tu cuenta de Google, Apple, GitHub o email
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Al continuar, aceptas compartir viajes de manera responsable y respetuosa con tus vecinos.
        </p>
      </div>
    </div>
  );
}
