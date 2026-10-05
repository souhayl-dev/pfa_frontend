import { useQuery } from "@tanstack/react-query";
import { http } from "../../shared/api/http";
import type { Listing, ListingSummary, Member, MemberRole, Membership, Provider } from "../../shared/api/types";

/** The providers the signed-in user works for. */
export function useMemberships() {
  return useQuery({
    queryKey: ["pro", "memberships"],
    queryFn: async () => (await http.get<Membership[]>("/providers/mine")).data,
  });
}

export function useProvider(providerId: string) {
  return useQuery({
    queryKey: ["pro", "provider", providerId],
    queryFn: async () => (await http.get<Provider>(`/providers/${providerId}`)).data,
  });
}

export function useProviderListings(providerId: string) {
  return useQuery({
    queryKey: ["pro", "provider", providerId, "listings"],
    queryFn: async () => (await http.get<ListingSummary[]>(`/providers/${providerId}/listings`)).data,
  });
}

export function useMembers(providerId: string) {
  return useQuery({
    queryKey: ["pro", "provider", providerId, "members"],
    queryFn: async () => (await http.get<Member[]>(`/providers/${providerId}/members`)).data,
  });
}

/** The provider's own view of a listing: drafts and inactive units included. */
export function useManagedListing(listingId: string) {
  return useQuery({
    queryKey: ["pro", "listing", listingId],
    queryFn: async () => (await http.get<Listing>(`/manage/listings/${listingId}`)).data,
  });
}

/** Owners and managers change listings; staff only read them and handle bookings. */
export const canManageListings = (role: MemberRole | undefined) => role === "OWNER" || role === "MANAGER";
