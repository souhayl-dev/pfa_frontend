import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleCheck, LoaderCircle, Minus, Plus, TriangleAlert } from "lucide-react";
import { translate } from "../../shared/api/errorMessages";
import { errorMessage, http } from "../../shared/api/http";
import type { Booking, Listing, PlaceBookingRequest, Unit, UnitType } from "../../shared/api/types";
import { formatDateTime, formatMoney, formatTime, todayIso } from "../../shared/lib/format";
import { PRICING_UNIT } from "../../shared/lib/labels";
import { useAuthStore } from "../../shared/stores/authStore";
import { toast } from "../../shared/stores/toastStore";
import { Button } from "../../shared/ui/Button";
import { Input, Textarea } from "../../shared/ui/Field";
import { useQuote, type QuoteParams } from "./api";

/**
 * How each unit type asks for its period, matching what the API reads:
 * rooms take two dates, a circuit one date, tables and transfers one moment, cars and guides two.
 */
const PERIOD: Record<UnitType, { start: "date" | "datetime-local"; end: "date" | "datetime-local" | null; startLabel: string; endLabel?: string }> = {
  ROOM: { start: "date", end: "date", startLabel: "Arrivée", endLabel: "Départ" },
  TOUR: { start: "date", end: null, startLabel: "Date de départ" },
  TABLE: { start: "datetime-local", end: null, startLabel: "Date et heure" },
  TRANSPORT: { start: "datetime-local", end: null, startLabel: "Date et heure de prise en charge" },
  CAR: { start: "datetime-local", end: "datetime-local", startLabel: "Prise en charge", endLabel: "Restitution" },
  GUIDE_SERVICE: { start: "datetime-local", end: "datetime-local", startLabel: "Début", endLabel: "Fin" },
};

const BILLED: Record<Unit["pricingUnit"], [string, string]> = {
  PER_NIGHT: ["nuit", "nuits"],
  PER_DAY: ["jour", "jours"],
  PER_TRIP: ["trajet", "trajets"],
  PER_PERSON: ["personne", "personnes"],
};

/** The API wants a local date-time; for date-only periods the time of day is ignored. */
const toLocalDateTime = (value: string) => (value.length === 10 ? `${value}T12:00` : value);

