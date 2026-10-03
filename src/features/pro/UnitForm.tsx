import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { errorMessage, http } from "../../shared/api/http";
import type { CarCategory, FuelType, Listing, RoomType, Transmission, Unit, UnitRequest, UnitType, VehicleType } from "../../shared/api/types";
import { CAR_CATEGORY, FUEL_TYPE, options, ROOM_TYPE, TRANSMISSION, UNIT_TYPE, UNIT_TYPES_OF, VEHICLE_TYPE } from "../../shared/lib/labels";
import { toast } from "../../shared/stores/toastStore";
import { Button } from "../../shared/ui/Button";
import { Alert } from "../../shared/ui/Feedback";
import { Checkbox, Input, Select, Textarea } from "../../shared/ui/Field";

const PRICE_LABEL: Record<UnitType, string> = {
  ROOM: "Prix par nuit",
  CAR: "Prix par jour",
  GUIDE_SERVICE: "Prix par jour",
  TRANSPORT: "Prix par trajet",
  TABLE: "Prix par personne",
  TOUR: "Prix par personne",
};

interface StepDraft {
  city: string;
  dayNumber: string;
  description: string;
}

interface UnitFormProps {
  listing: Listing;
  /** Absent when creating. The type cannot change afterwards. */
  unit?: Unit;
  onSaved: () => void;
}

