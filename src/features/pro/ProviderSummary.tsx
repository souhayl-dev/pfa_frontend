import { Banknote, CalendarClock, Inbox, type LucideIcon } from "lucide-react";
import type { Booking } from "../../shared/api/types";
import { cn } from "../../shared/lib/cn";
import { CURRENCY, formatMoney } from "../../shared/lib/format";

function Tile({ icon: Icon, label, value, hint, highlight }: { icon: LucideIcon; label: string; value: string; hint: string; highlight?: boolean }) {
  return (
    <div className={cn("rounded-3xl border p-5 shadow-card", highlight ? "border-amber-200 bg-amber-50" : "border-sand-200 bg-white")}>
      <Icon className={cn("h-5 w-5", highlight ? "text-amber-700" : "text-brand-600")} aria-hidden />
      <p className="mt-3 text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-xs text-ink-500">{hint}</p>
    </div>
  );
}

/** What needs the team's attention, and how the month is going. */
export function ProviderSummary({ bookings, loading }: { bookings: Booking[]; loading: boolean }) {
  const now = new Date();
  const inAWeek = new Date(now.getTime() + 7 * 86_400_000);
  const pending = bookings.filter((booking) => booking.status === "PENDING").length;
  const arrivals = bookings.filter((booking) => booking.status === "CONFIRMED" && new Date(booking.startAt) > now && new Date(booking.startAt) <= inAWeek).length;
  // Money that is expected or earned: confirmed and completed bookings starting this month.
  const revenue = bookings
    .filter((booking) => booking.status === "CONFIRMED" || booking.status === "COMPLETED")
    .filter((booking) => {
      const start = new Date(booking.startAt);
      return start.getFullYear() === now.getFullYear() && start.getMonth() === now.getMonth();
    })
    .reduce((sum, booking) => sum + booking.totalAmount, 0);
  const dash = loading ? "..." : null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Tile icon={Inbox} label="Demandes à traiter" value={dash ?? String(pending)} hint="En attente de votre confirmation" highlight={pending > 0} />
      <Tile icon={CalendarClock} label="Arrivées sous 7 jours" value={dash ?? String(arrivals)} hint="Réservations confirmées" />
      <Tile icon={Banknote} label="Revenus du mois" value={dash ?? formatMoney(revenue, CURRENCY)} hint="Confirmées et terminées ce mois-ci" />
    </div>
  );
}
