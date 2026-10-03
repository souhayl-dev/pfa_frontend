import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Archive, Building2, Compass, ExternalLink, Key, LayoutList, MapPin, Search } from "lucide-react";
import {
  archiveAttractionListing,
  archiveCarRentalListing,
  archiveHotelListing,
  listAllAttractionListings,
  listAllCarRentalListings,
  listAllHotelListings,
} from "./api";
import { AdminShell, Panel, SegmentedControl } from "./AdminShell";
import { CategoryBadge } from "../../shared/components/CategoryBadge";
import { Alert } from "../../shared/components/ui/Alert";
import { Button } from "../../shared/components/ui/Button";
import { EmptyState } from "../../shared/components/ui/EmptyState";
import { Input, Select } from "../../shared/components/ui/Field";
import { Skeleton } from "../../shared/components/ui/Skeleton";
import { getCategoryTheme } from "../../shared/lib/categoryTheme";
import { cn } from "../../shared/lib/cn";
import type { AttractionType, ListingStatus, ListingType } from "../../shared/api/types";

const STATUS_STYLES: Record<ListingStatus, { label: string; dot: string; text: string }> = {
  PUBLISHED: { label: "Publiée", dot: "bg-emerald-500", text: "text-emerald-700" },
  DRAFT: { label: "Brouillon", dot: "bg-neutral-400", text: "text-neutral-600" },
  ARCHIVED: { label: "Archivée", dot: "bg-red-400", text: "text-red-600" },
};

const DETAIL_PATHS: Record<ListingType, string> = {
  HOTEL: "/hotels",
  CAR_RENTAL: "/car-rentals",
  ATTRACTION: "/attractions",
};

const LISTING_TYPES: ListingType[] = ["HOTEL", "CAR_RENTAL", "ATTRACTION"];

interface AdminListingRow {
  id: string;
  listingType: ListingType;
  attractionType?: AttractionType;
  title: string;
  city: string;
  basePrice: number;
  currency: string;
  status: ListingStatus;
  coverPhotoUrl: string | null;
}

interface ListingLike {
  id: string;
  title: string;
  address: { city: string };
  basePrice: number;
  currency: string;
  status: ListingStatus;
  coverPhotoUrl: string | null;
}

function toRow(listing: ListingLike, listingType: ListingType, attractionType?: AttractionType): AdminListingRow {
  return {
    id: listing.id,
    listingType,
    attractionType,
    title: listing.title,
    city: listing.address.city,
    basePrice: listing.basePrice,
    currency: listing.currency,
    status: listing.status,
    coverPhotoUrl: listing.coverPhotoUrl,
  };
}

function Thumbnail({ row }: { row: AdminListingRow }) {
  const theme = getCategoryTheme(row.listingType, row.attractionType);
  const Icon = theme.icon;
  if (row.coverPhotoUrl) {
    return <img src={row.coverPhotoUrl} alt="" className="size-14 shrink-0 rounded-xl object-cover" />;
  }
  return (
    <span className={cn("flex size-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", theme.gradient)}>
      <Icon className="size-5" />
    </span>
  );
}

