import { Building2, Key, Compass, UtensilsCrossed, Route } from "lucide-react";
import type { AttractionType, ListingType } from "../api/types";

export interface CategoryTheme {
  label: string;
  gradient: string;
  badgeClass: string;
  icon: typeof Building2;
}

const HOTEL: CategoryTheme = {
  label: "Hôtel & Riad",
  gradient: "from-sky-400 to-blue-600",
  badgeClass: "bg-sky-50 text-sky-700",
  icon: Building2,
};

const CAR_RENTAL: CategoryTheme = {
  label: "Location de voiture",
  gradient: "from-emerald-400 to-teal-600",
  badgeClass: "bg-emerald-50 text-emerald-700",
  icon: Key,
};

const ATTRACTION_THEMES: Record<AttractionType, CategoryTheme> = {
  ACTIVITY: {
    label: "Activité",
    gradient: "from-amber-400 to-orange-600",
    badgeClass: "bg-amber-50 text-amber-700",
    icon: Compass,
  },
  RESTAURATION: {
    label: "Restauration",
    gradient: "from-rose-400 to-pink-600",
    badgeClass: "bg-rose-50 text-rose-700",
    icon: UtensilsCrossed,
  },
  CIRCUIT: {
    label: "Circuit",
    gradient: "from-violet-400 to-purple-600",
    badgeClass: "bg-violet-50 text-violet-700",
    icon: Route,
  },
};

const DEFAULT_ATTRACTION: CategoryTheme = {
  label: "Attraction",
  gradient: "from-amber-400 to-orange-600",
  badgeClass: "bg-amber-50 text-amber-700",
  icon: Compass,
};

export function getCategoryTheme(listingType: ListingType, attractionType?: AttractionType | null): CategoryTheme {
  if (listingType === "HOTEL") return HOTEL;
  if (listingType === "CAR_RENTAL") return CAR_RENTAL;
  return attractionType ? ATTRACTION_THEMES[attractionType] : DEFAULT_ATTRACTION;
}
