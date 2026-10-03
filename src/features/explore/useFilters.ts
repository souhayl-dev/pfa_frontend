import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { ListingSort, ListingType } from "../../shared/api/types";
import { LISTING_TYPES } from "../../shared/lib/labels";

export type SortKey = "recommended" | "price-asc" | "price-desc" | "rating" | "name";

export const SORTS: { value: SortKey; label: string; api: ListingSort }[] = [
  { value: "recommended", label: "Recommandés", api: "RECOMMENDED" },
  { value: "price-asc", label: "Prix croissant", api: "PRICE_ASC" },
  { value: "price-desc", label: "Prix décroissant", api: "PRICE_DESC" },
  { value: "rating", label: "Mieux notés", api: "RATING" },
  { value: "name", label: "Nom (A-Z)", api: "NAME" },
];

export interface Filters {
  q: string;
  type: ListingType | null;
  city: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number;
  sort: SortKey;
}

type FilterKey = "q" | "type" | "city" | "min" | "max" | "rating" | "sort";

/** The filters live in the URL, so a search can be shared, bookmarked and survives a reload. */
export function useFilters() {
  const [params, setParams] = useSearchParams();

  const filters: Filters = useMemo(() => {
    const type = params.get("type") as ListingType | null;
    const sort = params.get("sort") as SortKey | null;
    const number = (key: string) => {
      const value = Number(params.get(key) ?? NaN);
      return Number.isFinite(value) && value >= 0 ? value : null;
    };
    return {
      q: params.get("q") ?? "",
      type: type && LISTING_TYPES.includes(type) ? type : null,
      city: params.get("city"),
      minPrice: number("min"),
      maxPrice: number("max"),
      minRating: Math.min(number("rating") ?? 0, 5),
      sort: sort && SORTS.some((s) => s.value === sort) ? sort : "recommended",
    };
  }, [params]);

  const set = useCallback(
    (changes: Partial<Record<FilterKey, string | number | null>>) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          for (const [key, value] of Object.entries(changes)) {
            if (value === null || value === "" || value === 0) next.delete(key);
            else next.set(key, String(value));
          }
          return next;
        },
        { replace: true, preventScrollReset: true },
      );
    },
    [setParams],
  );

  const reset = useCallback(() => setParams({}, { replace: true, preventScrollReset: true }), [setParams]);

  const activeCount =
    Number(!!filters.q) +
    Number(!!filters.type) +
    Number(!!filters.city) +
    Number(filters.minPrice !== null || filters.maxPrice !== null) +
    Number(filters.minRating > 0);

  return { filters, set, reset, activeCount };
}

/** The filters as the API's query parameters; the sort only matters to the search, not to its facets. */
export function toApiParams(filters: Filters) {
  // A range typed upside down in the URL would be refused by the API; the search then ignores its upper end.
  const maxPrice = filters.minPrice !== null && filters.maxPrice !== null && filters.maxPrice < filters.minPrice ? null : filters.maxPrice;
  return {
    q: filters.q.trim() || undefined,
    type: filters.type ?? undefined,
    city: filters.city ?? undefined,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: maxPrice ?? undefined,
    minRating: filters.minRating || undefined,
  };
}
