import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPendingReviews, markContactReviewed, type PendingReviewContact } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ReviewDialog } from "./ReviewDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

export function PendingReviewPrompt() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<PendingReviewContact | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
  const { t } = useTranslation();
  
  const { data: pendingContacts = [] } = useQuery({
    queryKey: ["pending-reviews"],
    queryFn: fetchPendingReviews,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (pendingContacts.length > 0 && !currentContact && !promptDialogOpen && !reviewDialogOpen) {
      const undismissed = pendingContacts.find(c => !dismissedIds.has(c.id));
      if (undismissed) {
        setCurrentContact(undismissed);
        setPromptDialogOpen(true);
      }
    }
  }, [pendingContacts, currentContact, dismissedIds, promptDialogOpen, reviewDialogOpen]);

  const handleDismiss = async () => {
    if (currentContact) {
      setDismissedIds(prev => new Set(prev).add(currentContact.id));
      try {
        await markContactReviewed(currentContact.id);
        queryClient.invalidateQueries({ queryKey: ["pending-reviews"] });
      } catch (error) {
        console.error("Error dismissing review prompt:", error);
      }
    }
    setPromptDialogOpen(false);
    setCurrentContact(null);
  };

  const handleReviewClick = () => {
    setPromptDialogOpen(false);
    setReviewDialogOpen(true);
  };

  const handleReviewComplete = async () => {
    if (currentContact) {
      try {
        await markContactReviewed(currentContact.id);
        queryClient.invalidateQueries({ queryKey: ["pending-reviews"] });
        queryClient.invalidateQueries({ queryKey: ["driverRating", currentContact.driverProfileId] });
      } catch (error) {
        console.error("Error marking review complete:", error);
      }
    }
    setReviewDialogOpen(false);
    setCurrentContact(null);
  };

  if (!isAuthenticated || !currentContact) {
    return null;
  }

  const driverName = currentContact.driverName || t("pendingReview.theDriver");

  return (
    <>
      <Dialog open={promptDialogOpen} onOpenChange={(open) => { if (!open) handleDismiss(); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              {t("pendingReview.title", { name: driverName })}
            </DialogTitle>
            <DialogDescription>
              {t("pendingReview.subtitle", { name: driverName })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleDismiss} data-testid="button-dismiss-review">
              {t("pendingReview.notNow")}
            </Button>
            <Button onClick={handleReviewClick} className="bg-primary" data-testid="button-write-review">
              {t("pendingReview.writeReview")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {currentContact && (
        <ReviewDialog
          open={reviewDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleReviewComplete();
            }
            setReviewDialogOpen(open);
          }}
          driverProfileId={currentContact.driverProfileId}
          driverName={driverName}
        />
      )}
    </>
  );
}
