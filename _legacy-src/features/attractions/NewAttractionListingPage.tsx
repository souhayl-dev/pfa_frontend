import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Compass, UtensilsCrossed, Route } from "lucide-react";
import { createAttraction, publishAttraction } from "./api";
import { extractErrorMessage } from "../../shared/api/httpClient";
import { Button } from "../../shared/components/ui/Button";
import { Field, Input, Textarea } from "../../shared/components/ui/Field";
import { Alert } from "../../shared/components/ui/Alert";
import { cn } from "../../shared/lib/cn";
import type { AttractionType } from "../../shared/api/types";

const ATTRACTION_OPTIONS: { value: AttractionType; label: string; icon: typeof Compass }[] = [
  { value: "ACTIVITY", label: "Activité", icon: Compass },
  { value: "RESTAURATION", label: "Restauration", icon: UtensilsCrossed },
  { value: "CIRCUIT", label: "Circuit", icon: Route },
];

export function NewAttractionListingPage() {
  const navigate = useNavigate();
  const [attractionType, setAttractionType] = useState<AttractionType>("ACTIVITY");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [basePrice, setBasePrice] = useState(0);
  const [currency, setCurrency] = useState("EUR");
  const [capacity, setCapacity] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState<number | "">("");

  const mutation = useMutation({
    mutationFn: async () => {
      const listing = await createAttraction({
        title, description, address: { city, country }, basePrice, currency, capacity, attractionType,
        durationMinutes: durationMinutes === "" ? null : durationMinutes,
      });
      await publishAttraction(listing.id);
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
      <h1 className="text-2xl font-bold text-neutral-900">Ajouter une attraction</h1>
      <p className="mt-1 text-sm text-neutral-500">Activité, restauration ou circuit - l'annonce sera publiée dès la validation.</p>

      <form className="mt-6 space-y-5 rounded-2xl border border-neutral-200 p-6" onSubmit={handleSubmit}>
        <Field label="Type">
          <div className="grid grid-cols-3 gap-2">
            {ATTRACTION_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setAttractionType(value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
                  attractionType === value
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 text-neutral-600 hover:border-neutral-900",
                )}
              >
                <Icon className="size-5" />
                {label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Titre">
          <Input placeholder="Quad dans le Désert d'Agafay" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Field>

        <Field label="Description">
          <Textarea rows={4} placeholder="Décrivez l'expérience..." value={description}
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

        <div className="grid grid-cols-4 gap-3">
          <Field label="Prix">
            <Input type="number" min={0} step="0.01" value={basePrice}
                   onChange={(e) => setBasePrice(Number(e.target.value))} required />
          </Field>
          <Field label="Devise">
            <Input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={3} required />
          </Field>
          <Field label="Capacité">
            <Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} required />
          </Field>
          <Field label="Durée (min)">
            <Input type="number" min={1} value={durationMinutes}
                   onChange={(e) => setDurationMinutes(e.target.value === "" ? "" : Number(e.target.value))} />
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
