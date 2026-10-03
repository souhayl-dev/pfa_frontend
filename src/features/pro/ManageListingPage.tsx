import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, CornerDownRight, ExternalLink, Images, Info, MessageSquare, Package, Pencil, Plus, Power, Trash2, Users } from "lucide-react";
import { errorMessage, http } from "../../shared/api/http";
import type { Listing, Review, Unit } from "../../shared/api/types";
import { formatDate, formatMoney } from "../../shared/lib/format";
import { LISTING_STATUS, LISTING_TYPE, PRICING_UNIT, UNIT_TYPE } from "../../shared/lib/labels";
import { toast } from "../../shared/stores/toastStore";
import { Button } from "../../shared/ui/Button";
import { buttonClass } from "../../shared/ui/buttonClass";
import { Alert, Badge, EmptyState, Skeleton, Stars } from "../../shared/ui/Feedback";
import { Textarea } from "../../shared/ui/Field";
import { Modal } from "../../shared/ui/Modal";
import { Tabs } from "../../shared/ui/Tabs";
import { useListingReviews } from "../listing/api";
import { canManageListings, useManagedListing, useMemberships } from "./api";
import { ListingBookings } from "./ListingBookings";
import { ListingForm } from "./ListingForm";
import { PhotoManager } from "./PhotoManager";
import { UnitForm } from "./UnitForm";

type Tab = "units" | "bookings" | "photos" | "reviews" | "info";

function useRefreshListing(listingId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["pro"] });
    queryClient.invalidateQueries({ queryKey: ["listing", listingId] });
    queryClient.invalidateQueries({ queryKey: ["catalog"] });
  };
}