export function UnitForm({ listing, unit, onSaved }: UnitFormProps) {
  const queryClient = useQueryClient();
  const allowed = UNIT_TYPES_OF[listing.type];
  const [type, setType] = useState<UnitType>(unit?.type ?? allowed[0]);
  const [form, setForm] = useState({
    name: unit?.name ?? "",
    description: unit?.description ?? "",
    basePrice: String(unit?.basePrice ?? ""),
    capacity: String(unit?.capacity ?? 2),
    roomNumber: unit?.room?.roomNumber ?? "",
    roomType: (unit?.room?.roomType ?? "DOUBLE") as RoomType,
    brand: unit?.car?.brand ?? "",
    model: unit?.car?.model ?? "",
    year: String(unit?.car?.year ?? new Date().getFullYear()),
    category: (unit?.car?.category ?? "ECONOMY") as CarCategory,
    transmission: (unit?.car?.transmission ?? "MANUAL") as Transmission,
    fuelType: (unit?.car?.fuelType ?? "PETROL") as FuelType,
    doors: String(unit?.car?.doors ?? 5),
    hasAc: unit?.car?.hasAc ?? true,
    plateNumber: unit?.car?.plateNumber ?? "",
    mileageLimitKm: String(unit?.car?.mileageLimitKm ?? ""),
    vehicleType: (unit?.transport?.vehicleType ?? "VAN") as VehicleType,
    durationDays: String(unit?.tour?.durationDays ?? 1),
  });
  const [steps, setSteps] = useState<StepDraft[]>(
    unit?.tour?.steps.map((step) => ({ city: step.city, dayNumber: String(step.dayNumber), description: step.description ?? "" })) ?? [
      { city: listing.city, dayNumber: "1", description: "" },
    ],
  );
  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: event.target.value });
  const updateStep = (index: number, changes: Partial<StepDraft>) => setSteps(steps.map((step, i) => (i === index ? { ...step, ...changes } : step)));

  const save = useMutation({
    mutationFn: async () => {
      const body: UnitRequest = {
        type,
        name: form.name.trim(),
        description: form.description.trim() || null,
        basePrice: Number(form.basePrice),
        capacity: Number(form.capacity),
        ...(type === "ROOM" && { room: { roomNumber: form.roomNumber.trim(), roomType: form.roomType } }),
        ...(type === "CAR" && {
          car: {
            brand: form.brand.trim(),
            model: form.model.trim(),
            year: Number(form.year),
            category: form.category,
            transmission: form.transmission,
            fuelType: form.fuelType,
            doors: Number(form.doors),
            hasAc: form.hasAc,
            plateNumber: form.plateNumber.trim(),
            mileageLimitKm: form.mileageLimitKm === "" ? null : Number(form.mileageLimitKm),
          },
        }),
        ...(type === "TRANSPORT" && { transport: { vehicleType: form.vehicleType } }),
        ...(type === "TOUR" && {
          tour: {
            durationDays: Number(form.durationDays),
            // The API wants steps numbered 1, 2, 3... in day order.
            steps: [...steps]
              .sort((a, b) => Number(a.dayNumber) - Number(b.dayNumber))
              .map((step, index) => ({
                stepOrder: index + 1,
                dayNumber: Number(step.dayNumber),
                city: step.city.trim(),
                description: step.description.trim() || null,
              })),
          },
        }),
      };
      return unit ? http.put(`/manage/units/${unit.id}`, body) : http.post(`/manage/listings/${listing.id}/units`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pro"] });
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      queryClient.invalidateQueries({ queryKey: ["listing", listing.id] });
      toast.success(unit ? "Offre mise à jour." : "Offre ajoutée.");
      onSaved();
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {save.isError && <Alert>{errorMessage(save.error)}</Alert>}

      {!unit && allowed.length > 1 && (
        <Select label="Type d'offre" options={allowed.map((value) => ({ value, label: UNIT_TYPE[value].label }))} value={type} onChange={(e) => setType(e.target.value as UnitType)} />
      )}
      <Input label="Nom" required maxLength={200} value={form.name} onChange={update("name")} />
      <Textarea label="Description" maxLength={2000} value={form.description} onChange={update("description")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={`${PRICE_LABEL[type]} (${listing.currency})`} type="number" required min={0} step="0.01" value={form.basePrice} onChange={update("basePrice")} />
        <Input label={type === "CAR" ? "Nombre de places" : "Capacité (personnes)"} type="number" required min={1} value={form.capacity} onChange={update("capacity")} />
      </div>

      {type === "ROOM" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Numéro de chambre" required maxLength={20} value={form.roomNumber} onChange={update("roomNumber")} />
          <Select label="Type de chambre" options={options(ROOM_TYPE)} value={form.roomType} onChange={update("roomType")} />
        </div>
      )}

      {type === "CAR" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Marque" required maxLength={50} value={form.brand} onChange={update("brand")} />
          <Input label="Modèle" required maxLength={50} value={form.model} onChange={update("model")} />
          <Input label="Année" type="number" required min={1950} max={2100} value={form.year} onChange={update("year")} />
          <Input label="Immatriculation" required maxLength={20} value={form.plateNumber} onChange={update("plateNumber")} />
          <Select label="Catégorie" options={options(CAR_CATEGORY)} value={form.category} onChange={update("category")} />
          <Select label="Boîte de vitesses" options={options(TRANSMISSION)} value={form.transmission} onChange={update("transmission")} />
          <Select label="Carburant" options={options(FUEL_TYPE)} value={form.fuelType} onChange={update("fuelType")} />
          <Input label="Portes" type="number" required min={1} max={10} value={form.doors} onChange={update("doors")} />
          <Input label="Limite de km par jour" hint="Vide = kilométrage illimité." type="number" min={1} value={form.mileageLimitKm} onChange={update("mileageLimitKm")} />
          <div className="flex items-center sm:pt-7">
            <Checkbox label="Climatisation" checked={form.hasAc} onChange={(e) => setForm({ ...form, hasAc: e.target.checked })} />
          </div>
        </div>
      )}

      {type === "TRANSPORT" && <Select label="Véhicule" options={options(VEHICLE_TYPE)} value={form.vehicleType} onChange={update("vehicleType")} />}

      {type === "TOUR" && (
        <div className="space-y-3 rounded-2xl bg-sand-50 p-4">
          <Input label="Durée (jours)" type="number" required min={1} value={form.durationDays} onChange={update("durationDays")} />
          <p className="text-xs font-bold tracking-widest text-ink-500 uppercase">Étapes</p>
          {steps.map((step, index) => (
            <div key={index} className="grid grid-cols-[1fr_5rem_auto] items-end gap-2">
              <Input label="Ville" required maxLength={100} value={step.city} onChange={(e) => updateStep(index, { city: e.target.value })} />
              <Input label="Jour" type="number" required min={1} max={Number(form.durationDays) || 1} value={step.dayNumber} onChange={(e) => updateStep(index, { dayNumber: e.target.value })} />
              <button
                type="button"
                aria-label="Retirer l'étape"
                onClick={() => setSteps(steps.filter((_, i) => i !== index))}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <Input
                className="col-span-3"
                label="Programme de l'étape"
                maxLength={1000}
                value={step.description}
                onChange={(e) => updateStep(index, { description: e.target.value })}
              />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setSteps([...steps, { city: "", dayNumber: form.durationDays, description: "" }])}>
            <Plus className="h-4 w-4" aria-hidden />
            Ajouter une étape
          </Button>
        </div>
      )}

      <Button type="submit" loading={save.isPending}>
        {unit ? "Enregistrer" : "Ajouter l'offre"}
      </Button>
    </form>
  );
}
