import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyRides, deleteRide, updateRide } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { RideCard } from "./rides";
import { Button } from "@/components/ui/button";
import { Car, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
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
  const { isAuthenticated, login, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [editingRide, setEditingRide] = useState<Ride | null>(null);
  const [deleteConfirmRide, setDeleteConfirmRide] = useState<Ride | null>(null);
  
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
        title: "Viaje eliminado",
        description: "Tu viaje ha sido eliminado correctamente.",
      });
      setDeleteConfirmRide(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el viaje.",
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
        title: "Viaje actualizado",
        description: "Los cambios se han guardado correctamente.",
      });
      setEditingRide(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudieron guardar los cambios.",
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
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container px-4 md:px-6 py-12">
        <div className="text-center py-16 bg-secondary/20 rounded-xl border border-dashed">
          <Car className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
          <h3 className="text-lg font-medium">Inicia sesión para ver tus viajes</h3>
          <p className="text-muted-foreground mb-6">
            Necesitas una cuenta para gestionar tus viajes publicados.
          </p>
          <Button onClick={login} data-testid="button-login-myrides">
            Iniciar sesión
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container px-4 md:px-6 py-12 text-center">
        <p className="text-muted-foreground">Cargando tus viajes...</p>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Mis viajes publicados</h1>
          <p className="text-muted-foreground mt-2">Gestiona los viajes que has publicado.</p>
        </div>
        <Link href="/publicar">
          <Button className="bg-primary hover:bg-[#70b681]" data-testid="button-publish-new">
            <Plus className="mr-2 h-4 w-4" /> Publicar nuevo viaje
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
            <h3 className="text-lg font-medium">No tienes viajes publicados</h3>
            <p className="text-muted-foreground mb-6">¡Publica tu primer viaje para compartir coche!</p>
            <Link href="/publicar">
              <Button data-testid="button-publish-first">Publicar viaje</Button>
            </Link>
          </div>
        )}
      </div>

      <Dialog open={!!editingRide} onOpenChange={(open) => !open && setEditingRide(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar viaje</DialogTitle>
            <DialogDescription>
              Modifica los detalles de tu viaje publicado.
            </DialogDescription>
          </DialogHeader>
          {editingRide && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origen</Label>
                  <Input
                    id="origin"
                    name="origin"
                    defaultValue={editingRide.origin}
                    required
                    data-testid="input-edit-origin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destino</Label>
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
                  <Label htmlFor="date">Fecha</Label>
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
                  <Label htmlFor="time">Hora</Label>
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
                <Label htmlFor="seats">Plazas disponibles</Label>
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
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={editingRide.notes || ""}
                  placeholder="Información adicional sobre el viaje..."
                  data-testid="input-edit-notes"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingRide(null)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  data-testid="button-save-edit"
                >
                  {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmRide} onOpenChange={(open) => !open && setDeleteConfirmRide(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este viaje?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El viaje será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmRide && deleteMutation.mutate(deleteConfirmRide.id)}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
