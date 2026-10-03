import { Navigate, useNavigate } from "react-router-dom";
import { CalendarCheck, Store, Users } from "lucide-react";
import { errorMessage } from "../../shared/api/http";
import { Alert, Skeleton } from "../../shared/ui/Feedback";
import { useMemberships } from "./api";
import { ProviderForm } from "./ProviderForm";

const STEPS = [
  { icon: Store, title: "Créez votre entreprise", text: "Notre équipe valide chaque prestataire avant la mise en ligne." },
  { icon: CalendarCheck, title: "Publiez vos annonces", text: "Chambres, tables, voitures, circuits : chaque offre a son prix et sa capacité." },
  { icon: Users, title: "Gérez à plusieurs", text: "Ajoutez vos collègues et confirmez les réservations ensemble." },
];

/** Sends a member to their provider, and offers anyone else to open a business. */
export function ProHomePage() {
  const memberships = useMemberships();
  const navigate = useNavigate();

  if (memberships.isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    );
  }
  if (memberships.isError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <Alert>{errorMessage(memberships.error)}</Alert>
      </div>
    );
  }

  const active = memberships.data!.find((membership) => membership.status === "ACTIVE");
  if (active) return <Navigate to={`/pro/${active.providerId}`} replace />;

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-16">
      <div>
        <p className="text-xs font-bold tracking-widest text-brand-600 uppercase">Espace prestataire</p>
        <h1 className="mt-2 font-display text-4xl leading-tight font-semibold tracking-tight">Proposez vos services sur Bookly</h1>
        <ul className="mt-8 space-y-5">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="flex animate-rise gap-4" style={{ animationDelay: `${index * 80}ms` }}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-pine-800 text-saffron-300">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-ink-500">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[2rem] border border-sand-200 bg-white p-6 shadow-card sm:p-8">
        <h2 className="mb-5 font-display text-2xl font-semibold">Votre entreprise</h2>
        <ProviderForm onSaved={(provider) => navigate(`/pro/${provider.id}`)} />
      </div>
    </div>
  );
}
