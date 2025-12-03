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

export function PendingReviewPrompt() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<PendingReviewContact | null>(null);
  
  const { data: pendingContacts = [] } = useQuery({
    queryKey: ["pending-reviews"],
    queryFn: fetchPendingReviews,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (pendingContacts.length > 0 && !currentContact) {
      const contact = pendingContacts[0];
      setCurrentContact(contact);
      setPromptDialogOpen(true);
    }
  }, [pendingContacts, currentContact]);

  const handleDismiss = async () => {
    if (currentContact) {
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

  const driverName = currentContact.driverName || "el conductor";

  return (
    <>
      <Dialog open={promptDialogOpen} onOpenChange={setPromptDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              ¿Qué tal fue tu viaje con {driverName}?
            </DialogTitle>
            <DialogDescription>
              Vemos que contactaste con {driverName} hace poco. ¿Te gustaría dejar una valoración para ayudar a otros usuarios?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleDismiss} data-testid="button-dismiss-review">
              Ahora no
            </Button>
            <Button onClick={handleReviewClick} className="bg-primary" data-testid="button-write-review">
              Escribir valoración
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
