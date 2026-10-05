/**
 * What a visitor has chosen in the booking panel, kept for the length of the browser tab. Signing in
 * to book leaves the listing page; the draft is what lets it come back as it was.
 */
export interface BookingDraft {
  unitId: string;
  start: string;
  end: string;
  guests: number;
}

const STORAGE_KEY = "bookly-booking-draft";

export function readBookingDraft(): BookingDraft | null {
  try {
    const draft = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
    return draft && typeof draft.unitId === "string" ? draft : null;
  } catch {
    return null;
  }
}

export function saveBookingDraft(draft: BookingDraft): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Without storage the form simply starts empty after signing in.
  }
}

export function clearBookingDraft(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
