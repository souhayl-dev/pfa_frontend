import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { ListingMedia } from "./ListingMedia";
import { CategoryBadge } from "./CategoryBadge";
import { resolveAssetUrl } from "../api/httpClient";
import type { AttractionType, ListingType } from "../api/types";

interface Props {
  to: string;
  title: string;
  city: string;
  country: string;
  price: number;
  currency: string;
  priceUnit: string;
  listingType: ListingType;
  attractionType?: AttractionType | null;
  coverPhotoUrl?: string | null;
}

export function ListingCard({ to, title, city, country, price, currency, priceUnit, listingType, attractionType, coverPhotoUrl }: Props) {
  return (
    <Link
      to={to}
      className="group block overflow-hidden rounded-2xl border border-neutral-200 transition-shadow hover:shadow-lg"
    >
      {coverPhotoUrl ? (
        <img
          src={resolveAssetUrl(coverPhotoUrl)}
          alt=""
          className="aspect-4/3 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <ListingMedia
          listingType={listingType}
          attractionType={attractionType}
          className="aspect-4/3 w-full transition-transform duration-300 group-hover:scale-105"
        />
      )}
      <div className="space-y-1.5 p-4">
        <h3 className="line-clamp-1 font-semibold text-neutral-900">{title}</h3>
        <CategoryBadge listingType={listingType} attractionType={attractionType} />
        <p className="flex items-center gap-1 text-sm text-neutral-500">
          <MapPin className="size-3.5" />
          {city}, {country}
        </p>
        <p className="pt-1 text-sm text-neutral-900">
          <span className="font-semibold">{price} {currency}</span>
          <span className="text-neutral-500"> {priceUnit}</span>
        </p>
      </div>
    </Link>
  );
}
