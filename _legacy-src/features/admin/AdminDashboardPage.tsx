import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowUpRight, Building2, Calendar, Compass, Key, Users } from "lucide-react";
import {
  getPlatformStats,
  listAllAttractionListings,
  listAllCarRentalListings,
  listAllHotelListings,
  listUsers,
} from "./api";
import { AdminShell, Initials, Panel } from "./AdminShell";
import { Alert } from "../../shared/components/ui/Alert";
import { Skeleton } from "../../shared/components/ui/Skeleton";
import { cn } from "../../shared/lib/cn";
import type { ListingStatus } from "../../shared/api/types";

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  hint?: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-500">{label}</p>
        <span className={cn("flex size-9 items-center justify-center rounded-xl", tone)}>
          <Icon className="size-4.5" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

interface Segment {
  label: string;
  value: number;
  color: string;
}

function DistributionBar({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  return (
    <div className="space-y-4">
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-neutral-100">
        {total > 0 &&
          segments.map((s) =>
            s.value > 0 ? (
              <div key={s.label} className={cn("h-full first:rounded-l-full last:rounded-r-full", s.color)} style={{ width: `${(s.value / total) * 100}%` }} />
            ) : null,
          )}
      </div>
      <ul className="space-y-2.5">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-neutral-600">
              <span className={cn("size-2.5 rounded-full", s.color)} />
              {s.label}
            </span>
            <span className="flex items-baseline gap-2">
              <span className="font-semibold text-neutral-900 tabular-nums">{s.value}</span>
              <span className="w-10 text-right text-xs text-neutral-400 tabular-nums">
                {total > 0 ? Math.round((s.value / total) * 100) : 0}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function countByStatus(lists: ({ status: ListingStatus }[] | undefined)[]): Record<ListingStatus, number> {
  const counts: Record<ListingStatus, number> = { PUBLISHED: 0, DRAFT: 0, ARCHIVED: 0 };
  for (const list of lists) for (const item of list ?? []) counts[item.status]++;
  return counts;
}

const ROLE_LABELS = { CUSTOMER: "Client", PROVIDER: "Prestataire", ADMIN: "Admin" } as const;

export function AdminDashboardPage() {
  const statsQuery = useQuery({ queryKey: ["admin-stats"], queryFn: getPlatformStats });
  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: listUsers });
  const hotels = useQuery({ queryKey: ["admin-hotels"], queryFn: listAllHotelListings });
  const carRentals = useQuery({ queryKey: ["admin-car-rentals"], queryFn: listAllCarRentalListings });
  const attractions = useQuery({ queryKey: ["admin-attractions"], queryFn: listAllAttractionListings });

  const stats = statsQuery.data;
  const totalListings = stats ? stats.totalHotelListings + stats.totalCarRentalListings + stats.totalAttractionListings : 0;
  const statusCounts = countByStatus([hotels.data, carRentals.data, attractions.data]);
  const listingsLoaded = hotels.data && carRentals.data && attractions.data;

  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <AdminShell title="Tableau de bord" subtitle={`Vue d'ensemble de la plateforme · ${today}`}>
      {statsQuery.isError && <Alert variant="error">Impossible de charger les statistiques.</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsQuery.isLoading &&
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        {stats && (
          <>
            <KpiCard icon={Users} label="Utilisateurs" value={stats.totalUsers} hint={`${stats.totalProviders} prestataires · ${stats.totalCustomers} clients`} tone="bg-violet-50 text-violet-600" />
            <KpiCard icon={Building2} label="Annonces" value={totalListings} hint="Tous statuts confondus" tone="bg-sky-50 text-sky-600" />
            <KpiCard icon={Calendar} label="Réservations" value={stats.totalBookings} hint="Depuis le lancement" tone="bg-brand-50 text-brand-600" />
            <KpiCard
              icon={ArrowUpRight}
              label="Publiées"
              value={statusCounts.PUBLISHED}
              hint={listingsLoaded ? `${statusCounts.DRAFT} brouillons en attente` : undefined}
              tone="bg-emerald-50 text-emerald-600"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Annonces par catégorie">
          {stats ? (
            <DistributionBar
              segments={[
                { label: "Hôtels & Riads", value: stats.totalHotelListings, color: "bg-sky-500" },
                { label: "Location de voitures", value: stats.totalCarRentalListings, color: "bg-emerald-500" },
                { label: "Attractions", value: stats.totalAttractionListings, color: "bg-amber-500" },
              ]}
            />
          ) : (
            <Skeleton className="h-28 w-full" />
          )}
        </Panel>

        <Panel title="Annonces par statut">
          {listingsLoaded ? (
            <DistributionBar
              segments={[
                { label: "Publiées", value: statusCounts.PUBLISHED, color: "bg-emerald-500" },
                { label: "Brouillons", value: statusCounts.DRAFT, color: "bg-neutral-400" },
                { label: "Archivées", value: statusCounts.ARCHIVED, color: "bg-red-400" },
              ]}
            />
          ) : (
            <Skeleton className="h-28 w-full" />
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Panel
          title="Utilisateurs"
          action={
            <Link to="/admin/users" className="text-sm font-medium text-neutral-500 hover:text-neutral-900">
              Tout voir →
            </Link>
          }
        >
          {usersQuery.isLoading && <Skeleton className="h-40 w-full" />}
          <ul className="-mx-2 divide-y divide-neutral-100">
            {usersQuery.data?.slice(0, 5).map((user) => (
              <li key={user.id} className="flex items-center gap-3 px-2 py-2.5">
                <Initials name={user.fullName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900">{user.fullName}</p>
                  <p className="truncate text-xs text-neutral-500">{user.email}</p>
                </div>
                <span className="text-xs font-medium text-neutral-500">{ROLE_LABELS[user.role]}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Actions rapides">
          <div className="space-y-2">
            {[
              { to: "/admin/users", icon: Users, label: "Gérer les utilisateurs", tone: "bg-violet-50 text-violet-600" },
              { to: "/admin/listings", icon: Building2, label: "Modérer les hôtels", tone: "bg-sky-50 text-sky-600" },
              { to: "/admin/listings?type=CAR_RENTAL", icon: Key, label: "Modérer les voitures", tone: "bg-emerald-50 text-emerald-600" },
              { to: "/admin/listings?type=ATTRACTION", icon: Compass, label: "Modérer les attractions", tone: "bg-amber-50 text-amber-600" },
            ].map(({ to, icon: Icon, label, tone }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-3 rounded-xl border border-neutral-200 p-3 transition-colors hover:border-neutral-900"
              >
                <span className={cn("flex size-9 items-center justify-center rounded-lg", tone)}>
                  <Icon className="size-4" />
                </span>
                <span className="flex-1 text-sm font-medium text-neutral-900">{label}</span>
                <ArrowUpRight className="size-4 text-neutral-400 transition-colors group-hover:text-neutral-900" />
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
