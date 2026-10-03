import { getCategoryTheme } from "../lib/categoryTheme";
import { Badge } from "./ui/Badge";
import type { AttractionType, ListingType } from "../api/types";

export function CategoryBadge({ listingType, attractionType }: { listingType: ListingType; attractionType?: AttractionType | null }) {
  const theme = getCategoryTheme(listingType, attractionType);
  const Icon = theme.icon;
  return (
    <Badge className={theme.badgeClass}>
      <Icon className="size-3.5" strokeWidth={2} />
      {theme.label}
    </Badge>
  );
}