function UnitsTab({ listing, canManage }: { listing: Listing; canManage: boolean }) {
  const refresh = useRefreshListing(listing.id);
  // "new" opens an empty form; a unit opens it for editing or for its photos.
  const [editing, setEditing] = useState<Unit | "new" | null>(null);
  const [photosOf, setPhotosOf] = useState<string | null>(null);

  const act = useMutation({
    mutationFn: ({ unit, action }: { unit: Unit; action: "activate" | "deactivate" | "delete" }) =>
      action === "delete" ? http.delete(`/manage/units/${unit.id}`) : http.post(`/manage/units/${unit.id}/${action}`),
    onSuccess: refresh,
    onError: (error) => toast.error(errorMessage(error)),
  });

  const addButton = canManage && (
    <Button onClick={() => setEditing("new")}>
      <Plus className="h-4 w-4" aria-hidden />
      Ajouter une offre
    </Button>
  );
  const photoUnit = listing.units.find((unit) => unit.id === photosOf);

  return (
    <>
      {listing.units.length === 0 ? (
        <EmptyState icon={Package} title="Aucune offre" text="Une annonce a besoin d'au moins une offre réservable : chambre, table, voiture, circuit..." action={addButton} />
      ) : (
        <>
          <div className="mb-5 flex justify-end">{addButton}</div>
          <ul className="space-y-3">
            {listing.units.map((unit) => {
              const Icon = UNIT_TYPE[unit.type].icon;
              return (
                <li key={unit.id} className="flex flex-wrap items-center gap-4 rounded-3xl border border-sand-200 bg-white p-4 shadow-card">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-ink-600">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-semibold">{unit.name}</h3>
                      {!unit.active && <Badge tone="bg-sand-100 text-ink-600 ring-sand-300">Désactivée</Badge>}
                    </div>
                    <p className="flex flex-wrap items-center gap-x-3 text-sm text-ink-600">
                      {UNIT_TYPE[unit.type].label}
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" aria-hidden />
                        {unit.capacity}
                      </span>
                      <span className="font-semibold text-ink-900">
                        {formatMoney(unit.basePrice, unit.currency)} / {PRICING_UNIT[unit.pricingUnit]}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setPhotosOf(unit.id)}>
                      <Images className="h-4 w-4" aria-hidden />
                      Photos ({unit.photos.length})
                    </Button>
                    {canManage && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => setEditing(unit)}>
                          <Pencil className="h-4 w-4" aria-hidden />
                          Modifier
                        </Button>
                        <Button variant="ghost" size="sm" disabled={act.isPending} onClick={() => act.mutate({ unit, action: unit.active ? "deactivate" : "activate" })}>
                          <Power className="h-4 w-4" aria-hidden />
                          {unit.active ? "Désactiver" : "Activer"}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          aria-label={`Supprimer ${unit.name}`}
                          onClick={() => window.confirm(`Supprimer « ${unit.name} » ?`) && act.mutate({ unit, action: "delete" })}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Nouvelle offre" : `Modifier ${editing.name}`} wide onClose={() => setEditing(null)}>
          <UnitForm listing={listing} unit={editing === "new" ? undefined : editing} onSaved={() => setEditing(null)} />
        </Modal>
      )}
      {photoUnit && (
        <Modal title={`Photos · ${photoUnit.name}`} wide onClose={() => setPhotosOf(null)}>
          <PhotoManager photos={photoUnit.photos} target={`/manage/units/${photoUnit.id}/photos`} listingId={listing.id} canManage={canManage} />
        </Modal>
      )}
    </>
  );
}

function ReviewItem({ review, listingId }: { review: Review; listingId: string }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const reply = useMutation({
    mutationFn: () => http.post(`/reviews/${review.id}/reply`, { text: text.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listing", listingId, "reviews"] });
      toast.success("Réponse publiée.");
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    reply.mutate();
  };

  return (
    <li className="rounded-3xl border border-sand-200 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          {review.authorName} <span className="font-medium text-ink-500">· {formatDate(review.createdAt)}</span>
        </p>
        <Stars value={review.rating} />
      </div>
      {review.comment && <p className="mt-2 text-sm text-ink-700">{review.comment}</p>}
      {review.reply ? (
        <p className="mt-3 flex gap-2 rounded-2xl bg-sand-50 p-3 text-sm text-ink-700">
          <CornerDownRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
          {review.reply}
        </p>
      ) : (
        <form onSubmit={submit} className="mt-3 space-y-2">
          <Textarea label="Votre réponse" required maxLength={2000} rows={2} value={text} onChange={(event) => setText(event.target.value)} />
          {reply.isError && <p className="text-sm font-medium text-rose-700">{errorMessage(reply.error)}</p>}
          <Button type="submit" variant="dark" size="sm" loading={reply.isPending}>
            Répondre
          </Button>
        </form>
      )}
    </li>
  );
}

function ReviewsTab({ listing }: { listing: Listing }) {
  const reviews = useListingReviews(listing.id);
  if (reviews.isLoading) return <Skeleton className="h-32 rounded-3xl" />;
  // The reviews endpoint is the public one, so it answers 404 while the listing is not online.
  if (reviews.isError || !reviews.data?.length) {
    return <EmptyState icon={MessageSquare} title="Pas encore d'avis" text="Les avis apparaissent après les réservations terminées." />;
  }
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {reviews.data.map((review) => (
        <ReviewItem key={review.id} review={review} listingId={listing.id} />
      ))}
    </ul>
  );
}

export function ManageListingPage() {
  const { listingId = "" } = useParams();
  const navigate = useNavigate();
  const refresh = useRefreshListing(listingId);
  const memberships = useMemberships();
  const listing = useManagedListing(listingId);
  const [tab, setTab] = useState<Tab>("units");

  const setStatus = useMutation({
    mutationFn: (action: "activate" | "deactivate") => http.post(`/manage/listings/${listingId}/${action}`),
    onSuccess: (_, action) => {
      refresh();
      toast.success(action === "activate" ? "Annonce en ligne." : "Annonce hors ligne.");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: () => http.delete(`/manage/listings/${listingId}`),
    onSuccess: () => {
      refresh();
      toast.success("Annonce supprimée.");
      navigate(`/pro/${listing.data!.providerId}`);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  if (listing.isLoading || memberships.isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-5 px-4 py-10 sm:px-6">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }
  if (listing.isError || !listing.data) return <Navigate to="/pro" replace />;

  const data = listing.data;
  const role = memberships.data?.find((m) => m.providerId === data.providerId && m.status === "ACTIVE")?.role;
  const canManage = canManageListings(role);
  const status = LISTING_STATUS[data.status];
  const online = data.status === "ACTIVE";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link to={`/pro/${data.providerId}`} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {data.providerName}
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={status.tone}>{status.label}</Badge>
            <span className="text-xs font-bold tracking-widest text-ink-500 uppercase">{LISTING_TYPE[data.type].label}</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{data.name}</h1>
          <p className="text-sm text-ink-500">
            {data.city} · {data.currency}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {online && (
            <Link to={`/listings/${data.id}`} className={buttonClass("outline", "sm")}>
              <ExternalLink className="h-4 w-4" aria-hidden />
              Page publique
            </Link>
          )}
          {canManage && (
            <>
              <Button variant={online ? "outline" : "primary"} size="sm" loading={setStatus.isPending} onClick={() => setStatus.mutate(online ? "deactivate" : "activate")}>
                <Power className="h-4 w-4" aria-hidden />
                {online ? "Mettre hors ligne" : "Mettre en ligne"}
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={remove.isPending}
                onClick={() => window.confirm(`Supprimer définitivement « ${data.name} » ?`) && remove.mutate()}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Supprimer
              </Button>
            </>
          )}
        </div>
      </header>

      {!canManage && (
        <div className="mt-5">
          <Alert kind="info">Votre rôle permet de consulter l'annonce et de traiter ses réservations, pas de la modifier.</Alert>
        </div>
      )}

      <div className="mt-6">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { key: "units", label: "Offres", icon: Package, count: data.units.length },
            { key: "bookings", label: "Réservations", icon: CalendarDays },
            { key: "photos", label: "Photos", icon: Images, count: data.photos.length },
            { key: "reviews", label: "Avis", icon: MessageSquare, count: data.reviewsCount },
            { key: "info", label: "Informations", icon: Info },
          ]}
        />
      </div>

      <div className="mt-6">
        {tab === "units" && <UnitsTab listing={data} canManage={canManage} />}
        {tab === "bookings" && <ListingBookings listing={data} />}
        {tab === "photos" && <PhotoManager photos={data.photos} target={`/manage/listings/${data.id}/photos`} listingId={data.id} canManage={canManage} />}
        {tab === "reviews" && <ReviewsTab listing={data} />}
        {tab === "info" && (
          <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card">
            <ListingForm key={data.id} providerId={data.providerId} listing={data} readOnly={!canManage} onSaved={() => {}} />
          </div>
        )}
      </div>
    </div>
  );
}
