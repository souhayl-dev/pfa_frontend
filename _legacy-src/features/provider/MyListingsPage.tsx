import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { listMyHotels, archiveHotel } from "../hotels/api";
import { listMyCarRentals, archiveCarRental } from "../carrentals/api";
import { listMyAttractions, archiveAttraction } from "../attractions/api";
import { CategoryBadge } from "../../shared/components/CategoryBadge";
import { Button } from "../../shared/components/ui/Button";
import { Badge } from "../../shared/components/ui/Badge";
import { Skeleton } from "../../shared/components/ui/Skeleton";
import { cn } from "../../shared/lib/cn";
import type { ListingStatus } from "../../shared/api/types";

const STATUS_CLASSES: Record<ListingStatus, string> = {
  DRAFT: "bg-neutral-100 text-neutral-600",
  PUBLISHED: "bg-emerald-50 text-emerald-700",
  ARCHIVED: "bg-red-50 text-red-600",
};

export function MyListingsPage() {
  const queryClient = useQueryClient();

  const hotels = useQuery({ queryKey: ["my-hotels"], queryFn: listMyHotels });
  const carRentals = useQuery({ queryKey: ["my-car-rentals"], queryFn: listMyCarRentals });
  const attractions = useQuery({ queryKey: ["my-attractions"], queryFn: listMyAttractions });

  const archiveHotelMutation = useMutation({
    mutationFn: archiveHotel,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-hotels"] }),
  });
  const archiveCarMutation = useMutation({
    mutationFn: archiveCarRental,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-car-rentals"] }),
  });
  const archiveAttractionMutation = useMutation({
    mutationFn: archiveAttraction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-attractions"] }),
  });

  const isLoading = hotels.isLoading || carRentals.isLoading || attractions.isLoading;
  const isEmpty = hotels.data?.length === 0 && carRentals.data?.length === 0 && attractions.data?.length === 0;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Mes annonces</h1>
        <Link to="/provider/listings/new">
          <Button icon={<PlusCircle className="size-4" />}>Ajouter une annonce</Button>
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        )}

        {isEmpty && <p className="text-sm text-neutral-500">Vous n'avez pas encore d'annonce.</p>}

        {hotels.data?.map((listing) => (
          <div key={listing.id} className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 p-4">
            <div className="space-y-1.5">
              <p className="font-semibold text-neutral-900">{listing.title}</p>
              <div className="flex items-center gap-2">
                <CategoryBadge listingType="HOTEL" />
                <Badge className={cn(STATUS_CLASSES[listing.status])}>{listing.status}</Badge>
              </div>
            </div>
            {listing.status !== "ARCHIVED" && (
              <Button variant="danger" size="sm" onClick={() => archiveHotelMutation.mutate(listing.id)}>Archiver</Button>
            )}
          </div>
        ))}

        {carRentals.data?.map((listing) => (
          <div key={listing.id} className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 p-4">
            <div className="space-y-1.5">
              <p className="font-semibold text-neutral-900">{listing.title}</p>
              <div className="flex items-center gap-2">
                <CategoryBadge listingType="CAR_RENTAL" />
                <Badge className={cn(STATUS_CLASSES[listing.status])}>{listing.status}</Badge>
              </div>
            </div>
            {listing.status !== "ARCHIVED" && (
              <Button variant="danger" size="sm" onClick={() => archiveCarMutation.mutate(listing.id)}>Archiver</Button>
            )}
          </div>
        ))}

        {attractions.data?.map((listing) => (
          <div key={listing.id} className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 p-4">
            <div className="space-y-1.5">
              <p className="font-semibold text-neutral-900">{listing.title}</p>
              <div className="flex items-center gap-2">
                <CategoryBadge listingType="ATTRACTION" attractionType={listing.attractionType} />
                <Badge className={cn(STATUS_CLASSES[listing.status])}>{listing.status}</Badge>
              </div>
            </div>
            {listing.status !== "ARCHIVED" && (
              <Button variant="danger" size="sm" onClick={() => archiveAttractionMutation.mutate(listing.id)}>Archiver</Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
