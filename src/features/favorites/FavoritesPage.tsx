import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { plural } from "../../shared/lib/format";
import { useFavoritesStore } from "../../shared/stores/favoritesStore";
import { buttonClass } from "../../shared/ui/buttonClass";
import { EmptyState } from "../../shared/ui/Feedback";
import { ListingCard } from "../explore/ListingCard";

export function FavoritesPage() {
  const favorites = useFavoritesStore((state) => state.items);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Mes favoris</h1>
      <p className="mt-2 text-ink-500">
        {favorites.length > 0 ? `${plural(favorites.length, "annonce enregistrée", "annonces enregistrées")} sur cet appareil.` : "Gardez de côté les adresses qui vous plaisent."}
      </p>

      <div className="mt-8">
        {favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Aucun favori pour le moment"
            text="Touchez le cœur d'une annonce pour la retrouver ici."
            action={
              <Link to="/" className={buttonClass("primary")}>
                Explorer les annonces
              </Link>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((listing, index) => (
              <ListingCard key={listing.id} listing={listing} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
