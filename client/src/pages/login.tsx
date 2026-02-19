import { useState, useEffect } from "react";
import { useLocation, useSearch, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { Car, Users, MapPin, Loader2, Mail, Lock, User, CheckCircle } from "lucide-react";
import logoImage from "@assets/logo-verde.png";
import { useTranslation } from "react-i18next";

const RETURN_URL_KEY = "yavoy_login_return";

export default function LoginPage() {
  const { isAuthenticated, isLoading, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const fromPublish = params.get("from") === "publicar";
  const { t } = useTranslation();
  
  useEffect(() => {
    if (fromPublish) {
      sessionStorage.setItem(RETURN_URL_KEY, "/publicar");
    }
  }, [fromPublish]);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const savedReturnUrl = sessionStorage.getItem(RETURN_URL_KEY);
      sessionStorage.removeItem(RETURN_URL_KEY);
      
      if (fromPublish || savedReturnUrl === "/publicar") {
        setLocation("/publicar");
      } else {
        setLocation("/mis-viajes?bienvenido=1");
      }
    }
  }, [isLoading, isAuthenticated, setLocation, fromPublish]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("error")) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const errorCode = hashParams.get("error_code");
      const errorDescription = hashParams.get("error_description");
      
      if (errorCode || errorDescription) {
        const message = errorDescription 
          ? decodeURIComponent(errorDescription.replace(/\+/g, " "))
          : errorCode;
        setError(translateError(message || t("common.unknownError")));
        window.history.replaceState(null, "", window.location.pathname);
        window.scrollTo(0, 0);
      }
    }
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    const result = await signInWithEmail(email, password);
    
    if (result.error) {
      setError(translateError(result.error));
    }
    setIsSubmitting(false);
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError(t("auth.enterEmailFirst"));
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsResettingPassword(true);
    
    const result = await resetPassword(email);
    
    if (result.error) {
      setError(translateError(result.error));
    } else {
      setSuccessMessage(t("auth.emailSentResetInstructions"));
    }
    setIsResettingPassword(false);
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    
    if (password.length < 6) {
      setError(t("auth.passwordMinChars"));
      setIsSubmitting(false);
      return;
    }
    
    const result = await signUpWithEmail(email, password, firstName, lastName);
    
    if (result.error) {
      setError(translateError(result.error));
    } else {
      setSuccessMessage(t("auth.accountCreated"));
    }
    setIsSubmitting(false);
  };

  const translateError = (error: string): string => {
    if (error.includes("Invalid login credentials")) {
      return t("auth.wrongCredentials");
    }
    if (error.includes("Email not confirmed")) {
      return t("auth.confirmEmail");
    }
    if (error.includes("User already registered")) {
      return t("auth.emailAlreadyRegistered");
    }
    if (error.includes("Password should be at least")) {
      return t("auth.passwordMinChars");
    }
    if (error.includes("invalid or has expired") || error.includes("otp_expired")) {
      return t("auth.linkExpired");
    }
    if (error.includes("access_denied")) {
      return t("auth.accessDenied");
    }
    return error;
  };

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

  if (fromPublish) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold font-serif text-foreground mb-3">
              {t("auth.almostThere")}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t("auth.almostThereDesc")}
            </p>
          </div>

          <Card className="border-2 border-primary/20 shadow-xl bg-white">
            <CardContent className="pt-6 pb-6 px-6">
              <Button
                onClick={signInWithGoogle}
                variant="outline"
                className="w-full py-6 text-base font-medium border-2 hover:bg-muted"
                data-testid="button-google-login-publish"
              >
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t("auth.googleButton")}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">{t("auth.orWithEmail")}</span>
                </div>
              </div>

              <Tabs defaultValue="register" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="register">{t("auth.registerTitle")}</TabsTrigger>
                  <TabsTrigger value="login">{t("auth.haveAccount")}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t("auth.emailLabel")}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder={t("auth.emailPlaceholder")}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                          data-testid="input-login-email-publish"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t("auth.passwordLabel")}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                          data-testid="input-login-password-publish"
                        />
                      </div>
                    </div>
                    
                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
                    )}
                    
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isSubmitting}
                      data-testid="button-email-login-publish"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {t("auth.loginButton")}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleEmailSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="register-firstname">{t("profile.firstName")}</Label>
                        <Input
                          id="register-firstname"
                          type="text"
                          placeholder={t("profile.firstNamePlaceholder")}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          data-testid="input-register-firstname-publish"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-lastname">{t("profile.lastName")}</Label>
                        <Input
                          id="register-lastname"
                          type="text"
                          placeholder={t("profile.lastNamePlaceholder")}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          data-testid="input-register-lastname-publish"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">{t("auth.emailLabel")}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder={t("auth.emailPlaceholder")}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                          data-testid="input-register-email-publish"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">{t("auth.passwordLabel")}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-password"
                          type="password"
                          placeholder={t("auth.passwordMinChars")}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                          minLength={6}
                          data-testid="input-register-password-publish"
                        />
                      </div>
                    </div>
                    
                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
                    )}
                    
                    {successMessage && (
                      <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{successMessage}</p>
                    )}
                    
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isSubmitting}
                      data-testid="button-email-register-publish"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {t("auth.createAndPublish")}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            {t("auth.draftSavedOnLogin")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-serif text-foreground mb-3">
            {t("auth.welcomeTitle")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("auth.welcomeSubtitle")}
          </p>
        </div>

        <Card className="border-2 border-primary/20 shadow-xl bg-white">
          <CardContent className="pt-6 pb-6 px-6">
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{t("auth.feature1Title")}</h3>
                  <p className="text-sm text-muted-foreground">{t("auth.feature1Desc")}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{t("auth.feature2Title")}</h3>
                  <p className="text-sm text-muted-foreground">{t("auth.feature2Desc")}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{t("auth.feature3Title")}</h3>
                  <p className="text-sm text-muted-foreground">{t("auth.feature3Desc")}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <Button
                onClick={signInWithGoogle}
                variant="outline"
                className="w-full py-6 text-base font-medium border-2 hover:bg-muted"
                data-testid="button-google-login"
              >
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t("auth.googleButton")}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">{t("auth.orWithEmail")}</span>
                </div>
              </div>

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">{t("auth.loginButton")}</TabsTrigger>
                  <TabsTrigger value="register">{t("auth.registerTab")}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t("auth.emailLabel")}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder={t("auth.emailPlaceholder")}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                          data-testid="input-login-email"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t("auth.passwordLabel")}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                          data-testid="input-login-password"
                        />
                      </div>
                      <Link href="/recuperar" className="text-xs text-primary hover:underline mt-1 block" data-testid="link-forgot-password">
                        {t("auth.forgotPassword")}
                      </Link>
                    </div>
                    
                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
                    )}
                    
                    {successMessage && (
                      <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{successMessage}</p>
                    )}
                    
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isSubmitting}
                      data-testid="button-email-login"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {t("auth.loginButton")}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleEmailSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="register-firstname">{t("profile.firstName")}</Label>
                        <Input
                          id="register-firstname"
                          type="text"
                          placeholder={t("profile.firstNamePlaceholder")}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          data-testid="input-register-firstname"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-lastname">{t("profile.lastName")}</Label>
                        <Input
                          id="register-lastname"
                          type="text"
                          placeholder={t("profile.lastNamePlaceholder")}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          data-testid="input-register-lastname"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">{t("auth.emailLabel")}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder={t("auth.emailPlaceholder")}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                          data-testid="input-register-email"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">{t("auth.passwordLabel")}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-password"
                          type="password"
                          placeholder={t("auth.passwordMinChars")}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                          minLength={6}
                          data-testid="input-register-password"
                        />
                      </div>
                    </div>
                    
                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
                    )}
                    
                    {successMessage && (
                      <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{successMessage}</p>
                    )}
                    
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isSubmitting}
                      data-testid="button-email-register"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {t("auth.registerButton")}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <p className="text-center text-xs text-muted-foreground mt-4">
                {t("auth.termsNotice")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
