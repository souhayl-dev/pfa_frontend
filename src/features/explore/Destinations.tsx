import { useQueries } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { http, resolveAssetUrl } from "../../shared/api/http";
import type { ListingSummary } from "../../shared/api/types";
import { plural } from "../../shared/lib/format";

interface DestinationsProps {
  /** City -> number of listings, from the catalogue's facets. */
  cities: Record<string, number>;
  onPick: (city: string) => void;
}

const MAX_CITIES = 6;

/** The busiest cities as photo tiles. Each tile borrows the cover of the city's best listing. */
export function Destinations({ cities, onPick }: DestinationsProps) {
  const top = Object.entries(cities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_CITIES);
  const covers = useQueries({
    queries: top.map(([city]) => ({
      queryKey: ["catalog", "city-cover", city],
      queryFn: async () => (await http.get<ListingSummary[]>("/listings", { params: { city, size: 3 } })).data.find((listing) => listing.coverPhotoUrl)?.coverPhotoUrl ?? null,
      staleTime: 300_000,
    })),
  });

  if (top.length < 2) return null;

  return (
    <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6">
      <h2 className="mb-4 font-display text-2xl font-semibold">Destinations populaires</h2>
      <div className="scrollbar-none -mx-4 flex gap-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {top.map(([city, count], index) => {
          const cover = covers[index].data;
          return (
            <button
              key={city}
              onClick={() => onPick(city)}
              className="group relative h-40 w-60 shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br from-pine-600 to-pine-950 text-left shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift sm:w-auto sm:min-w-52 sm:flex-1"
            >
              {cover && <img src={resolveAssetUrl(cover)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-900 opacity-0 transition group-hover:opacity-100">
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </span>
              <span className="absolute bottom-3 left-4 text-white">
                <span className="block font-display text-xl font-semibold">{city}</span>
                <span className="text-sm text-white/85">{plural(count, "annonce")}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
