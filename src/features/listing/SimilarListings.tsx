import { useQuery } from "@tanstack/react-query";
import { http } from "../../shared/api/http";
import type { Listing, ListingSummary } from "../../shared/api/types";
import { ListingCard } from "../explore/ListingCard";

/** Other places in the same city, so the page is not a dead end. Renders nothing when there are none. */
export function SimilarListings({ listing }: { listing: Listing }) {
  const others = useQuery({
    queryKey: ["catalog", "same-city", listing.city],
    queryFn: async () => (await http.get<ListingSummary[]>("/listings", { params: { city: listing.city, size: 5 } })).data,
    staleTime: 60_000,
  });
  const cards = (others.data ?? []).filter((other) => other.id !== listing.id).slice(0, 4);
  if (cards.length === 0) return null;

  return (
    <section className="mt-16 border-t border-sand-200 pt-10">
      <h2 className="mb-5 font-display text-2xl font-semibold">Aussi à {listing.city}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <ListingCard key={card.id} listing={card} index={index} />
        ))}
      </div>
    </section>
  );
}
