import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Building2, LayoutGrid, MapPin, Plus, Store, Users } from "lucide-react";
import { errorMessage } from "../../shared/api/http";
import { ListingArt } from "../../shared/components/ListingArt";
import { formatMoney } from "../../shared/lib/format";
import { LISTING_STATUS, LISTING_TYPE, MEMBER_ROLE, PROVIDER_STATUS } from "../../shared/lib/labels";
import { Button } from "../../shared/ui/Button";
import { Alert, Badge, EmptyState, Skeleton } from "../../shared/ui/Feedback";
import { Modal } from "../../shared/ui/Modal";
import { Tabs } from "../../shared/ui/Tabs";
import { canManageListings, useMemberships, useProvider, useProviderListings } from "./api";
import { ListingForm } from "./ListingForm";
import { ProviderForm } from "./ProviderForm";
import { TeamTab } from "./TeamTab";

type Tab = "listings" | "team" | "company";

function ListingsTab({ providerId, canManage }: { providerId: string; canManage: boolean }) {
  const listings = useProviderListings(providerId);
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const createButton = canManage && (
    <Button onClick={() => setCreating(true)}>
      <Plus className="h-4 w-4" aria-hidden />
      Nouvelle annonce
    </Button>
  );

  return (
    <>
      {listings.isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      ) : listings.isError ? (
        <Alert>{errorMessage(listings.error)}</Alert>
      ) : listings.data!.length === 0 ? (
        <EmptyState icon={Store} title="Aucune annonce pour le moment" text="Créez votre première annonce, ajoutez-y vos offres, puis mettez-la en ligne." action={createButton} />
      ) : (
        <>
          <div className="mb-5 flex justify-end">{createButton}</div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.data!.map((listing) => (
              <li key={listing.id}>
                <Link
                  to={`/pro/listings/${listing.id}`}
                  className="group block overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="relative h-32">
                    <ListingArt type={listing.type} photoUrl={listing.coverPhotoUrl} alt={listing.name} iconClassName="h-14 w-14" />
                    <Badge tone={LISTING_STATUS[listing.status].tone} className="absolute top-3 left-3 bg-white">
                      {LISTING_STATUS[listing.status].label}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-bold tracking-widest text-ink-500 uppercase">{LISTING_TYPE[listing.type].label}</p>
                    <h3 className="mt-0.5 font-display text-lg leading-snug font-semibold group-hover:text-brand-700">{listing.name}</h3>
                    <div className="mt-3 flex items-center justify-between text-sm text-ink-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-ink-400" aria-hidden />
                        {listing.city}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-ink-900">
                        {listing.fromPrice !== null ? `dès ${formatMoney(listing.fromPrice, listing.currency)}` : "Aucune offre"}
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {creating && (
        <Modal title="Nouvelle annonce" wide onClose={() => setCreating(false)}>
          <ListingForm providerId={providerId} onSaved={(listing) => navigate(`/pro/listings/${listing.id}`)} />
        </Modal>
      )}
    </>
  );
}

export function ProviderPage() {
  const { providerId = "" } = useParams();
  const navigate = useNavigate();
  const memberships = useMemberships();
  const provider = useProvider(providerId);
  const [tab, setTab] = useState<Tab>("listings");

  if (memberships.isLoading || provider.isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-10 sm:px-6">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  const membership = memberships.data?.find((m) => m.providerId === providerId && m.status === "ACTIVE");
  if (!membership || provider.isError || !provider.data) return <Navigate to="/pro" replace />;

  const status = PROVIDER_STATUS[provider.data.status];
  const others = memberships.data!.filter((m) => m.status === "ACTIVE");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="relative isolate overflow-hidden rounded-[2rem] bg-pine-950 p-6 text-white sm:p-8">
        <div className="absolute -top-24 -right-10 -z-10 h-64 w-64 rounded-full bg-brand-500/40 blur-[80px]" />
        <div className="zellige absolute inset-0 -z-10 opacity-[0.06]" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-saffron-300 uppercase">Espace prestataire · {MEMBER_ROLE[membership.role]}</p>
            <h1 className="mt-1.5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{provider.data.companyName}</h1>
            <Badge tone={status.tone} className="mt-3">
              {status.label}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {others.length > 1 && (
              <select
                aria-label="Changer d'entreprise"
                value={providerId}
                onChange={(event) => navigate(`/pro/${event.target.value}`)}
                className="h-10 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white backdrop-blur [&>option]:text-ink-900"
              >
                {others.map((m) => (
                  <option key={m.providerId} value={m.providerId}>
                    {m.companyName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </header>

      {provider.data.status !== "APPROVED" && (
        <div className="mt-5">
          <Alert kind="info">
            {provider.data.status === "PENDING"
              ? "Votre entreprise attend la validation de notre équipe. Vous pouvez déjà préparer vos annonces : elles pourront être mises en ligne dès la validation."
              : "Votre entreprise n'est pas validée : ses annonces ne sont pas visibles du public."}
          </Alert>
        </div>
      )}

      <div className="mt-6">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { key: "listings", label: "Annonces", icon: LayoutGrid },
            { key: "team", label: "Équipe", icon: Users },
            { key: "company", label: "Entreprise", icon: Building2 },
          ]}
        />
      </div>

      <div className="mt-6">
        {tab === "listings" && <ListingsTab providerId={providerId} canManage={canManageListings(membership.role)} />}
        {tab === "team" && <TeamTab providerId={providerId} myRole={membership.role} />}
        {tab === "company" && (
          <div className="max-w-2xl rounded-3xl border border-sand-200 bg-white p-6 shadow-card">
            {membership.role !== "OWNER" && <p className="mb-4 text-sm text-ink-500">Seul le propriétaire peut modifier ces informations.</p>}
            <ProviderForm key={provider.data.id} provider={provider.data} readOnly={membership.role !== "OWNER"} onSaved={() => {}} />
          </div>
        )}
      </div>
    </div>
  );
}
