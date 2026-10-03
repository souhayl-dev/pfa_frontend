import { resolveAssetUrl } from "../api/http";
import type { ListingType } from "../api/types";
import { cn } from "../lib/cn";
import { LISTING_TYPE } from "../lib/labels";

interface ListingArtProps {
  type: ListingType;
  photoUrl?: string | null;
  alt: string;
  className?: string;
  iconClassName?: string;
}

/** The listing's photo, or generated artwork in the colour of its type when it has none. */
export function ListingArt({ type, photoUrl, alt, className, iconClassName }: ListingArtProps) {
  const theme = LISTING_TYPE[type];
  const Icon = theme.icon;

  if (photoUrl) {
    return <img src={resolveAssetUrl(photoUrl)} alt={alt} loading="lazy" className={cn("h-full w-full object-cover", className)} />;
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-gradient-to-br", theme.art, className)} role="img" aria-label={alt}>
      <div className="zellige absolute inset-0 opacity-20" />
      <div className="absolute -right-10 -bottom-16 h-56 w-56 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute -top-12 -left-8 h-40 w-40 rounded-full bg-black/20 blur-2xl" />
      <Icon className={cn("absolute right-5 bottom-4 h-20 w-20 text-white/35", iconClassName)} strokeWidth={1.25} aria-hidden />
    </div>
  );
}
