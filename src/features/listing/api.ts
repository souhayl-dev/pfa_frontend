import { useQuery } from "@tanstack/react-query";
import { http } from "../../shared/api/http";
import type { Listing, Quote, Review } from "../../shared/api/types";

export function useListing(id: string) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: async () => (await http.get<Listing>(`/listings/${id}`)).data,
  });
}

export function useListingReviews(id: string) {
  return useQuery({
    queryKey: ["listing", id, "reviews"],
    queryFn: async () => (await http.get<Review[]>(`/listings/${id}/reviews`)).data,
  });
}

export interface QuoteParams {
  unitId: string;
  start: string;
  end: string | null;
  guests: number;
}

/** Runs only once the period is complete: params is null until then. */
export function useQuote(params: QuoteParams | null) {
  return useQuery({
    queryKey: ["quote", params],
    enabled: params !== null,
    retry: false,
    queryFn: async () => {
      const { unitId, start, end, guests } = params!;
      return (await http.get<Quote>(`/units/${unitId}/quote`, { params: { start, end: end ?? undefined, guests } })).data;
    },
  });
}
