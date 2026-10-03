import { Bus, CarFront, Compass, Hotel, Map, Route, UtensilsCrossed, BedDouble, type LucideIcon } from "lucide-react";
import type {
  BookingStatus,
  CarCategory,
  FuelType,
  ListingStatus,
  ListingType,
  MemberRole,
  PricingUnit,
  ProviderStatus,
  RoomType,
  Transmission,
  UnitType,
  VehicleType,
} from "../api/types";

interface TypeTheme {
  label: string;
  plural: string;
  icon: LucideIcon;
  /** Gradient of the generated artwork shown when a listing has no photo. */
  art: string;
  chip: string;
  dot: string;
}

export const LISTING_TYPES: ListingType[] = ["HOTEL", "RESTAURANT", "GUIDE", "TRAVEL_AGENCY", "CAR_RENTAL_AGENCY"];

export const LISTING_TYPE: Record<ListingType, TypeTheme> = {
  HOTEL: {
    label: "Hôtel",
    plural: "Hôtels",
    icon: Hotel,
    art: "from-brand-400 via-brand-600 to-rose-800",
    chip: "bg-brand-50 text-brand-700 ring-brand-200",
    dot: "bg-brand-500",
  },
  RESTAURANT: {
    label: "Restaurant",
    plural: "Restaurants",
    icon: UtensilsCrossed,
    art: "from-saffron-400 via-amber-500 to-orange-700",
    chip: "bg-amber-50 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
  },
  GUIDE: {
    label: "Guide",
    plural: "Guides",
    icon: Compass,
    art: "from-emerald-400 via-pine-600 to-pine-900",
    chip: "bg-pine-50 text-pine-700 ring-pine-200",
    dot: "bg-pine-500",
  },
  TRAVEL_AGENCY: {
    label: "Agence de voyage",
    plural: "Circuits & transferts",
    icon: Map,
    art: "from-sky-400 via-indigo-500 to-indigo-900",
    chip: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    dot: "bg-indigo-500",
  },
  CAR_RENTAL_AGENCY: {
    label: "Location de voitures",
    plural: "Voitures",
    icon: CarFront,
    art: "from-fuchsia-400 via-purple-600 to-slate-900",
    chip: "bg-purple-50 text-purple-700 ring-purple-200",
    dot: "bg-purple-500",
  },
};

export const UNIT_TYPE: Record<UnitType, { label: string; icon: LucideIcon }> = {
  ROOM: { label: "Chambre", icon: BedDouble },
  TABLE: { label: "Table", icon: UtensilsCrossed },
  GUIDE_SERVICE: { label: "Prestation de guide", icon: Compass },
  TRANSPORT: { label: "Transfert", icon: Bus },
  TOUR: { label: "Circuit", icon: Route },
  CAR: { label: "Voiture", icon: CarFront },
};

/** The unit types a listing of each type may offer. */
export const UNIT_TYPES_OF: Record<ListingType, UnitType[]> = {
  HOTEL: ["ROOM"],
  RESTAURANT: ["TABLE"],
  GUIDE: ["GUIDE_SERVICE"],
  TRAVEL_AGENCY: ["TOUR", "TRANSPORT"],
  CAR_RENTAL_AGENCY: ["CAR"],
};

export const PRICING_UNIT: Record<PricingUnit, string> = {
  PER_NIGHT: "nuit",
  PER_DAY: "jour",
  PER_TRIP: "trajet",
  PER_PERSON: "personne",
};

export const BOOKING_STATUS: Record<BookingStatus, { label: string; tone: string }> = {
  PENDING: { label: "En attente", tone: "bg-amber-50 text-amber-800 ring-amber-200" },
  CONFIRMED: { label: "Confirmée", tone: "bg-pine-50 text-pine-700 ring-pine-200" },
  COMPLETED: { label: "Terminée", tone: "bg-sky-50 text-sky-700 ring-sky-200" },
  CANCELLED: { label: "Annulée", tone: "bg-sand-100 text-ink-500 ring-sand-300" },
  NO_SHOW: { label: "Non présenté", tone: "bg-rose-50 text-rose-700 ring-rose-200" },
};

export const LISTING_STATUS: Record<ListingStatus, { label: string; tone: string }> = {
  DRAFT: { label: "Brouillon", tone: "bg-sand-100 text-ink-600 ring-sand-300" },
  ACTIVE: { label: "En ligne", tone: "bg-pine-50 text-pine-700 ring-pine-200" },
  INACTIVE: { label: "Hors ligne", tone: "bg-rose-50 text-rose-700 ring-rose-200" },
};

export const PROVIDER_STATUS: Record<ProviderStatus, { label: string; tone: string }> = {
  PENDING: { label: "En attente de validation", tone: "bg-amber-50 text-amber-800 ring-amber-200" },
  APPROVED: { label: "Validé", tone: "bg-pine-50 text-pine-700 ring-pine-200" },
  REJECTED: { label: "Refusé", tone: "bg-rose-50 text-rose-700 ring-rose-200" },
  SUSPENDED: { label: "Suspendu", tone: "bg-sand-100 text-ink-600 ring-sand-300" },
};

export const MEMBER_ROLE: Record<MemberRole, string> = {
  OWNER: "Propriétaire",
  MANAGER: "Gestionnaire",
  STAFF: "Employé",
};

export const ROOM_TYPE: Record<RoomType, string> = {
  SINGLE: "Simple",
  DOUBLE: "Double",
  TWIN: "Lits jumeaux",
  TRIPLE: "Triple",
  SUITE: "Suite",
  FAMILY: "Familiale",
};

export const CAR_CATEGORY: Record<CarCategory, string> = {
  ECONOMY: "Économique",
  COMPACT: "Compacte",
  SUV: "SUV",
  LUXURY: "Luxe",
  VAN: "Monospace",
};

export const TRANSMISSION: Record<Transmission, string> = {
  MANUAL: "Manuelle",
  AUTOMATIC: "Automatique",
};

export const FUEL_TYPE: Record<FuelType, string> = {
  PETROL: "Essence",
  DIESEL: "Diesel",
  HYBRID: "Hybride",
  ELECTRIC: "Électrique",
};

export const VEHICLE_TYPE: Record<VehicleType, string> = {
  CAR: "Voiture",
  VAN: "Van",
  MINIBUS: "Minibus",
  BUS: "Bus",
  FOUR_BY_FOUR: "4x4",
};

export function options<K extends string>(record: Record<K, string>): { value: K; label: string }[] {
  return (Object.keys(record) as K[]).map((value) => ({ value, label: record[value] }));
}
