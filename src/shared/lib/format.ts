export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

/** A UTC instant shown in the listing's own timezone, e.g. "10 nov. 2026 à 14:00". */
export function formatDateTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone }).format(new Date(iso));
}

export function formatDate(iso: string, timeZone?: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone }).format(new Date(iso));
}

/** "14:00:00" -> "14:00" */
export function formatTime(time: string | null | undefined): string {
  return time ? time.slice(0, 5) : "";
}

/** Today as yyyy-MM-dd in the browser's timezone, for the min of date inputs. */
export function todayIso(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count > 1 ? pluralForm : singular}`;
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

const REGION_NAMES = new Intl.DisplayNames(["fr"], { type: "region" });

export function countryName(code: string): string {
  try {
    return REGION_NAMES.of(code) ?? code;
  } catch {
    return code;
  }
}
