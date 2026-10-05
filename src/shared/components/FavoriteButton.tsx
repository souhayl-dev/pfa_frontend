import { Heart } from "lucide-react";
import type { ListingSummary } from "../api/types";
import { cn } from "../lib/cn";
import { useFavoritesStore } from "../stores/favoritesStore";

interface FavoriteButtonProps {
  listing: ListingSummary;
  /** "labelled" also shows the word, for the listing page. */
  variant?: "icon" | "labelled";
  className?: string;
}

export function FavoriteButton({ listing, variant = "icon", className }: FavoriteButtonProps) {
  const saved = useFavoritesStore((state) => state.items.some((item) => item.id === listing.id));
  const toggle = useFavoritesStore((state) => state.toggle);
  const label = saved ? "Retirer des favoris" : "Ajouter aux favoris";

  return (
    <button
      type="button"
      onClick={() => toggle(listing)}
      aria-pressed={saved}
      aria-label={variant === "icon" ? `${label} : ${listing.name}` : undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition active:scale-90",
        variant === "icon"
          ? "h-9 w-9 rounded-full bg-white/95 shadow-sm hover:scale-110"
          : "h-9 rounded-lg border border-sand-300 bg-white px-3 text-sm text-ink-800 hover:border-ink-400",
        className,
      )}
    >
      <Heart className={cn("h-4.5 w-4.5 transition", saved ? "fill-brand-500 text-brand-500" : "text-ink-700")} aria-hidden />
      {variant === "labelled" && (saved ? "Enregistré" : "Enregistrer")}
    </button>
  );
}
