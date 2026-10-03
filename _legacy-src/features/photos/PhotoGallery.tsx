import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listPhotos } from "./api";
import { resolveAssetUrl } from "../../shared/api/httpClient";
import { ListingMedia } from "../../shared/components/ListingMedia";
import { cn } from "../../shared/lib/cn";
import type { AttractionType, ListingType } from "../../shared/api/types";

interface Props {
  listingType: ListingType;
  listingId: string;
  attractionType?: AttractionType | null;
}

export function PhotoGallery({ listingType, listingId, attractionType }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: photos } = useQuery({
    queryKey: ["listing-photos", listingType, listingId],
    queryFn: () => listPhotos(listingType, listingId),
  });

  if (!photos || photos.length === 0) {
    return <ListingMedia listingType={listingType} attractionType={attractionType} className="aspect-video w-full rounded-2xl" iconClassName="size-16" />;
  }

  const active = photos[Math.min(activeIndex, photos.length - 1)];

  return (
    <div className="space-y-2">
      <img
        src={resolveAssetUrl(active.url)}
        alt=""
        className="aspect-video w-full rounded-2xl object-cover"
      />
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "size-16 shrink-0 overflow-hidden rounded-lg border-2",
                index === activeIndex ? "border-neutral-900" : "border-transparent",
              )}
            >
              <img src={resolveAssetUrl(photo.url)} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
