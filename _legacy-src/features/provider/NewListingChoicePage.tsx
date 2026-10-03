import { Link } from "react-router-dom";
import { Building2, Key, Compass } from "lucide-react";

const OPTIONS = [
  { to: "/provider/listings/new/hotel", icon: Building2, title: "Hôtel, riad ou maison d'hôte", gradient: "from-sky-400 to-blue-600" },
  { to: "/provider/listings/new/car-rental", icon: Key, title: "Voiture à louer", gradient: "from-emerald-400 to-teal-600" },
  { to: "/provider/listings/new/attraction", icon: Compass, title: "Attraction (activité, restauration, circuit)", gradient: "from-amber-400 to-orange-600" },
];

export function NewListingChoicePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-neutral-900">Que souhaitez-vous ajouter ?</h1>
      <p className="mt-1 text-sm text-neutral-500">Choisissez le type d'annonce à publier.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {OPTIONS.map(({ to, icon: Icon, title, gradient }) => (
          <Link
            key={to}
            to={to}
            className="group overflow-hidden rounded-2xl border border-neutral-200 transition-shadow hover:shadow-lg"
          >
            <div className={`flex aspect-square items-center justify-center bg-gradient-to-br ${gradient}`}>
              <Icon className="size-10 text-white/90" strokeWidth={1.5} />
            </div>
            <p className="p-3 text-sm font-medium text-neutral-900">{title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
