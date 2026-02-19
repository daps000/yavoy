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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const reviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driverRating", driverProfileId] });
      toast({
        title: t("review.success"),
        description: t("review.successMessage"),
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
      setError(t("review.loginRequired"));
      return;
    }

    if (stars === 0) {
      setError(t("review.selectRating"));
      return;
    }

    if (stars < 3 && !comment.trim()) {
      setError(t("review.commentRequiredError"));
      return;
    }

    reviewMutation.mutate({
      driverProfileId,
      stars,
      comment: comment.trim() || undefined,
    });
  };

  const displayStars = hoveredStars || stars;

  const ratingLabels: Record<number, string> = {
    0: t("review.clickToRate"),
    1: t("review.veryBad"),
    2: t("review.bad"),
    3: t("review.normal"),
    4: t("review.good"),
    5: t("review.excellent"),
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">{t("review.title", { name: driverName })}</DialogTitle>
          <DialogDescription>
            {t("review.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label>{t("review.yourRating")}</Label>
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
              {ratingLabels[displayStars]}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">
              {t("review.comment")} {stars > 0 && stars < 3 ? t("review.commentRequired") : t("review.commentOptional")}
            </Label>
            <Textarea
              id="comment"
              placeholder={t("review.commentPlaceholder")}
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
              {t("common.cancel")}
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
                  {t("review.submitting")}
                </>
              ) : (
                t("review.submitButton")
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
