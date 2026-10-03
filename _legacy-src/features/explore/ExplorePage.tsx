import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Key, Compass, MapPin, SearchX } from "lucide-react";
import { searchHotels } from "../hotels/api";
import { searchCarRentals } from "../carrentals/api";
import { searchAttractions } from "../attractions/api";
import { ListingCard } from "../../shared/components/ListingCard";
import { ListingCardSkeleton } from "../../shared/components/ui/Skeleton";
import { EmptyState } from "../../shared/components/ui/EmptyState";
import { Input } from "../../shared/components/ui/Field";
import { cn } from "../../shared/lib/cn";
import type { ListingType } from "../../shared/api/types";

const TABS: { value: ListingType; label: string; icon: typeof Building2 }[] = [
  { value: "HOTEL", label: "Hôtels & Riads", icon: Building2 },
  { value: "CAR_RENTAL", label: "Location de voitures", icon: Key },
  { value: "ATTRACTION", label: "Attractions", icon: Compass },
];

export function ExplorePage() {
  const [tab, setTab] = useState<ListingType>("HOTEL");
  const [city, setCity] = useState("");

  const hotelsQuery = useQuery({
    queryKey: ["hotels", city],
    queryFn: () => searchHotels({ city: city || undefined }),
    enabled: tab === "HOTEL",
  });
  const carRentalsQuery = useQuery({
    queryKey: ["car-rentals", city],
    queryFn: () => searchCarRentals({ city: city || undefined }),
    enabled: tab === "CAR_RENTAL",
  });
  const attractionsQuery = useQuery({
    queryKey: ["attractions", city],
    queryFn: () => searchAttractions({ city: city || undefined }),
    enabled: tab === "ATTRACTION",
  });

  const activeQuery = tab === "HOTEL" ? hotelsQuery : tab === "CAR_RENTAL" ? carRentalsQuery : attractionsQuery;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-700 px-6 py-12 text-white sm:px-10 sm:py-16">
        <h1 className="max-w-lg text-3xl font-extrabold tracking-tight sm:text-4xl">
          Séjours, locations et expériences proposés par des hôtes locaux
        </h1>
        <p className="mt-2 max-w-md text-neutral-300">
          Chaque annonce est gérée par un hôte ou prestataire indépendant que vous pouvez réserver directement.
        </p>
        <div className="mt-6 flex max-w-xl items-center gap-2 rounded-2xl bg-white p-2 shadow-xl">
          <MapPin className="ml-2 size-5 shrink-0 text-neutral-400" />
          <Input
            placeholder="Rechercher par ville..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border-none text-neutral-900 shadow-none focus:ring-0"
          />
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              tab === value
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 text-neutral-700 hover:border-neutral-900",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {activeQuery.isError && (
        <EmptyState icon={SearchX} title="Impossible de charger les annonces" description="Vérifiez que l'API est démarrée et réessayez." />
      )}

      {activeQuery.isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      )}

      {activeQuery.data && activeQuery.data.length === 0 && (
        <EmptyState icon={SearchX} title="Aucune annonce ne correspond à votre recherche" description="Essayez une autre ville ou catégorie." />
      )}

      {tab === "HOTEL" && hotelsQuery.data && hotelsQuery.data.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hotelsQuery.data.map((listing) => (
            <ListingCard key={listing.id} to={`/hotels/${listing.id}`} title={listing.title}
                         city={listing.address.city} country={listing.address.country} price={listing.basePrice}
                         currency={listing.currency} priceUnit="/ nuit" listingType="HOTEL"
                         coverPhotoUrl={listing.coverPhotoUrl} />
          ))}
        </div>
      )}

      {tab === "CAR_RENTAL" && carRentalsQuery.data && carRentalsQuery.data.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {carRentalsQuery.data.map((listing) => (
            <ListingCard key={listing.id} to={`/car-rentals/${listing.id}`} title={listing.title}
                         city={listing.address.city} country={listing.address.country} price={listing.basePrice}
                         currency={listing.currency} priceUnit="/ jour" listingType="CAR_RENTAL"
                         coverPhotoUrl={listing.coverPhotoUrl} />
          ))}
        </div>
      )}

      {tab === "ATTRACTION" && attractionsQuery.data && attractionsQuery.data.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {attractionsQuery.data.map((listing) => (
            <ListingCard key={listing.id} to={`/attractions/${listing.id}`} title={listing.title}
                         city={listing.address.city} country={listing.address.country} price={listing.basePrice}
                         currency={listing.currency} priceUnit="/ personne" listingType="ATTRACTION"
                         attractionType={listing.attractionType} coverPhotoUrl={listing.coverPhotoUrl} />
          ))}
        </div>
      )}
    </div>
  );
}