export function AdminListingsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get("type") as ListingType | null;
  const tab: ListingType = typeParam && LISTING_TYPES.includes(typeParam) ? typeParam : "HOTEL";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ListingStatus | "ALL">("ALL");

  const hotels = useQuery({ queryKey: ["admin-hotels"], queryFn: listAllHotelListings });
  const carRentals = useQuery({ queryKey: ["admin-car-rentals"], queryFn: listAllCarRentalListings });
  const attractions = useQuery({ queryKey: ["admin-attractions"], queryFn: listAllAttractionListings });

  const onArchived = (key: string) => () => {
    queryClient.invalidateQueries({ queryKey: [key] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };
  const archiveHotel = useMutation({ mutationFn: archiveHotelListing, onSuccess: onArchived("admin-hotels") });
  const archiveCar = useMutation({ mutationFn: archiveCarRentalListing, onSuccess: onArchived("admin-car-rentals") });
  const archiveAttraction = useMutation({ mutationFn: archiveAttractionListing, onSuccess: onArchived("admin-attractions") });

  const sources = {
    HOTEL: { query: hotels, archive: archiveHotel },
    CAR_RENTAL: { query: carRentals, archive: archiveCar },
    ATTRACTION: { query: attractions, archive: archiveAttraction },
  };
  const { query: activeQuery, archive: activeArchive } = sources[tab];

  const rows = useMemo<AdminListingRow[]>(() => {
    const all =
      tab === "HOTEL"
        ? (hotels.data ?? []).map((l) => toRow(l, "HOTEL"))
        : tab === "CAR_RENTAL"
          ? (carRentals.data ?? []).map((l) => toRow(l, "CAR_RENTAL"))
          : (attractions.data ?? []).map((l) => toRow(l, "ATTRACTION", l.attractionType));

    const term = search.trim().toLowerCase();
    return all.filter(
      (row) =>
        (status === "ALL" || row.status === status) &&
        (!term || row.title.toLowerCase().includes(term) || row.city.toLowerCase().includes(term)),
    );
  }, [tab, hotels.data, carRentals.data, attractions.data, search, status]);

  function handleArchive(row: AdminListingRow) {
    if (window.confirm(`Archiver « ${row.title} » ? L'annonce ne sera plus visible publiquement.`)) {
      activeArchive.mutate(row.id);
    }
  }

  const priceFormatter = (amount: number, currency: string) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

  const totalListings = (hotels.data?.length ?? 0) + (carRentals.data?.length ?? 0) + (attractions.data?.length ?? 0);

  return (
    <AdminShell title="Annonces" subtitle={hotels.data && carRentals.data && attractions.data ? `${totalListings} annonces à modérer` : undefined}>
      <SegmentedControl
        value={tab}
        onChange={(value) => setSearchParams({ type: value }, { replace: true })}
        options={[
          { value: "HOTEL", label: "Hôtels & Riads", icon: Building2, count: hotels.data?.length },
          { value: "CAR_RENTAL", label: "Voitures", icon: Key, count: carRentals.data?.length },
          { value: "ATTRACTION", label: "Attractions", icon: Compass, count: attractions.data?.length },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Titre ou ville" className="pl-10" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value as ListingStatus | "ALL")} className="sm:w-48">
          <option value="ALL">Tous les statuts</option>
          <option value="PUBLISHED">Publiées</option>
          <option value="DRAFT">Brouillons</option>
          <option value="ARCHIVED">Archivées</option>
        </Select>
      </div>

      {activeQuery.isError && <Alert variant="error">Impossible de charger les annonces.</Alert>}
      {activeArchive.isError && <Alert variant="error">L'archivage a échoué.</Alert>}

      {activeQuery.data && rows.length === 0 ? (
        <EmptyState icon={LayoutList} title="Aucune annonce" description="Aucune annonce ne correspond à ces critères." />
      ) : (
        <Panel flush>
          <div className="hidden grid-cols-[1fr_120px_110px_150px] gap-4 border-b border-neutral-100 px-5 py-3 text-xs font-medium uppercase tracking-wide text-neutral-400 md:grid">
            <span>Annonce</span>
            <span>Prix</span>
            <span>Statut</span>
            <span />
          </div>

          {activeQuery.isLoading && (
            <div className="space-y-2 p-5">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          )}

          <ul className="divide-y divide-neutral-100">
            {rows.map((row) => {
              const statusStyle = STATUS_STYLES[row.status];
              return (
                <li
                  key={row.id}
                  className="grid grid-cols-1 items-center gap-x-4 gap-y-3 px-5 py-4 transition-colors hover:bg-neutral-50/70 md:grid-cols-[1fr_120px_110px_150px]"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <Thumbnail row={row} />
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-semibold text-neutral-900">{row.title}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                          <MapPin className="size-3.5" />
                          {row.city}
                        </span>
                        {row.listingType === "ATTRACTION" && (
                          <CategoryBadge listingType={row.listingType} attractionType={row.attractionType} />
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="hidden text-sm font-medium text-neutral-900 tabular-nums md:block">
                    {priceFormatter(row.basePrice, row.currency)}
                  </p>

                  <span className={cn("hidden items-center gap-1.5 text-xs font-medium md:inline-flex", statusStyle.text)}>
                    <span className={cn("size-2 rounded-full", statusStyle.dot)} />
                    {statusStyle.label}
                  </span>

                  <div className="flex items-center justify-end gap-1">
                    <span className={cn("mr-auto inline-flex items-center gap-1.5 text-xs font-medium md:hidden", statusStyle.text)}>
                      <span className={cn("size-2 rounded-full", statusStyle.dot)} />
                      {statusStyle.label}
                    </span>
                    {row.status === "PUBLISHED" && (
                      <Link to={`${DETAIL_PATHS[row.listingType]}/${row.id}`} title="Voir l'annonce">
                        <Button variant="ghost" size="sm" className="px-2" icon={<ExternalLink className="size-4" />} aria-label="Voir l'annonce" />
                      </Link>
                    )}
                    {row.status !== "ARCHIVED" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-neutral-500 hover:bg-red-50 hover:text-red-600"
                        loading={activeArchive.isPending && activeArchive.variables === row.id}
                        icon={<Archive className="size-4" />}
                        onClick={() => handleArchive(row)}
                      >
                        Archiver
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </AdminShell>
  );
}
