const DRAFT_KEY = "yavoy_publish_draft";
const DRAFT_PENDING_KEY = "yavoy_publish_pending";
const DRAFT_TTL = 2 * 60 * 60 * 1000; // 2 hours

export interface RideDraft {
  driverName: string;
  origin: string;
  destination: string;
  date: string;
  time: string;
  seats: number;
  contact: string;
  notes: string;
  savedAt: number;
}

export function saveDraft(draft: Omit<RideDraft, "savedAt">): void {
  try {
    const data: RideDraft = {
      ...draft,
      savedAt: Date.now(),
    };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    sessionStorage.setItem(DRAFT_PENDING_KEY, "true");
  } catch (e) {
    console.error("Error saving draft:", e);
  }
}

export function loadDraft(): RideDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    
    const draft: RideDraft = JSON.parse(raw);
    
    if (Date.now() - draft.savedAt > DRAFT_TTL) {
      clearDraft();
      return null;
    }
    
    return draft;
  } catch (e) {
    console.error("Error loading draft:", e);
    clearDraft();
    return null;
  }
}

export function isDraftPending(): boolean {
  return sessionStorage.getItem(DRAFT_PENDING_KEY) === "true";
}

export function clearDraft(): void {
  sessionStorage.removeItem(DRAFT_KEY);
  sessionStorage.removeItem(DRAFT_PENDING_KEY);
}
