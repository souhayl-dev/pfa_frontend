import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createCarRental, publishCarRental } from "./api";
import { extractErrorMessage } from "../../shared/api/httpClient";
import { Button } from "../../shared/components/ui/Button";
import { Field, Input, Select, Textarea } from "../../shared/components/ui/Field";
import { Alert } from "../../shared/components/ui/Alert";
import type { FuelType, VehicleTransmission } from "../../shared/api/types";

export function NewCarRentalListingPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [basePrice, setBasePrice] = useState(0);
  const [currency, setCurrency] = useState("EUR");
  const [seats, setSeats] = useState(5);
  const [transmission, setTransmission] = useState<VehicleTransmission>("MANUAL");
  const [fuelType, setFuelType] = useState<FuelType>("PETROL");

  const mutation = useMutation({
    mutationFn: async () => {
      const listing = await createCarRental({
        title, description, address: { city, country }, basePrice, currency, seats, transmission, fuelType,
      });
      await publishCarRental(listing.id);
      return listing;
    },
    onSuccess: () => navigate("/"),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold text-neutral-900">Ajouter une voiture à louer</h1>
      <p className="mt-1 text-sm text-neutral-500">L'annonce sera publiée dès la validation.</p>

      <form className="mt-6 space-y-5 rounded-2xl border border-neutral-200 p-6" onSubmit={handleSubmit}>
        <Field label="Titre">
          <Input placeholder="Dacia Duster - Automatique" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Field>
        <Field label="Description">
          <Textarea rows={4} placeholder="Décrivez le véhicule..." value={description}
                    onChange={(e) => setDescription(e.target.value)} required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ville">
            <Input placeholder="Marrakech" value={city} onChange={(e) => setCity(e.target.value)} required />
          </Field>
          <Field label="Pays">
            <Input placeholder="Maroc" value={country} onChange={(e) => setCountry(e.target.value)} required />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Prix / jour">
            <Input type="number" min={0} step="0.01" value={basePrice}
                   onChange={(e) => setBasePrice(Number(e.target.value))} required />
          </Field>
          <Field label="Devise">
            <Input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={3} required />
          </Field>
          <Field label="Places">
            <Input type="number" min={1} value={seats} onChange={(e) => setSeats(Number(e.target.value))} required />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Transmission">
            <Select value={transmission} onChange={(e) => setTransmission(e.target.value as VehicleTransmission)}>
              <option value="MANUAL">Manuelle</option>
              <option value="AUTOMATIC">Automatique</option>
            </Select>
          </Field>
          <Field label="Carburant">
            <Select value={fuelType} onChange={(e) => setFuelType(e.target.value as FuelType)}>
              <option value="PETROL">Essence</option>
              <option value="DIESEL">Diesel</option>
              <option value="ELECTRIC">Électrique</option>
              <option value="HYBRID">Hybride</option>
            </Select>
          </Field>
        </div>
        <Button type="submit" fullWidth size="lg" loading={mutation.isPending}>
          {mutation.isPending ? "Publication en cours..." : "Créer et publier"}
        </Button>
        {mutation.isError && <Alert variant="error">{extractErrorMessage(mutation.error)}</Alert>}
      </form>
    </div>
  );
}
