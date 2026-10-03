import { useCallback, useEffect, useState } from "react";
import { LayoutGrid, Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import { errorMessage } from "../../shared/api/http";
import { cn } from "../../shared/lib/cn";
import { formatMoney, plural } from "../../shared/lib/format";
import { LISTING_TYPE, LISTING_TYPES } from "../../shared/lib/labels";
import { Button } from "../../shared/ui/Button";
import { Alert, EmptyState, Skeleton } from "../../shared/ui/Feedback";
import { Modal } from "../../shared/ui/Modal";
import { useFacets, useListings } from "./api";
import { FilterPanel } from "./FilterPanel";
import { ListingCard } from "./ListingCard";
import { SORTS, useFilters, type SortKey } from "./useFilters";

/** Typing fills a draft; the search itself starts once the typing pauses. */
function SearchBox({ value, onSearch }: { value: string; onSearch: (text: string) => void }) {
  const [draft, setDraft] = useState(value);
  const [seen, setSeen] = useState(value);
  // The filter changed elsewhere (a chip removed, a reset): the box follows it.
  if (value !== seen) {
    setSeen(value);
    setDraft(value);
  }

  useEffect(() => {
    if (draft === seen) return;
    const timer = setTimeout(() => {
      setSeen(draft);
      onSearch(draft);
    }, 300);
    return () => clearTimeout(timer);
  }, [draft, seen, onSearch]);

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        setSeen(draft);
        onSearch(draft);
        document.getElementById("resultats")?.scrollIntoView({ behavior: "smooth" });
      }}
      className="mt-8 flex max-w-2xl animate-rise items-center gap-2 rounded-2xl bg-white p-2 shadow-lift [animation-delay:180ms]"
    >
      <Search className="ml-3 h-5 w-5 shrink-0 text-ink-400" aria-hidden />
      <input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Une ville, un riad, un guide..."
        aria-label="Rechercher une annonce"
        className="h-11 min-w-0 flex-1 bg-transparent text-base text-ink-900 placeholder:text-ink-400 focus:outline-none"
      />
      <Button type="submit" size="md" className="px-5">
        Rechercher
      </Button>
    </form>
  );
}

