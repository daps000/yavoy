import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { updateUserProfile, updateUserHomeLocation } from "@/lib/api";
import { User, Phone, Mail, Save, Loader2, MapPin, Navigation } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { useQueryClient } from "@tanstack/react-query";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, profile, isAuthenticated, isLoading: authLoading, refreshProfile } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [homeTown, setHomeTown] = useState("");
  const [isSavingHome, setIsSavingHome] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setPhone(profile.phone || "");
      setHomeTown(profile.homeTown || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateUserProfile({ firstName, lastName, phone });
      await refreshProfile();
      
      toast({
        title: t("profile.updated.title"),
        description: t("profile.updated.description"),
      });
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("profile.updated.error"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveHome = async () => {
    if (!homeTown.trim()) return;
    setIsSavingHome(true);
    try {
      await updateUserHomeLocation(homeTown.trim());
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      toast({
        title: t("profile.homeLocationSaved"),
        description: t("profile.homeLocationSavedDesc", { town: homeTown.trim() }),
      });
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("profile.homeLocationError"),
        variant: "destructive",
      });
    } finally {
      setIsSavingHome(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container px-4 md:px-6 py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container px-4 md:px-6 py-12 max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-serif text-foreground mb-3">{t("profile.title")}</h1>
        <p className="text-muted-foreground">{t("profile.subtitle")}</p>
      </div>

      <Card className="border border-border shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            {t("profile.personalData")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {t("profile.email")}
              </Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
                data-testid="input-email"
              />
              <p className="text-xs text-muted-foreground">{t("profile.emailCannotChange")}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("profile.firstName")}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t("profile.firstNamePlaceholder")}
                  className="bg-card border-border"
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("profile.lastName")}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t("profile.lastNamePlaceholder")}
                  className="bg-card border-border"
                  data-testid="input-last-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {t("profile.phoneWhatsapp")}
              </Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="600 000 000"
                className="bg-card border-border"
                data-testid="input-phone"
              />
              <p className="text-xs text-muted-foreground">
                {t("profile.phoneHint")}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                {t("profile.homeLocation")}
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <LocationAutocomplete
                    id="home-town"
                    placeholder={t("profile.homeLocationPlaceholder")}
                    value={homeTown}
                    onChange={setHomeTown}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSaveHome}
                  disabled={isSavingHome || !homeTown.trim() || homeTown === profile?.homeTown}
                  className="h-10 px-3"
                  data-testid="button-save-home-location"
                >
                  {isSavingHome ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("profile.homeLocationHint")}
              </p>
              {profile?.homeTown && (
                <p className="text-xs text-primary flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {t("profile.homeLocationSavedDesc", { town: profile.homeTown })}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isSaving}
              data-testid="button-save-profile"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("common.saving")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t("common.saveChanges")}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
