import { create } from "zustand";
import type { Listing, ListingSummary } from "../api/types";

interface FavoritesState {
  /** Kept as cards, newest first, so the favourites page needs no request to draw them. */
  items: ListingSummary[];
  toggle: (listing: ListingSummary) => void;
}

const STORAGE_KEY = "bookly-favorites";

function load(): ListingSummary[] {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

/** Favourites live in this browser: they need no account, and do not follow the user to another device. */
export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  items: load(),
  toggle: (listing) => {
    const saved = get().items.some((item) => item.id === listing.id);
    const items = saved ? get().items.filter((item) => item.id !== listing.id) : [listing, ...get().items];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage may be full or blocked: the favourite then lasts until the page is closed.
    }
    set({ items });
  },
}));

/** The card of a listing, built from its full page. */
export function toSummary(listing: Listing): ListingSummary {
  const prices = listing.units.filter((unit) => unit.active).map((unit) => unit.basePrice);
  return {
    id: listing.id,
    providerId: listing.providerId,
    type: listing.type,
    name: listing.name,
    city: listing.city,
    countryCode: listing.countryCode,
    status: listing.status,
    currency: listing.currency,
    ratingAvg: listing.ratingAvg,
    reviewsCount: listing.reviewsCount,
    coverPhotoUrl: listing.photos[0]?.url ?? null,
    fromPrice: prices.length ? Math.min(...prices) : null,
  };
}
