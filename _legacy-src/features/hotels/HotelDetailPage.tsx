import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Star, Users } from "lucide-react";
import { getHotel } from "./api";
import { CategoryBadge } from "../../shared/components/CategoryBadge";
import { BookingWidget } from "../../shared/components/BookingWidget";
import { ReviewsSection } from "../reviews/ReviewsSection";
import { PhotoGallery } from "../photos/PhotoGallery";
import { PhotoManager } from "../photos/PhotoManager";
import { Skeleton } from "../../shared/components/ui/Skeleton";
import { useAuthStore } from "../../shared/stores/authStore";

export function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const userId = useAuthStore((state) => state.userId);

  const { data: listing, isLoading, isError } = useQuery({
    queryKey: ["hotel", id],
    queryFn: () => getHotel(id!),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-8 w-2/3" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center">
        <p className="font-medium text-neutral-900">Annonce introuvable</p>
        <Link to="/" className="mt-2 inline-block text-sm text-brand-600 hover:underline">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <PhotoGallery listingType="HOTEL" listingId={listing.id} />
        {userId === listing.providerId && <PhotoManager listingType="HOTEL" listingId={listing.id} />}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge listingType="HOTEL" />
            {listing.starRating && (
              <span className="flex items-center gap-1 text-sm text-amber-600">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {listing.starRating}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{listing.title}</h1>
          <p className="flex items-center gap-1.5 text-neutral-500">
            <MapPin className="size-4" />
            {listing.address.line1 ? `${listing.address.line1}, ` : ""}{listing.address.city}, {listing.address.country}
          </p>
          <p className="flex items-center gap-1.5 text-neutral-500">
            <Users className="size-4" />
            Jusqu'à {listing.capacity} invité{listing.capacity > 1 ? "s" : ""}
          </p>
          <hr className="border-neutral-200" />
          <p className="whitespace-pre-line leading-relaxed text-neutral-700">{listing.description}</p>
        </div>
        <ReviewsSection listingType="HOTEL" listingId={listing.id} />
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-4 rounded-2xl border border-neutral-200 p-5 shadow-lg shadow-neutral-900/5">
          <p className="text-xl font-bold text-neutral-900">
            {listing.basePrice} {listing.currency}
            <span className="text-sm font-normal text-neutral-500"> / nuit</span>
          </p>
          <BookingWidget listingType="HOTEL" listingId={listing.id} basePrice={listing.basePrice}
                          currency={listing.currency} maxQuantity={listing.capacity} quantityLabel="Invités" />
        </div>
      </div>
    </div>
  );
}
