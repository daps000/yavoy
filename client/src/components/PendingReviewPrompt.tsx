import { useState, useEffect, useCallback, useRef } from "react";
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

const DISMISSED_KEY = "yavoy_dismissed_review_ids";

function getDismissedIds(): Set<number> {
  try {
    const stored = localStorage.getItem(DISMISSED_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch {}
  return new Set();
}

function addDismissedId(id: number) {
  const ids = getDismissedIds();
  ids.add(id);
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(ids)));
}

export function PendingReviewPrompt() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<PendingReviewContact | null>(null);
  const hasPickedRef = useRef(false);
  const reviewSubmittedRef = useRef(false);
  const { t } = useTranslation();
  
  const { data: pendingContacts = [] } = useQuery({
    queryKey: ["pending-reviews"],
    queryFn: fetchPendingReviews,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (hasPickedRef.current || promptDialogOpen || reviewDialogOpen) return;
    if (pendingContacts.length === 0) return;

    const dismissed = getDismissedIds();
    const next = pendingContacts.find(c => !dismissed.has(c.id));
    if (next) {
      hasPickedRef.current = true;
      setCurrentContact(next);
      setPromptDialogOpen(true);
    }
  }, [pendingContacts, promptDialogOpen, reviewDialogOpen]);

  const dismissContact = useCallback(async (contact: PendingReviewContact) => {
    addDismissedId(contact.id);
    try {
      await markContactReviewed(contact.id);
      queryClient.invalidateQueries({ queryKey: ["pending-reviews"] });
    } catch (error) {
      console.error("Error dismissing review prompt:", error);
    }
  }, [queryClient]);

  const handleDismiss = useCallback(async () => {
    setPromptDialogOpen(false);
    if (currentContact) {
      await dismissContact(currentContact);
    }
    setCurrentContact(null);
    hasPickedRef.current = false;
  }, [currentContact, dismissContact]);

  const handleReviewClick = useCallback(() => {
    reviewSubmittedRef.current = false;
    setPromptDialogOpen(false);
    setReviewDialogOpen(true);
  }, []);

  const handleReviewSuccess = useCallback(() => {
    reviewSubmittedRef.current = true;
  }, []);

  const handleReviewDialogClose = useCallback(async () => {
    setReviewDialogOpen(false);
    if (currentContact) {
      addDismissedId(currentContact.id);
      try {
        await markContactReviewed(currentContact.id);
        queryClient.invalidateQueries({ queryKey: ["pending-reviews"] });
        if (reviewSubmittedRef.current) {
          queryClient.invalidateQueries({ queryKey: ["driverRating", currentContact.driverProfileId] });
        }
      } catch (error) {
        console.error("Error marking review complete:", error);
      }
    }
    setCurrentContact(null);
    reviewSubmittedRef.current = false;
    hasPickedRef.current = false;
  }, [currentContact, queryClient]);

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
            if (!open) handleReviewDialogClose();
          }}
          driverProfileId={currentContact.driverProfileId}
          driverName={driverName}
          onReviewSuccess={handleReviewSuccess}
        />
      )}
    </>
  );
}
