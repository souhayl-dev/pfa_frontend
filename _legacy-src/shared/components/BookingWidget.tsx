import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createBooking } from "../../features/bookings/api";
import { useAuthStore } from "../stores/authStore";
import { extractErrorMessage } from "../api/httpClient";
import { Button } from "./ui/Button";
import { Field, Input } from "./ui/Field";
import { Alert } from "./ui/Alert";
import type { ListingType } from "../api/types";

function nightsBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

interface Props {
  listingType: ListingType;
  listingId: string;
  basePrice: number;
  currency: string;
  maxQuantity: number;
  quantityLabel: string;
  singleDay?: boolean;
}

export function BookingWidget({ listingType, listingId, basePrice, currency, maxQuantity, quantityLabel, singleDay }: Props) {
  const role = useAuthStore((state) => state.role);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);

  const mutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      setStartDate("");
      setEndDate("");
      setQuantity(1);
    },
  });

  const effectiveEndDate = singleDay ? startDate : endDate;
  const nights = singleDay ? (startDate ? 1 : 0) : nightsBetween(startDate, endDate);
  const estimatedTotal = useMemo(() => {
    if (nights <= 0) return null;
    return (basePrice * nights * quantity).toFixed(2);
  }, [basePrice, nights, quantity]);

  function handleBook(event: FormEvent) {
    event.preventDefault();
    if (!startDate || !effectiveEndDate) return;
    mutation.mutate({ listingType, listingId, startDate, endDate: effectiveEndDate, quantity });
  }

  if (role !== "CUSTOMER") {
    return (
      <p className="rounded-xl bg-neutral-50 p-3 text-sm text-neutral-600">
        {role === "PROVIDER"
          ? "Les comptes prestataires ne peuvent pas réserver."
          : <>
              <Link to="/login" className="font-medium text-brand-600 hover:underline">Connectez-vous</Link> en tant que client pour réserver cette annonce.
            </>}
      </p>
    );
  }

  return (
    <form className="space-y-3" onSubmit={handleBook}>
      {singleDay ? (
        <Field label="Date">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </Field>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Arrivée">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </Field>
          <Field label="Départ">
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </Field>
        </div>
      )}
      <Field label={quantityLabel}>
        <Input type="number" min={1} max={maxQuantity} value={quantity}
               onChange={(e) => setQuantity(Number(e.target.value))} required />
      </Field>

      {estimatedTotal && (
        <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-sm">
          <span className="text-neutral-500">{nights} x {quantity}</span>
          <span className="font-semibold text-neutral-900">{estimatedTotal} {currency}</span>
        </div>
      )}

      <Button type="submit" fullWidth loading={mutation.isPending}>
        {mutation.isPending ? "Réservation en cours..." : "Confirmer la réservation"}
      </Button>

      {mutation.isError && <Alert variant="error">{extractErrorMessage(mutation.error)}</Alert>}
      {mutation.isSuccess && <Alert variant="success">Réservation confirmée ! Consultez « Mes réservations ».</Alert>}
    </form>
  );
}
