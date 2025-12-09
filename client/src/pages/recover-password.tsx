import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import logoImage from "@assets/logo-verde.png";

export default function RecoverPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const translateError = (error: string): string => {
    if (error.includes("User not found")) {
      return "No existe una cuenta con este email";
    }
    if (error.includes("rate limit")) {
      return "Demasiados intentos. Espera unos minutos.";
    }
    return error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const result = await resetPassword(email);

    if (result.error) {
      setError(translateError(result.error));
    } else {
      setSuccessMessage("Te hemos enviado un email con un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img src={logoImage} alt="YaVoy" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Recuperar contraseña
            </CardTitle>
            <CardDescription className="text-base">
              Introduce tu email y te enviaremos un enlace para restablecer tu contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    data-testid="input-recover-email"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg" data-testid="text-recover-error">
                  {error}
                </p>
              )}

              {successMessage && (
                <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg" data-testid="text-recover-success">
                  {successMessage}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
                data-testid="button-recover-submit"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Enviar enlace
              </Button>

              <Link href="/entrar" className="block">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  data-testid="button-back-to-login"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a iniciar sesión
                </Button>
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
