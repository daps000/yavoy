import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import logoImage from "@assets/logo-verde.png";

export default function NewPasswordPage() {
  const { updatePassword } = useAuth();
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("error")) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const errorDescription = hashParams.get("error_description");
      if (errorDescription) {
        const message = decodeURIComponent(errorDescription.replace(/\+/g, " "));
        if (message.includes("invalid or has expired") || message.includes("otp_expired")) {
          setError("El enlace ha caducado. Solicita uno nuevo desde la página de recuperación.");
        } else {
          setError(message);
        }
      }
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const translateError = (error: string): string => {
    if (error.includes("should be at least")) {
      return "La contraseña debe tener al menos 6 caracteres";
    }
    if (error.includes("same password")) {
      return "La nueva contraseña debe ser diferente a la anterior";
    }
    return error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsSubmitting(true);

    const result = await updatePassword(password);

    if (result.error) {
      setError(translateError(result.error));
    } else {
      setSuccess(true);
      setTimeout(() => {
        setLocation("/entrar");
      }, 3000);
    }
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-xl font-bold text-foreground">
                ¡Contraseña actualizada!
              </h2>
              <p className="text-muted-foreground">
                Tu contraseña ha sido cambiada correctamente. Redirigiendo al inicio de sesión...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img src={logoImage} alt="YaVoy" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Nueva contraseña
            </CardTitle>
            <CardDescription className="text-base">
              Introduce tu nueva contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                    data-testid="input-new-password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Repite la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                    data-testid="input-confirm-password"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg" data-testid="text-password-error">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
                data-testid="button-update-password"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Guardar contraseña
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
