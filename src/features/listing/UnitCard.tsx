import { Check, Users } from "lucide-react";
import type { Unit } from "../../shared/api/types";
import { resolveAssetUrl } from "../../shared/api/http";
import { cn } from "../../shared/lib/cn";
import { formatMoney, plural } from "../../shared/lib/format";
import { CAR_CATEGORY, FUEL_TYPE, PRICING_UNIT, ROOM_TYPE, TRANSMISSION, UNIT_TYPE, VEHICLE_TYPE } from "../../shared/lib/labels";

/** The short facts shown as chips under a unit's name. */
function unitFacts(unit: Unit): string[] {
  const facts: string[] = [];
  if (unit.room) facts.push(`Chambre ${ROOM_TYPE[unit.room.roomType].toLowerCase()}`);
  if (unit.car) {
    facts.push(
      `${unit.car.brand} ${unit.car.model} (${unit.car.year})`,
      CAR_CATEGORY[unit.car.category],
      TRANSMISSION[unit.car.transmission],
      FUEL_TYPE[unit.car.fuelType],
      `${unit.car.doors} portes`,
    );
    if (unit.car.hasAc) facts.push("Climatisation");
    facts.push(unit.car.mileageLimitKm ? `${unit.car.mileageLimitKm} km / jour` : "Kilométrage illimité");
  }
  if (unit.transport) facts.push(VEHICLE_TYPE[unit.transport.vehicleType]);
  if (unit.tour) facts.push(plural(unit.tour.durationDays, "jour"));
  return facts;
}

interface UnitCardProps {
  unit: Unit;
  selected: boolean;
  onSelect: () => void;
}

export function UnitCard({ unit, selected, onSelect }: UnitCardProps) {
  const Icon = UNIT_TYPE[unit.type].icon;
  const photo = unit.photos[0];

  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "cursor-pointer rounded-3xl border bg-white p-4 transition duration-200 sm:p-5",
        selected ? "border-brand-500 shadow-card ring-4 ring-brand-500/15" : "border-sand-200 hover:border-ink-300 hover:shadow-card",
      )}
    >
      <div className="flex gap-4">
        <div className="hidden h-24 w-28 shrink-0 overflow-hidden rounded-2xl bg-sand-100 sm:block">
          {photo ? (
            <img src={resolveAssetUrl(photo.url)} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-300">
              <Icon className="h-9 w-9" strokeWidth={1.25} aria-hidden />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-widest text-brand-600 uppercase">{UNIT_TYPE[unit.type].label}</p>
              <h3 className="mt-0.5 font-display text-lg leading-snug font-semibold">{unit.name}</h3>
            </div>
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition",
                selected ? "border-brand-500 bg-brand-500 text-white" : "border-sand-300",
              )}
              aria-hidden
            >
              {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
          </div>
          {unit.description && <p className="mt-1.5 text-sm text-ink-600">{unit.description}</p>}

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2.5 py-1 text-xs font-semibold text-ink-700">
              <Users className="h-3.5 w-3.5" aria-hidden />
              {unit.capacity} pers. max
            </span>
            {unitFacts(unit).map((fact) => (
              <span key={fact} className="rounded-full bg-sand-100 px-2.5 py-1 text-xs font-semibold text-ink-700">
                {fact}
              </span>
            ))}
          </div>
        </div>
      </div>

      {unit.tour && unit.tour.steps.length > 0 && (
        <ol className="mt-4 space-y-0 border-t border-sand-200 pt-4">
          {unit.tour.steps.map((step, index) => (
            <li key={step.stepOrder} className="relative flex gap-3 pb-4 last:pb-0">
              {index < unit.tour!.steps.length - 1 && <span className="absolute top-6 left-[0.6875rem] h-full w-px bg-sand-300" aria-hidden />}
              <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pine-800 text-[0.65rem] font-bold text-white">
                {step.stepOrder}
              </span>
              <div className="text-sm">
                <p className="font-semibold">
                  {step.city} <span className="font-medium text-ink-500">· jour {step.dayNumber}</span>
                </p>
                {step.description && <p className="text-ink-600">{step.description}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-4 flex items-baseline justify-end gap-1 border-t border-sand-200 pt-3 text-sm text-ink-500">
        <span className="text-xl font-extrabold tracking-tight text-ink-900">{formatMoney(unit.basePrice, unit.currency)}</span>/ {PRICING_UNIT[unit.pricingUnit]}
      </p>
    </div>
  );
}
