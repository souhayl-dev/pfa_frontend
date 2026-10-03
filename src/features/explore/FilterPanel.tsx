import { useState } from "react";
import { RotateCcw, Star } from "lucide-react";
import type { ListingFacets } from "../../shared/api/types";
import { cn } from "../../shared/lib/cn";
import { formatMoney } from "../../shared/lib/format";
import type { Filters, useFilters } from "./useFilters";

interface FilterPanelProps {
  /** Counts from the API: each facet applies every filter except its own. */
  facets: ListingFacets;
  filters: Filters;
  set: ReturnType<typeof useFilters>["set"];
  reset: () => void;
  activeCount: number;
  currency: string;
}

const RATINGS = [
  { value: 0, label: "Toutes" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
  { value: 4.5, label: "4,5+" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-sand-200 py-5 first:border-t-0 first:pt-0">
      <h3 className="mb-3 text-xs font-bold tracking-widest text-ink-500 uppercase">{title}</h3>
      {children}
    </section>
  );
}

interface PriceRangeProps {
  floor: number;
  ceiling: number;
  filters: Filters;
  set: FilterPanelProps["set"];
  currency: string;
}

/** The thumbs move freely; the search only runs when one is released. */
function PriceRange({ floor, ceiling, filters, set, currency }: PriceRangeProps) {
  const [dragging, setDragging] = useState<{ low: number; high: number } | null>(null);
  const clamp = (value: number) => Math.min(ceiling, Math.max(floor, value));
  const low = dragging?.low ?? clamp(filters.minPrice ?? floor);
  const high = dragging?.high ?? clamp(filters.maxPrice ?? ceiling);
  const span = Math.max(ceiling - floor, 1);

  const commit = () => {
    if (!dragging) return;
    set({ min: dragging.low <= floor ? null : dragging.low, max: dragging.high >= ceiling ? null : dragging.high });
    setDragging(null);
  };
  const release = { onPointerUp: commit, onKeyUp: commit, onBlur: commit };

  return (
    <>
      <div className="flex items-baseline justify-between text-sm font-bold">
        <span>{formatMoney(low, currency)}</span>
        <span>{formatMoney(high, currency)}</span>
      </div>
      <div className="relative mt-3 h-6">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-sand-200" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
          style={{ left: `${((low - floor) / span) * 100}%`, right: `${((ceiling - high) / span) * 100}%` }}
        />
        <input
          type="range"
          className="range-dual"
          aria-label="Prix minimum"
          min={floor}
          max={ceiling}
          value={low}
          onChange={(event) => setDragging({ low: Math.min(Number(event.target.value), high), high })}
          {...release}
        />
        <input
          type="range"
          className="range-dual"
          aria-label="Prix maximum"
          min={floor}
          max={ceiling}
          value={high}
          onChange={(event) => setDragging({ low, high: Math.max(Number(event.target.value), low) })}
          {...release}
        />
      </div>
      <p className="mt-2 text-xs text-ink-500">Prix de départ de l'annonce.</p>
    </>
  );
}

export function FilterPanel({ facets, filters, set, reset, activeCount, currency }: FilterPanelProps) {
  // The chosen city stays visible even when the other filters leave it without a result.
  const cities = Object.entries(facets.cities);
  if (filters.city && !cities.some(([city]) => city.toLowerCase() === filters.city!.toLowerCase())) {
    cities.push([filters.city, 0]);
  }

  const floor = Math.floor(facets.minPrice ?? 0);
  const ceiling = Math.ceil(facets.maxPrice ?? 0);

  return (
    <div>
      <Section title="Destination">
        {cities.length === 0 && <p className="text-sm text-ink-500">Aucune destination pour cette recherche.</p>}
        <div className="flex flex-wrap gap-2">
          {cities.map(([city, count]) => {
            const selected = filters.city?.toLowerCase() === city.toLowerCase();
            return (
              <button
                key={city}
                onClick={() => set({ city: selected ? null : city })}
                aria-pressed={selected}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition",
                  selected ? "border-ink-900 bg-ink-900 text-white" : "border-sand-300 bg-white text-ink-700 hover:border-ink-400",
                )}
              >
                {city}
                <span className={cn("text-xs font-medium", selected ? "text-white/70" : "text-ink-400")}>{count}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {ceiling > floor && (
        <Section title="Budget">
          <PriceRange floor={floor} ceiling={ceiling} filters={filters} set={set} currency={currency} />
        </Section>
      )}

      <Section title="Note des voyageurs">
        <div className="grid grid-cols-4 gap-1 rounded-xl bg-sand-100 p-1">
          {RATINGS.map((rating) => {
            const selected = filters.minRating === rating.value;
            return (
              <button
                key={rating.value}
                onClick={() => set({ rating: rating.value })}
                aria-pressed={selected}
                className={cn(
                  "inline-flex h-9 items-center justify-center gap-1 rounded-lg text-sm font-semibold transition",
                  selected ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-900",
                )}
              >
                {rating.value > 0 && <Star className="h-3.5 w-3.5 fill-saffron-400 text-saffron-400" aria-hidden />}
                {rating.label}
              </button>
            );
          })}
        </div>
      </Section>

      {activeCount > 0 && (
        <button onClick={reset} className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900">
          <RotateCcw className="h-4 w-4" aria-hidden />
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}
