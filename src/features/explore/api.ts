import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { http } from "../../shared/api/http";
import type { ListingFacets, ListingSummary } from "../../shared/api/types";
import { SORTS, toApiParams, type Filters } from "./useFilters";

const PAGE_SIZE = 12;

/** One page of results at a time; the API filters and sorts. */
export function useListings(filters: Filters) {
  const params = { ...toApiParams(filters), sort: SORTS.find((sort) => sort.value === filters.sort)!.api };
  return useInfiniteQuery({
    queryKey: ["catalog", "listings", params],
    queryFn: async ({ pageParam }) => (await http.get<ListingSummary[]>("/listings", { params: { ...params, page: pageParam, size: PAGE_SIZE } })).data,
    initialPageParam: 0,
    // A short page is the last one.
    getNextPageParam: (lastPage, pages) => (lastPage.length < PAGE_SIZE ? undefined : pages.length),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

/** The total and the count beside each filter. Called without filters, it describes the whole catalogue. */
export function useFacets(filters?: Filters) {
  const params = filters ? toApiParams(filters) : {};
  return useQuery({
    queryKey: ["catalog", "facets", params],
    queryFn: async () => (await http.get<ListingFacets>("/listings/facets", { params })).data,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
