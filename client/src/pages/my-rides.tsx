import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyRides, deleteRide, updateRide } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { RideCard } from "./rides";
import { Button } from "@/components/ui/button";
import { Car, Plus, PartyPopper } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Ride } from "@shared/schema";

export default function MyRidesPage() {
  const { t } = useTranslation();
  const { isAuthenticated, profile, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [editingRide, setEditingRide] = useState<Ride | null>(null);
  const [deleteConfirmRide, setDeleteConfirmRide] = useState<Ride | null>(null);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    if (params.get("bienvenido") === "1" && !hasShownWelcome && isAuthenticated) {
      setHasShownWelcome(true);
      const userName = profile?.firstName || t("myRides.welcome.neighbor");
      toast({
        title: t("myRides.welcome.title", { name: userName }),
        description: t("myRides.welcome.description"),
        action: <PartyPopper className="h-6 w-6 text-primary" />,
        duration: 5000,
      });
      navigate("/mis-viajes", { replace: true });
    }
  }, [searchString, hasShownWelcome, isAuthenticated, profile, toast, navigate]);
  
  const { data: myRides = [], isLoading } = useQuery({
    queryKey: ["my-rides"],
    queryFn: fetchMyRides,
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRide(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-rides"] });
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      toast({
        title: t("myRides.deleted.title"),
        description: t("myRides.deleted.description"),
      });
      setDeleteConfirmRide(null);
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error"),
        description: error.message || t("myRides.deleted.error"),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Ride> }) => updateRide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-rides"] });
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      toast({
        title: t("myRides.updated.title"),
        description: t("myRides.updated.description"),
      });
      setEditingRide(null);
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error"),
        description: error.message || t("myRides.updated.error"),
        variant: "destructive",
      });
    },
  });

  const handleEdit = (ride: Ride) => {
    setEditingRide(ride);
  };

  const handleDelete = (ride: Ride) => {
    setDeleteConfirmRide(ride);
  };

  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingRide) return;
    
    const formData = new FormData(e.currentTarget);
    const data = {
      origin: formData.get("origin") as string,
      destination: formData.get("destination") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      seats: parseInt(formData.get("seats") as string),
      notes: formData.get("notes") as string || undefined,
    };
    
    updateMutation.mutate({ id: editingRide.id, data });
  };

  if (authLoading) {
    return (
      <div className="container px-4 md:px-6 py-12 text-center">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container px-4 md:px-6 py-12">
        <div className="text-center py-16 bg-secondary/20 rounded-xl border border-dashed">
          <Car className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
          <h3 className="text-lg font-medium">{t("myRides.loginRequired.title")}</h3>
          <p className="text-muted-foreground mb-6">
            {t("myRides.loginRequired.description")}
          </p>
          <Button onClick={() => navigate("/entrar")} data-testid="button-login-myrides">
            {t("nav.login")}
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container px-4 md:px-6 py-12 text-center">
        <p className="text-muted-foreground">{t("myRides.loading")}</p>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">{t("myRides.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("myRides.subtitle")}</p>
        </div>
        <Link href="/publicar">
          <Button className="bg-primary hover:bg-[#70b681]" data-testid="button-publish-new">
            <Plus className="mr-2 h-4 w-4" /> {t("myRides.publishNew")}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {myRides.length > 0 ? (
          myRides.map((ride) => (
            <RideCard 
              key={ride.id} 
              ride={ride} 
              showAsOwn={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-16 bg-secondary/20 rounded-xl border border-dashed">
            <Car className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <h3 className="text-lg font-medium">{t("myRides.noRides.title")}</h3>
            <p className="text-muted-foreground mb-6">{t("myRides.noRides.description")}</p>
            <Link href="/publicar">
              <Button data-testid="button-publish-first">{t("rides.card.publishRide")}</Button>
            </Link>
          </div>
        )}
      </div>

      <Dialog open={!!editingRide} onOpenChange={(open) => !open && setEditingRide(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("myRides.edit.title")}</DialogTitle>
            <DialogDescription>
              {t("myRides.edit.description")}
            </DialogDescription>
          </DialogHeader>
          {editingRide && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">{t("publish.form.origin")}</Label>
                  <Input
                    id="origin"
                    name="origin"
                    defaultValue={editingRide.origin}
                    required
                    data-testid="input-edit-origin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">{t("publish.form.destination")}</Label>
                  <Input
                    id="destination"
                    name="destination"
                    defaultValue={editingRide.destination}
                    required
                    data-testid="input-edit-destination"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">{t("publish.form.date")}</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={editingRide.date.split(' ')[0]}
                    required
                    data-testid="input-edit-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">{t("publish.form.time")}</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    defaultValue={editingRide.time}
                    required
                    data-testid="input-edit-time"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seats">{t("myRides.edit.availableSeats")}</Label>
                <Input
                  id="seats"
                  name="seats"
                  type="number"
                  min="1"
                  max="8"
                  defaultValue={editingRide.seats}
                  required
                  data-testid="input-edit-seats"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">{t("publish.form.notes")}</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={editingRide.notes || ""}
                  placeholder={t("myRides.edit.notesPlaceholder")}
                  data-testid="input-edit-notes"
                />
              </div>
              <DialogFooter className="gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingRide(null)}
                >
                  {t("common.cancel")}
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  data-testid="button-save-edit"
                >
                  {updateMutation.isPending ? t("common.saving") : t("common.saveChanges")}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmRide} onOpenChange={(open) => !open && setDeleteConfirmRide(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("myRides.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("myRides.delete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmRide && deleteMutation.mutate(deleteConfirmRide.id)}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? t("common.deleting") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
