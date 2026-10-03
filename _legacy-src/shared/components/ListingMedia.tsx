import { getCategoryTheme } from "../lib/categoryTheme";
import { cn } from "../lib/cn";
import type { AttractionType, ListingType } from "../api/types";

interface Props {
  listingType: ListingType;
  attractionType?: AttractionType | null;
  className?: string;
  iconClassName?: string;
}

/** No photo pipeline is wired to listings yet, so this renders a designed category placeholder instead of a fake stock photo. */
export function ListingMedia({ listingType, attractionType, className, iconClassName }: Props) {
  const theme = getCategoryTheme(listingType, attractionType);
  const Icon = theme.icon;

  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden bg-gradient-to-br", theme.gradient, className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
      <Icon className={cn("relative text-white/90", iconClassName ?? "size-10")} strokeWidth={1.5} />
    </div>
  );
}