export function ExplorePage() {
  const { filters, set, reset, activeCount } = useFilters();
  const listings = useListings(filters);
  const facets = useFacets(filters);
  const catalogue = useFacets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const search = useCallback((text: string) => set({ q: text }), [set]);

  const results = listings.data?.pages.flat() ?? [];
  const total = facets.data?.total ?? results.length;
  const typeCounts = facets.data?.types ?? {};
  const anyType = Object.values(typeCounts).reduce((sum, count) => sum + count, 0);
  const currency = results[0]?.currency ?? "EUR";

  const chips: { label: string; clear: () => void }[] = [
    ...(filters.q ? [{ label: `« ${filters.q} »`, clear: () => set({ q: null }) }] : []),
    ...(filters.type ? [{ label: LISTING_TYPE[filters.type].plural, clear: () => set({ type: null }) }] : []),
    ...(filters.city ? [{ label: filters.city, clear: () => set({ city: null }) }] : []),
    ...(filters.minPrice !== null || filters.maxPrice !== null
      ? [
          {
            label:
              filters.minPrice !== null && filters.maxPrice !== null
                ? `${formatMoney(filters.minPrice, currency)} - ${formatMoney(filters.maxPrice, currency)}`
                : filters.minPrice !== null
                  ? `Dès ${formatMoney(filters.minPrice, currency)}`
                  : `Jusqu'à ${formatMoney(filters.maxPrice!, currency)}`,
            clear: () => set({ min: null, max: null }),
          },
        ]
      : []),
    ...(filters.minRating > 0 ? [{ label: `Note ${String(filters.minRating).replace(".", ",")}+`, clear: () => set({ rating: null }) }] : []),
  ];

  const panel = facets.data ? (
    <FilterPanel facets={facets.data} filters={filters} set={set} reset={reset} activeCount={activeCount} currency={currency} />
  ) : (
    <Skeleton className="h-64" />
  );

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-pine-950 text-white">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-pine-900 via-pine-950 to-ink-900" />
        <div className="absolute -top-32 -right-24 -z-10 h-[28rem] w-[28rem] animate-drift rounded-full bg-brand-500/45 blur-[110px]" />
        <div className="absolute -bottom-40 left-1/4 -z-10 h-96 w-96 animate-drift rounded-full bg-saffron-400/25 blur-[110px] [animation-delay:-8s]" />
        <div className="zellige absolute inset-0 -z-10 opacity-[0.06]" />

        <div className="mx-auto max-w-7xl px-4 pt-14 pb-24 sm:px-6 sm:pt-20 sm:pb-28">
          <p className="inline-flex animate-rise items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-saffron-300 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-saffron-400" />
            {catalogue.data
              ? `${plural(catalogue.data.total, "adresse")} dans ${plural(Object.keys(catalogue.data.cities).length, "ville")}`
              : "Le Maroc, sans intermédiaire"}
          </p>
          <h1 className="mt-5 max-w-3xl animate-rise font-display text-4xl leading-[1.05] font-semibold tracking-tight [animation-delay:60ms] sm:text-6xl">
            Tout votre voyage,{" "}
            <span className="bg-gradient-to-r from-brand-300 via-saffron-300 to-brand-400 bg-clip-text pr-2 text-transparent italic">réservé d'un geste.</span>
          </h1>
          <p className="mt-4 max-w-xl animate-rise text-base text-pine-100/80 [animation-delay:120ms] sm:text-lg">
            Riads, bonnes tables, guides de montagne, circuits et voitures : comparez, filtrez, réservez.
          </p>

          <SearchBox value={filters.q} onSearch={search} />
        </div>
      </section>

      {/* Category rail, overlapping the hero */}
      <div id="resultats" className="relative z-10 mx-auto -mt-11 max-w-7xl scroll-mt-20 px-4 sm:px-6">
        <div className="scrollbar-none flex gap-2 overflow-x-auto rounded-3xl border border-sand-200 bg-white p-2 shadow-lift">
          <CategoryTab label="Tout" count={anyType} icon={LayoutGrid} selected={!filters.type} onClick={() => set({ type: null })} />
          {LISTING_TYPES.map((type) => (
            <CategoryTab
              key={type}
              label={LISTING_TYPE[type].plural}
              count={typeCounts[type] ?? 0}
              icon={LISTING_TYPE[type].icon}
              selected={filters.type === type}
              onClick={() => set({ type: filters.type === type ? null : type })}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[17rem_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border border-sand-200 bg-white p-5 shadow-card">
            <h2 className="mb-5 flex items-center gap-2 font-display text-xl font-semibold">
              <SlidersHorizontal className="h-5 w-5 text-brand-600" aria-hidden />
              Filtres
            </h2>
            {panel}
          </div>
        </aside>

        <section aria-live="polite" className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold">
              {listings.isLoading ? "Recherche..." : plural(total, "résultat")}
              {filters.city && <span className="text-ink-500"> à {filters.city}</span>}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDrawerOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-sand-300 bg-white px-3 text-sm font-semibold lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                Filtres
                {activeCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-xs text-white">{activeCount}</span>
                )}
              </button>
              <label className="flex h-10 items-center gap-2 rounded-xl border border-sand-300 bg-white pr-1 pl-3 text-sm">
                <span className="hidden text-ink-500 sm:inline">Trier</span>
                <select
                  value={filters.sort}
                  onChange={(event) => set({ sort: event.target.value === "recommended" ? null : (event.target.value as SortKey) })}
                  aria-label="Trier les résultats"
                  className="h-8 rounded-lg bg-transparent font-semibold focus:outline-none"
                >
                  {SORTS.map((sort) => (
                    <option key={sort.value} value={sort.value}>
                      {sort.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <button
                  key={chip.label}
                  onClick={chip.clear}
                  className="inline-flex animate-fade items-center gap-1.5 rounded-full bg-brand-50 py-1 pr-2 pl-3 text-sm font-semibold text-brand-800 ring-1 ring-brand-200 transition ring-inset hover:bg-brand-100"
                >
                  {chip.label}
                  <X className="h-3.5 w-3.5" aria-label="Retirer ce filtre" />
                </button>
              ))}
              <button onClick={reset} className="px-1 text-sm font-semibold text-ink-500 underline-offset-4 hover:text-ink-900 hover:underline">
                Tout effacer
              </button>
            </div>
          )}

          <div className="mt-6">
            {listings.isError ? (
              <Alert>{errorMessage(listings.error)}</Alert>
            ) : listings.isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <Skeleton key={index} className="aspect-[4/5] rounded-3xl" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="Aucune annonce ne correspond"
                text="Élargissez le budget, changez de destination ou retirez un filtre."
                action={
                  <Button variant="dark" onClick={reset}>
                    Réinitialiser les filtres
                  </Button>
                }
              />
            ) : (
              <>
                {/* Dimmed while the next search is on its way: the cards shown are still the previous answer. */}
                <div className={cn("grid gap-6 transition-opacity sm:grid-cols-2 xl:grid-cols-3", listings.isPlaceholderData && "opacity-50")}>
                  {results.map((listing, index) => (
                    <ListingCard key={listing.id} listing={listing} index={index % 12} />
                  ))}
                </div>
                {listings.hasNextPage && (
                  <div className="mt-8 flex flex-col items-center gap-2">
                    <p className="text-sm text-ink-500">
                      {results.length} sur {total}
                    </p>
                    <Button variant="outline" size="lg" loading={listings.isFetchingNextPage} onClick={() => listings.fetchNextPage()}>
                      Afficher plus d'annonces
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {drawerOpen && (
        <Modal title="Filtres" variant="sheet" onClose={() => setDrawerOpen(false)}>
          {panel}
          <Button className="mt-6 w-full" onClick={() => setDrawerOpen(false)}>
            Voir {plural(total, "résultat")}
          </Button>
        </Modal>
      )}
    </>
  );
}

interface CategoryTabProps {
  label: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  selected: boolean;
  onClick: () => void;
}

function CategoryTab({ label, count, icon: Icon, selected, onClick }: CategoryTabProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group flex min-w-fit flex-1 items-center justify-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold transition duration-200",
        selected ? "bg-ink-900 text-white shadow-card" : "text-ink-600 hover:bg-sand-100 hover:text-ink-900",
      )}
    >
      <Icon className={cn("h-5 w-5 transition group-hover:scale-110", selected ? "text-saffron-400" : "text-ink-400")} />
      {label}
      <span className={cn("rounded-full px-1.5 text-xs font-bold", selected ? "bg-white/15 text-white" : "bg-sand-100 text-ink-500")}>{count}</span>
    </button>
  );
}
