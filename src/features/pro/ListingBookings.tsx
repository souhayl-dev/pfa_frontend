import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Inbox, Users } from "lucide-react";
import { errorMessage, http } from "../../shared/api/http";
import type { Booking, BookingStatus, Listing } from "../../shared/api/types";
import { cn } from "../../shared/lib/cn";
import { formatDateTime, formatMoney, plural } from "../../shared/lib/format";
import { BOOKING_STATUS } from "../../shared/lib/labels";
import { toast } from "../../shared/stores/toastStore";
import { Button } from "../../shared/ui/Button";
import { Alert, Badge, EmptyState, Skeleton } from "../../shared/ui/Feedback";

const FILTERS: (BookingStatus | "ALL")[] = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];

/** The bookings of every unit of a listing. The whole team, staff included, can act on them. */
export function ListingBookings({ listing }: { listing: Listing }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<BookingStatus | "ALL">("ALL");
  const bookings = useQuery({
    queryKey: ["pro", "listing", listing.id, "bookings", status],
    queryFn: async () =>
      (await http.get<Booking[]>(`/manage/listings/${listing.id}/bookings`, { params: status === "ALL" ? {} : { status } })).data,
  });

  const act = useMutation({
    mutationFn: ({ booking, action }: { booking: Booking; action: "confirm" | "cancel" | "no-show" }) =>
      http.post(`/bookings/${booking.id}/${action}`, action === "cancel" ? { reason: "Annulée par le prestataire" } : undefined),
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["pro", "listing", listing.id, "bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success(action === "confirm" ? "Réservation confirmée." : action === "cancel" ? "Réservation annulée." : "Absence enregistrée.");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <div>
      <div className="scrollbar-none mb-5 flex gap-2 overflow-x-auto">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setStatus(filter)}
            aria-pressed={status === filter}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition",
              status === filter ? "border-ink-900 bg-ink-900 text-white" : "border-sand-300 bg-white text-ink-600 hover:border-ink-400",
            )}
          >
            {filter === "ALL" ? "Toutes" : BOOKING_STATUS[filter].label}
          </button>
        ))}
      </div>

      {bookings.isLoading ? (
        <Skeleton className="h-40 rounded-3xl" />
      ) : bookings.isError ? (
        <Alert>{errorMessage(bookings.error)}</Alert>
      ) : bookings.data!.length === 0 ? (
        <EmptyState icon={Inbox} title="Aucune réservation" text="Les demandes des voyageurs apparaîtront ici." />
      ) : (
        <ul className="space-y-3">
          {bookings.data!.map((booking) => {
            const started = new Date(booking.startAt) <= new Date();
            const open = booking.status === "PENDING" || booking.status === "CONFIRMED";
            return (
              <li key={booking.id} className="rounded-3xl border border-sand-200 bg-white p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={BOOKING_STATUS[booking.status].tone}>{BOOKING_STATUS[booking.status].label}</Badge>
                      <span className="font-mono text-xs text-ink-500">{booking.code}</span>
                    </div>
                    <p className="mt-1.5 font-display text-lg font-semibold">{booking.clientName ?? "Client"}</p>
                    <p className="text-sm text-ink-600">{booking.unitName}</p>
                  </div>
                  <p className="text-xl font-extrabold tracking-tight">{formatMoney(booking.totalAmount, booking.currency)}</p>
                </div>
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
                {open && (
                  <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-sand-200 pt-3">
                    {booking.status === "CONFIRMED" && started && (
                      <Button variant="outline" size="sm" disabled={act.isPending} onClick={() => act.mutate({ booking, action: "no-show" })}>
                        Client absent
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={act.isPending}
                      onClick={() => window.confirm(`Annuler la réservation ${booking.code} ?`) && act.mutate({ booking, action: "cancel" })}
                    >
                      Annuler
                    </Button>
                    {booking.status === "PENDING" && (
                      <Button size="sm" disabled={act.isPending} onClick={() => act.mutate({ booking, action: "confirm" })}>
                        Confirmer
                      </Button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
