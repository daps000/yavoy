import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "react-i18next";

export default function NewPasswordPage() {
  const { updatePassword } = useAuth();
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("error")) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const errorDescription = hashParams.get("error_description");
      if (errorDescription) {
        const message = decodeURIComponent(errorDescription.replace(/\+/g, " "));
        if (message.includes("invalid or has expired") || message.includes("otp_expired")) {
          setError(t("auth.linkExpired"));
        } else {
          setError(message);
        }
      }
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const translateError = (error: string): string => {
    if (error.includes("should be at least")) {
      return t("auth.passwordMinChars");
    }
    if (error.includes("same password")) {
      return t("auth.passwordMustDiffer");
    }
    return error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("auth.passwordsNoMatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("auth.passwordMinChars"));
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
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-xl font-bold text-foreground">
            {t("auth.passwordUpdated")}
          </h2>
          <p className="text-muted-foreground">
            {t("auth.passwordUpdatedMessage")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {t("auth.newPasswordTitle")}
          </h1>
          <p className="text-muted-foreground">
            {t("auth.newPasswordSubtitle")}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.newPasswordLabel")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder={t("auth.passwordMinChars")}
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
            <Label htmlFor="confirm-password">{t("auth.confirmPasswordLabel")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type="password"
                placeholder={t("auth.confirmPasswordPlaceholder")}
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
            {t("auth.updatePasswordButton")}
          </Button>
        </form>
      </div>
    </div>
  );
}
