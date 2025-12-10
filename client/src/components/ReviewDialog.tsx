import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, AlertCircle, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverProfileId: number;
  driverName: string;
}

export function ReviewDialog({ open, onOpenChange, driverProfileId, driverName }: ReviewDialogProps) {
  const [stars, setStars] = useState(0);
  const [hoveredStars, setHoveredStars] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const reviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driverRating", driverProfileId] });
      toast({
        title: "Valoración enviada",
        description: "Gracias por tu opinión. Ayudas a la comunidad.",
      });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const resetForm = () => {
    setStars(0);
    setHoveredStars(0);
    setComment("");
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isAuthenticated) {
      setError("Debes iniciar sesión para valorar");
      return;
    }

    if (stars === 0) {
      setError("Selecciona una valoración de 1 a 5 estrellas");
      return;
    }

    if (stars < 3 && !comment.trim()) {
      setError("Para valoraciones menores a 3 estrellas, explica brevemente tu experiencia");
      return;
    }

    reviewMutation.mutate({
      driverProfileId,
      stars,
      comment: comment.trim() || undefined,
    });
  };

  const displayStars = hoveredStars || stars;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Valorar a {driverName}</DialogTitle>
          <DialogDescription>
            Comparte tu experiencia con este conductor para ayudar a otros vecinos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label>Tu valoración</Label>
            <div className="flex gap-2 justify-center py-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStars(value)}
                  onMouseEnter={() => setHoveredStars(value)}
                  onMouseLeave={() => setHoveredStars(0)}
                  className="p-1 transition-transform hover:scale-110"
                  data-testid={`star-${value}`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      value <= displayStars
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {displayStars === 0 && "Haz clic para valorar"}
              {displayStars === 1 && "Muy mala experiencia"}
              {displayStars === 2 && "Mala experiencia"}
              {displayStars === 3 && "Experiencia normal"}
              {displayStars === 4 && "Buena experiencia"}
              {displayStars === 5 && "Excelente experiencia"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">
              Comentario {stars > 0 && stars < 3 ? "(obligatorio)" : "(opcional)"}
            </Label>
            <Textarea
              id="comment"
              placeholder="¿Cómo fue tu experiencia con este conductor?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              data-testid="input-comment"
            />
          </div>

          
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-testid="button-cancel-review"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={reviewMutation.isPending}
              className="flex-1 bg-primary hover:bg-[#70b681]"
              data-testid="button-submit-review"
            >
              {reviewMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar valoración"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
