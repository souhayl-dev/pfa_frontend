import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Star } from "lucide-react";
import type { ListingSummary, ListingType } from "../../shared/api/types";
import { FavoriteButton } from "../../shared/components/FavoriteButton";
import { ListingArt } from "../../shared/components/ListingArt";
import { cn } from "../../shared/lib/cn";
import { countryName, formatMoney } from "../../shared/lib/format";
import { LISTING_TYPE } from "../../shared/lib/labels";

/** What the "from" price is charged per. An agency sells both circuits and transfers, so it has none. */
const PRICE_SUFFIX: Record<ListingType, string | null> = {
  HOTEL: "nuit",
  RESTAURANT: "pers.",
  GUIDE: "jour",
  TRAVEL_AGENCY: null,
  CAR_RENTAL_AGENCY: "jour",
};

export function ListingCard({ listing, index = 0 }: { listing: ListingSummary; index?: number }) {
  const theme = LISTING_TYPE[listing.type];
  const Icon = theme.icon;
  const suffix = PRICE_SUFFIX[listing.type];

  return (
    // The heart sits beside the link, not inside it: a button inside a link would open the page too.
    <div className="group relative animate-rise" style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}>
      <Link
        to={`/listings/${listing.id}`}
        className="flex h-full flex-col overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-card transition duration-300 group-hover:-translate-y-1.5 group-hover:shadow-lift"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <ListingArt
            type={listing.type}
            photoUrl={listing.coverPhotoUrl}
            alt={listing.name}
            className="transition duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent" />
          <span className={cn("absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset backdrop-blur", theme.chip)}>
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {theme.label}
          </span>
          <p className="absolute bottom-3 left-4 flex items-center gap-1 text-sm font-semibold text-white drop-shadow">
            <MapPin className="h-4 w-4" aria-hidden />
            {listing.city}, {countryName(listing.countryCode)}
          </p>
          <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-ink-900 shadow-sm">
            {listing.reviewsCount > 0 ? (
              <>
                <Star className="h-3.5 w-3.5 fill-saffron-400 text-saffron-400" aria-hidden />
                {listing.ratingAvg.toFixed(1)}
                <span className="font-medium text-ink-500">({listing.reviewsCount})</span>
              </>
            ) : (
              "Nouveau"
            )}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-display text-lg leading-snug font-semibold text-ink-900 transition group-hover:text-brand-700">{listing.name}</h3>
          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            {listing.fromPrice !== null ? (
              <p className="text-sm text-ink-500">
                dès <span className="text-xl font-extrabold tracking-tight text-ink-900">{formatMoney(listing.fromPrice, listing.currency)}</span>
                {suffix && <span> / {suffix}</span>}
              </p>
            ) : (
              <p className="text-sm text-ink-500">Tarifs sur demande</p>
            )}
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sand-100 text-ink-700 transition group-hover:bg-brand-500 group-hover:text-white">
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            </span>
          </div>
        </div>
      </Link>
      <FavoriteButton listing={listing} className="absolute top-3 right-3 transition duration-300 group-hover:-translate-y-1.5" />
    </div>
  );
}
