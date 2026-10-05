import { useQueries } from "@tanstack/react-query";
import { http } from "../../shared/api/http";
import type { Booking, ListingSummary } from "../../shared/api/types";

/** The bookings of every listing of a provider. The API lists them per listing, so there is one request each. */
export function useProviderBookings(listings: ListingSummary[]) {
  const queries = useQueries({
    queries: listings.map((listing) => ({
      queryKey: ["pro", "listing", listing.id, "bookings", "ALL"],
      queryFn: async () => (await http.get<Booking[]>(`/manage/listings/${listing.id}/bookings`)).data,
      staleTime: 30_000,
    })),
  });
  const loading = queries.some((query) => query.isLoading);
  const pendingByListing = new Map(listings.map((listing, index) => [listing.id, (queries[index].data ?? []).filter((booking) => booking.status === "PENDING").length]));
  return { loading, bookings: queries.flatMap((query) => query.data ?? []), pendingByListing };
}
