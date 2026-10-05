import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, History, Ticket, Users } from "lucide-react";
import { errorMessage, http } from "../../shared/api/http";
import type { Booking, BookingStatus, StatusChange } from "../../shared/api/types";
import { cn } from "../../shared/lib/cn";
import { formatDateTime, formatMoney, plural } from "../../shared/lib/format";
import { BOOKING_STATUS, UNIT_TYPE } from "../../shared/lib/labels";
import { toast } from "../../shared/stores/toastStore";
import { Button } from "../../shared/ui/Button";
import { buttonClass } from "../../shared/ui/buttonClass";
import { Alert, Badge, EmptyState, Skeleton, Stars } from "../../shared/ui/Feedback";
import { Textarea } from "../../shared/ui/Field";
import { Modal } from "../../shared/ui/Modal";

type Tab = "upcoming" | "past" | "cancelled";

const TABS: { key: Tab; label: string; statuses: BookingStatus[] }[] = [
  { key: "upcoming", label: "À venir", statuses: ["PENDING", "CONFIRMED"] },
  { key: "past", label: "Terminées", statuses: ["COMPLETED", "NO_SHOW"] },
  { key: "cancelled", label: "Annulées", statuses: ["CANCELLED"] },
];

export function BookingHistory({ booking }: { booking: Booking }) {
  const history = useQuery({
    queryKey: ["bookings", booking.id, "history"],
    queryFn: async () => (await http.get<StatusChange[]>(`/bookings/${booking.id}/history`)).data,
  });
  if (history.isLoading) return <Skeleton className="h-24" />;
  if (history.isError) return <Alert>{errorMessage(history.error)}</Alert>;
  return (
    <ol className="space-y-4">
      {history.data!.map((change, index) => (
        <li key={index} className="flex gap-3">
          <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", index === history.data!.length - 1 ? "bg-brand-500" : "bg-sand-300")} />
          <div className="text-sm">
            <p className="font-semibold">{BOOKING_STATUS[change.toStatus].label}</p>
            <p className="text-ink-500">
              {formatDateTime(change.changedAt, booking.timezone)}
              {change.changedBy === null && " · automatique"}
            </p>
            {change.reason && <p className="mt-0.5 text-ink-700">« {change.reason} »</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function CancelModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const cancel = useMutation({
    mutationFn: () => http.post(`/bookings/${booking.id}/cancel`, { reason: reason.trim() || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Réservation annulée.");
      onClose();
    },
  });
  return (
    <Modal title="Annuler la réservation" onClose={onClose}>
      <p className="text-sm text-ink-600">
        {booking.unitName} · {booking.listingName}. Cette action est définitive.
      </p>
      <Textarea className="mt-4" label="Motif (facultatif)" maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} />
      {cancel.isError && <p className="mt-3 text-sm font-medium text-rose-700">{errorMessage(cancel.error)}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Garder
        </Button>
        <Button variant="danger" loading={cancel.isPending} onClick={() => cancel.mutate()}>
          Annuler la réservation
        </Button>
      </div>
    </Modal>
  );
}

function ReviewModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const review = useMutation({
    mutationFn: () => http.post(`/bookings/${booking.id}/review`, { rating, comment: comment.trim() || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["listing", booking.listingId] });
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      toast.success("Merci pour votre avis !");
      onClose();
    },
  });
  return (
    <Modal title="Votre avis" onClose={onClose}>
      <p className="text-sm text-ink-600">Comment s'est passée votre expérience chez {booking.listingName} ?</p>
      <div className="mt-4 flex justify-center">
        <Stars value={rating} onChange={setRating} size="lg" />
      </div>
      <Textarea
        className="mt-4"
        label="Commentaire (facultatif)"
        rows={4}
        maxLength={2000}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />
      {review.isError && <p className="mt-3 text-sm font-medium text-rose-700">{errorMessage(review.error)}</p>}
      <Button className="mt-5 w-full" loading={review.isPending} onClick={() => review.mutate()}>
        Publier l'avis
      </Button>
    </Modal>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const [modal, setModal] = useState<"cancel" | "review" | "history" | null>(null);
  const status = BOOKING_STATUS[booking.status];
  const Icon = UNIT_TYPE[booking.unitType].icon;
  const cancellable = (booking.status === "PENDING" || booking.status === "CONFIRMED") && new Date(booking.startAt) > new Date();

  return (
    <li className="animate-rise overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-card">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pine-50 text-pine-700">
          <Icon className="h-6 w-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={status.tone}>{status.label}</Badge>
            <span className="font-mono text-xs text-ink-500">{booking.code}</span>
          </div>
          <Link to={`/listings/${booking.listingId}`} className="mt-1.5 block font-display text-xl font-semibold hover:text-brand-700">
            {booking.listingName}
          </Link>
          <p className="text-sm text-ink-600">{booking.unitName}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-700">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-ink-400" aria-hidden />
              {formatDateTime(booking.startAt, booking.timezone)} → {formatDateTime(booking.endAt, booking.timezone)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-ink-400" aria-hidden />
              {plural(booking.guestsCount, "voyageur")}
            </span>
          </div>
          {booking.specialRequests && <p className="mt-2 text-sm text-ink-500 italic">« {booking.specialRequests} »</p>}
        </div>
        <p className="text-2xl font-extrabold tracking-tight sm:text-right">{formatMoney(booking.totalAmount, booking.currency)}</p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-sand-200 bg-sand-50/60 px-5 py-3">
        <Button variant="ghost" size="sm" onClick={() => setModal("history")}>
          <History className="h-4 w-4" aria-hidden />
          Historique
        </Button>
        <Link to={`/bookings/${booking.id}`} className={buttonClass("outline", "sm")}>
          Détails
        </Link>
        {cancellable && (
          <Button variant="danger" size="sm" onClick={() => setModal("cancel")}>
            Annuler
          </Button>
        )}
        {booking.status === "COMPLETED" &&
          (booking.reviewId ? (
            <Link to={`/listings/${booking.listingId}#avis`} className={buttonClass("outline", "sm")}>
              Voir mon avis
            </Link>
          ) : (
            <Button size="sm" onClick={() => setModal("review")}>
              Laisser un avis
            </Button>
          ))}
      </div>

      {modal === "cancel" && <CancelModal booking={booking} onClose={() => setModal(null)} />}
      {modal === "review" && <ReviewModal booking={booking} onClose={() => setModal(null)} />}
      {modal === "history" && (
        <Modal title={`Réservation ${booking.code}`} onClose={() => setModal(null)}>
          <BookingHistory booking={booking} />
        </Modal>
      )}
    </li>
  );
}

export function MyBookingsPage() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const bookings = useQuery({
    queryKey: ["bookings", "mine"],
    queryFn: async () => (await http.get<Booking[]>("/bookings/mine")).data,
  });

  const all = bookings.data ?? [];
  const current = TABS.find((t) => t.key === tab)!;
  const visible = all.filter((booking) => current.statuses.includes(booking.status));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Mes réservations</h1>
      <p className="mt-2 text-ink-500">Suivez vos demandes, annulez avant le départ et notez vos expériences.</p>

      <div className="mt-6 inline-flex gap-1 rounded-2xl bg-sand-100 p-1" role="tablist">
        {TABS.map((item) => {
          const count = all.filter((booking) => item.statuses.includes(booking.status)).length;
          return (
            <button
              key={item.key}
              role="tab"
              aria-selected={tab === item.key}
              onClick={() => setTab(item.key)}
              className={cn(
                "flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition",
                tab === item.key ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-900",
              )}
            >
              {item.label}
              <span className="rounded-full bg-sand-200 px-1.5 text-xs">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {bookings.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-44 rounded-3xl" />
            <Skeleton className="h-44 rounded-3xl" />
          </div>
        ) : bookings.isError ? (
          <Alert>{errorMessage(bookings.error)}</Alert>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title={tab === "upcoming" ? "Aucune réservation à venir" : "Rien ici pour le moment"}
            text={tab === "upcoming" ? "Trouvez un riad, une table ou un circuit et réservez en quelques clics." : undefined}
            action={
              tab === "upcoming" ? (
                <Link to="/" className={buttonClass("primary")}>
                  Explorer les annonces
                </Link>
              ) : undefined
            }
          />
        ) : (
          <ul className="space-y-4">
            {visible.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