/** Rendered with key={unit.id}: another unit may ask for another kind of period, so the form starts over. */
export function BookingPanel({ listing, unit }: { listing: Listing; unit: Unit }) {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const period = PERIOD[unit.type];

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [guests, setGuests] = useState(1);
  const [requests, setRequests] = useState("");

  const complete = start !== "" && (period.end === null || end !== "");
  const quoteParams: QuoteParams | null = complete
    ? { unitId: unit.id, start: toLocalDateTime(start), end: period.end ? toLocalDateTime(end) : null, guests }
    : null;
  const quote = useQuote(quoteParams);

  const booking = useMutation({
    mutationFn: async () => {
      const body: PlaceBookingRequest = {
        unitId: unit.id,
        start: quoteParams!.start,
        end: quoteParams!.end,
        guestsCount: guests,
        specialRequests: requests.trim() || null,
      };
      return (await http.post<Booking>("/bookings", body)).data;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["quote"] });
      toast.success(`Demande envoyée : réservation ${created.code}`);
      navigate("/bookings");
    },
  });

  const min = period.start === "date" ? todayIso() : `${todayIso()}T00:00`;
  const available = quote.data?.available === true;
  const [singular, pluralForm] = BILLED[unit.pricingUnit];

  return (
    <div className="rounded-3xl border border-sand-200 bg-white p-5 shadow-lift">
      <p className="flex items-baseline gap-1.5 text-sm text-ink-500">
        <span className="text-3xl font-extrabold tracking-tight text-ink-900">{formatMoney(unit.basePrice, unit.currency)}</span>/ {PRICING_UNIT[unit.pricingUnit]}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-brand-700">{unit.name}</p>

      <div className="mt-5 space-y-3">
        <div className={period.end ? "grid grid-cols-1 gap-3 min-[26rem]:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" : ""}>
          <Input
            label={period.startLabel}
            type={period.start}
            min={min}
            value={start}
            onChange={(event) => {
              setStart(event.target.value);
              if (end && event.target.value >= end) setEnd("");
            }}
          />
          {period.end && <Input label={period.endLabel!} type={period.end} min={start || min} value={end} onChange={(event) => setEnd(event.target.value)} />}
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-semibold text-ink-700">Voyageurs</span>
          <div className="flex h-11 items-center justify-between rounded-xl border border-sand-300 px-1.5">
            <button
              type="button"
              onClick={() => setGuests(guests - 1)}
              disabled={guests <= 1}
              aria-label="Retirer un voyageur"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-700 hover:bg-sand-100 disabled:opacity-30"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold" aria-live="polite">
              {guests} <span className="font-medium text-ink-500">/ {unit.capacity} max</span>
            </span>
            <button
              type="button"
              onClick={() => setGuests(guests + 1)}
              disabled={guests >= unit.capacity}
              aria-label="Ajouter un voyageur"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-700 hover:bg-sand-100 disabled:opacity-30"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Live quote */}
      <div className="mt-4 min-h-[5.5rem] rounded-2xl bg-sand-50 p-4 text-sm" aria-live="polite">
        {!complete ? (
          <p className="text-ink-500">
            {listing.type === "HOTEL" && listing.hotel?.checkInTime
              ? `Arrivée dès ${formatTime(listing.hotel.checkInTime)}, départ avant ${formatTime(listing.hotel.checkOutTime)}. `
              : ""}
            Choisissez vos dates pour voir le prix et la disponibilité.
          </p>
        ) : quote.isFetching ? (
          <p className="flex items-center gap-2 text-ink-500">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            Vérification de la disponibilité...
          </p>
        ) : quote.isError ? (
          <p className="flex gap-2 text-rose-700">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {errorMessage(quote.error)}
          </p>
        ) : quote.data ? (
          <>
            <p className={available ? "flex items-center gap-2 font-semibold text-pine-700" : "flex gap-2 font-semibold text-rose-700"}>
              {available ? <CircleCheck className="h-4 w-4 shrink-0" aria-hidden /> : <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
              {available ? "Disponible" : translate(quote.data.reason ?? "Indisponible")}
            </p>
            {available && (
              <>
                <p className="mt-1 text-xs text-ink-500">
                  Du {formatDateTime(quote.data.startAt, listing.timezone)} au {formatDateTime(quote.data.endAt, listing.timezone)}
                </p>
                <div className="mt-3 flex items-baseline justify-between border-t border-sand-200 pt-3">
                  <span className="text-ink-600">
                    {formatMoney(quote.data.unitPrice, quote.data.currency)} × {quote.data.billedUnits} {quote.data.billedUnits > 1 ? pluralForm : singular}
                  </span>
                  <span className="text-xl font-extrabold tracking-tight">{formatMoney(quote.data.total, quote.data.currency)}</span>
                </div>
              </>
            )}
          </>
        ) : null}
      </div>

      {available && user && (
        <Textarea
          className="mt-3"
          label="Demande particulière (facultatif)"
          maxLength={1000}
          rows={2}
          value={requests}
          onChange={(event) => setRequests(event.target.value)}
          placeholder="Arrivée tardive, allergie, siège enfant..."
        />
      )}

      {booking.isError && <p className="mt-3 text-sm font-medium text-rose-700">{errorMessage(booking.error)}</p>}

      {user ? (
        <Button size="lg" className="mt-4 w-full" disabled={!available} loading={booking.isPending} onClick={() => booking.mutate()}>
          Réserver
        </Button>
      ) : (
        <Button size="lg" className="mt-4 w-full" onClick={() => navigate("/login", { state: { from: location.pathname } })}>
          Se connecter pour réserver
        </Button>
      )}
      <p className="mt-3 text-center text-xs text-ink-500">Aucun paiement en ligne : le prestataire confirme votre demande.</p>
    </div>
  );
}
