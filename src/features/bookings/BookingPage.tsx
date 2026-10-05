import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarPlus, CircleCheck, MapPin, Phone, Users } from "lucide-react";
import { http } from "../../shared/api/http";
import type { Booking, Listing } from "../../shared/api/types";
import { countryName, formatDateTime, formatMoney, plural } from "../../shared/lib/format";
import { BOOKING_STATUS, UNIT_TYPE } from "../../shared/lib/labels";
import { Button } from "../../shared/ui/Button";
import { buttonClass } from "../../shared/ui/buttonClass";
import { Badge, Skeleton } from "../../shared/ui/Feedback";
import { BookingHistory } from "./MyBookingsPage";

/** A calendar file (.ics) for the booking, which every calendar app can import. */
function downloadCalendarFile(booking: Booking, listing: Listing | undefined) {
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const escape = (text: string) => text.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const place = listing ? [listing.address, listing.city, countryName(listing.countryCode)].filter(Boolean).join(", ") : booking.listingName;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bookly//Reservation//FR",
    "BEGIN:VEVENT",
    `UID:${booking.id}@bookly`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(booking.startAt)}`,
    `DTEND:${stamp(booking.endAt)}`,
    `SUMMARY:${escape(`${booking.listingName} - ${booking.unitName}`)}`,
    `LOCATION:${escape(place)}`,
    `DESCRIPTION:${escape(`Réservation ${booking.code} sur Bookly`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `reservation-${booking.code}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

/** One booking in full. Shown right after booking, where it doubles as the confirmation. */
export function BookingPage() {
  const { id = "" } = useParams();
  const justBooked = (useLocation().state as { justBooked?: boolean } | null)?.justBooked === true;
  const booking = useQuery({
    queryKey: ["bookings", id],
    queryFn: async () => (await http.get<Booking>(`/bookings/${id}`)).data,
  });
  // The listing adds the address and the phone; a booking stays readable if its listing has since gone offline.
  const listing = useQuery({
    queryKey: ["listing", booking.data?.listingId],
    enabled: !!booking.data,
    retry: false,
    queryFn: async () => (await http.get<Listing>(`/listings/${booking.data!.listingId}`)).data,
  });

  if (booking.isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }
  if (booking.isError || !booking.data) return <Navigate to="/bookings" replace />;

  const data = booking.data;
  const status = BOOKING_STATUS[data.status];
  const Icon = UNIT_TYPE[data.unitType].icon;
  const place = listing.data;

  return (
    <div className="mx-auto max-w-2xl animate-rise px-4 py-10 sm:px-6">
      {justBooked && (
        <div className="mb-6 flex items-start gap-3 rounded-3xl bg-pine-800 p-5 text-white">
          <CircleCheck className="mt-0.5 h-6 w-6 shrink-0 text-saffron-300" aria-hidden />
          <div>
            <h1 className="font-display text-2xl font-semibold">Demande envoyée</h1>
            <p className="mt-1 text-sm text-pine-100">Le prestataire doit maintenant la confirmer. Vous la retrouverez à tout moment dans « Mes réservations ».</p>
          </div>
        </div>
      )}

      <article className="overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-card">
        <header className="border-b border-dashed border-sand-300 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge tone={status.tone}>{status.label}</Badge>
            <p className="font-mono text-sm font-semibold tracking-wider">{data.code}</p>
          </div>
          <div className="mt-4 flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pine-50 text-pine-700">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0">
              {justBooked ? <h2 className="font-display text-2xl font-semibold">{data.listingName}</h2> : <h1 className="font-display text-2xl font-semibold">{data.listingName}</h1>}
              <p className="text-ink-600">{data.unitName}</p>
            </div>
          </div>
        </header>

        <dl className="grid gap-5 p-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold tracking-widest text-ink-500 uppercase">Début</dt>
            <dd className="mt-1 font-semibold">{formatDateTime(data.startAt, data.timezone)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold tracking-widest text-ink-500 uppercase">Fin</dt>
            <dd className="mt-1 font-semibold">{formatDateTime(data.endAt, data.timezone)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold tracking-widest text-ink-500 uppercase">Voyageurs</dt>
            <dd className="mt-1 flex items-center gap-1.5 font-semibold">
              <Users className="h-4 w-4 text-ink-400" aria-hidden />
              {plural(data.guestsCount, "voyageur")}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold tracking-widest text-ink-500 uppercase">Total</dt>
            <dd className="mt-1 text-2xl font-extrabold tracking-tight">{formatMoney(data.totalAmount, data.currency)}</dd>
          </div>
          {place && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-bold tracking-widest text-ink-500 uppercase">Adresse</dt>
              <dd className="mt-1 flex items-start gap-1.5 font-semibold">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                {[place.address, place.city, countryName(place.countryCode)].filter(Boolean).join(", ")}
              </dd>
            </div>
          )}
          {data.specialRequests && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-bold tracking-widest text-ink-500 uppercase">Votre demande</dt>
              <dd className="mt-1 text-ink-700 italic">« {data.specialRequests} »</dd>
            </div>
          )}
        </dl>

        <footer className="flex flex-wrap gap-2 border-t border-sand-200 bg-sand-50/60 p-4">
          <Button variant="dark" onClick={() => downloadCalendarFile(data, place)}>
            <CalendarPlus className="h-4 w-4" aria-hidden />
            Ajouter au calendrier
          </Button>
          {place?.phone && (
            <a href={`tel:${place.phone}`} className={buttonClass("outline")}>
              <Phone className="h-4 w-4" aria-hidden />
              Appeler le prestataire
            </a>
          )}
          {place && (
            <Link to={`/listings/${data.listingId}`} className={buttonClass("ghost")}>
              Voir l'annonce
            </Link>
          )}
        </footer>
      </article>

      <section className="mt-6 rounded-3xl border border-sand-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 font-display text-xl font-semibold">Suivi</h2>
        <BookingHistory booking={data} />
      </section>

      <Link to="/bookings" className="mt-6 inline-block text-sm font-semibold text-brand-700 hover:underline">
        Toutes mes réservations
      </Link>
    </div>
  );
}
