import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorMessage, http } from "../../shared/api/http";
import type { Listing, ListingRequest, ListingType } from "../../shared/api/types";
import { cn } from "../../shared/lib/cn";
import { CURRENCY, formatTime } from "../../shared/lib/format";
import { LISTING_TYPE, LISTING_TYPES } from "../../shared/lib/labels";
import { toast } from "../../shared/stores/toastStore";
import { Button } from "../../shared/ui/Button";
import { Alert } from "../../shared/ui/Feedback";
import { Input, Select, Textarea } from "../../shared/ui/Field";

const TIMEZONES = Intl.supportedValuesOf("timeZone").map((zone) => ({ value: zone, label: zone.replace(/_/g, " ") }));

interface ListingFormProps {
  providerId: string;
  /** Absent when creating. The type cannot change afterwards. */
  listing?: Listing;
  readOnly?: boolean;
  onSaved: (listing: Listing) => void;
}

const numberOrNull = (value: string) => (value === "" ? null : Number(value));

export function ListingForm({ providerId, listing, readOnly, onSaved }: ListingFormProps) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<ListingType>(listing?.type ?? "HOTEL");
  const [form, setForm] = useState({
    name: listing?.name ?? "",
    description: listing?.description ?? "",
    address: listing?.address ?? "",
    city: listing?.city ?? "",
    countryCode: listing?.countryCode ?? "MA",
    timezone: listing?.timezone ?? "Africa/Casablanca",
    phone: listing?.phone ?? "",
    email: listing?.email ?? "",
    stars: String(listing?.hotel?.stars ?? ""),
    checkInTime: formatTime(listing?.hotel?.checkInTime) || "14:00",
    checkOutTime: formatTime(listing?.hotel?.checkOutTime) || "12:00",
    cuisineType: listing?.restaurant?.cuisineType ?? "",
    yearsExperience: String(listing?.guide?.yearsExperience ?? ""),
    licenseNumber: listing?.travelAgency?.licenseNumber ?? listing?.carRentalAgency?.licenseNumber ?? "",
    minDriverAge: String(listing?.carRentalAgency?.minDriverAge ?? 21),
    depositAmount: String(listing?.carRentalAgency?.depositAmount ?? 0),
  });
  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: event.target.value });

  const save = useMutation({
    mutationFn: async () => {
      const body: ListingRequest = {
        type,
        name: form.name.trim(),
        description: form.description.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim(),
        countryCode: form.countryCode.trim().toUpperCase(),
        // The form has no map yet; an update keeps the coordinates the listing already has.
        latitude: listing?.latitude ?? null,
        longitude: listing?.longitude ?? null,
        timezone: form.timezone,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        ...(type === "HOTEL" && { hotel: { stars: numberOrNull(form.stars), checkInTime: form.checkInTime || null, checkOutTime: form.checkOutTime || null } }),
        ...(type === "RESTAURANT" && { restaurant: { cuisineType: form.cuisineType.trim() || null } }),
        ...(type === "GUIDE" && { guide: { yearsExperience: numberOrNull(form.yearsExperience) } }),
        ...(type === "TRAVEL_AGENCY" && { travelAgency: { licenseNumber: form.licenseNumber.trim() } }),
        ...(type === "CAR_RENTAL_AGENCY" && {
          carRentalAgency: { licenseNumber: form.licenseNumber.trim(), minDriverAge: Number(form.minDriverAge), depositAmount: Number(form.depositAmount) },
        }),
      };
      return listing
        ? (await http.put<Listing>(`/manage/listings/${listing.id}`, body)).data
        : (await http.post<Listing>(`/providers/${providerId}/listings`, body)).data;
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["pro"] });
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      queryClient.invalidateQueries({ queryKey: ["listing", saved.id] });
      toast.success(listing ? "Annonce mise à jour." : "Annonce créée en brouillon.");
      onSaved(saved);
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {save.isError && <Alert>{errorMessage(save.error)}</Alert>}

      {!listing && (
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-ink-700">Type d'annonce</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {LISTING_TYPES.map((option) => {
              const Icon = LISTING_TYPE[option].icon;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={type === option}
                  onClick={() => setType(option)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center text-xs font-semibold transition",
                    type === option ? "border-brand-500 bg-brand-50 text-brand-800 ring-4 ring-brand-500/15" : "border-sand-300 text-ink-600 hover:border-ink-400",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {LISTING_TYPE[option].label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <fieldset disabled={readOnly} className="space-y-4">
        <Input label="Nom" required maxLength={200} value={form.name} onChange={update("name")} />
        <Textarea label="Description" maxLength={4000} rows={4} value={form.description} onChange={update("description")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Adresse" maxLength={255} value={form.address} onChange={update("address")} />
          <Input label="Ville" required maxLength={100} value={form.city} onChange={update("city")} />
          <Input label="Pays" hint="Code à 2 lettres : MA, FR, ES..." required pattern="[A-Za-z]{2}" maxLength={2} value={form.countryCode} onChange={update("countryCode")} />
          <Select label="Fuseau horaire" hint="Les horaires de réservation sont lus dans ce fuseau." options={TIMEZONES} value={form.timezone} onChange={update("timezone")} />
          <Input label="Téléphone" type="tel" maxLength={30} value={form.phone} onChange={update("phone")} />
          <Input label="E-mail de contact" type="email" value={form.email} onChange={update("email")} />
        </div>

        <div className="rounded-2xl bg-sand-50 p-4">
          <p className="mb-3 text-xs font-bold tracking-widest text-ink-500 uppercase">{LISTING_TYPE[type].label}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {type === "HOTEL" && (
              <>
                <Input label="Étoiles" type="number" min={1} max={5} value={form.stars} onChange={update("stars")} />
                <Input label="Arrivée dès" type="time" value={form.checkInTime} onChange={update("checkInTime")} />
                <Input label="Départ avant" type="time" value={form.checkOutTime} onChange={update("checkOutTime")} />
              </>
            )}
            {type === "RESTAURANT" && <Input label="Type de cuisine" maxLength={50} value={form.cuisineType} onChange={update("cuisineType")} placeholder="Marocaine" />}
            {type === "GUIDE" && <Input label="Années d'expérience" type="number" min={0} max={80} value={form.yearsExperience} onChange={update("yearsExperience")} />}
            {(type === "TRAVEL_AGENCY" || type === "CAR_RENTAL_AGENCY") && (
              <Input label="Numéro de licence" required maxLength={100} value={form.licenseNumber} onChange={update("licenseNumber")} />
            )}
            {type === "CAR_RENTAL_AGENCY" && (
              <>
                <Input label="Âge minimum du conducteur" type="number" required min={18} max={99} value={form.minDriverAge} onChange={update("minDriverAge")} />
                <Input label={`Caution (${CURRENCY})`} type="number" required min={0} step="0.01" value={form.depositAmount} onChange={update("depositAmount")} />
              </>
            )}
          </div>
        </div>
      </fieldset>

      {!readOnly && (
        <Button type="submit" loading={save.isPending}>
          {listing ? "Enregistrer" : "Créer l'annonce"}
        </Button>
      )}
    </form>
  );
}
