import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Award, Banknote, Building2, Clock, CornerDownRight, FileBadge, Mail, MapPin, MessageSquare, Phone, SearchX, Star, UserRound, UtensilsCrossed } from "lucide-react";
import type { Listing } from "../../shared/api/types";
import { resolveAssetUrl } from "../../shared/api/http";
import { ListingArt } from "../../shared/components/ListingArt";
import { cn } from "../../shared/lib/cn";
import { countryName, formatDate, formatMoney, formatTime, plural } from "../../shared/lib/format";
import { LISTING_TYPE } from "../../shared/lib/labels";
import { buttonClass } from "../../shared/ui/buttonClass";
import { EmptyState, Skeleton, Stars } from "../../shared/ui/Feedback";
import { useListing, useListingReviews } from "./api";
import { BookingPanel } from "./BookingPanel";
import { UnitCard } from "./UnitCard";

const UNITS_TITLE: Record<Listing["type"], string> = {
  HOTEL: "Choisissez votre chambre",
  RESTAURANT: "Choisissez votre table",
  GUIDE: "Prestations proposées",
  TRAVEL_AGENCY: "Circuits et transferts",
  CAR_RENTAL_AGENCY: "Choisissez votre voiture",
};

function facts(listing: Listing): { icon: typeof Star; label: string; value: string }[] {
  const list: { icon: typeof Star; label: string; value: string }[] = [];
  if (listing.hotel) {
    if (listing.hotel.stars) list.push({ icon: Star, label: "Classement", value: plural(listing.hotel.stars, "étoile") });
    if (listing.hotel.checkInTime) list.push({ icon: Clock, label: "Arrivée", value: `dès ${formatTime(listing.hotel.checkInTime)}` });
    if (listing.hotel.checkOutTime) list.push({ icon: Clock, label: "Départ", value: `avant ${formatTime(listing.hotel.checkOutTime)}` });
  }
  if (listing.restaurant?.cuisineType) list.push({ icon: UtensilsCrossed, label: "Cuisine", value: listing.restaurant.cuisineType });
  if (listing.guide?.yearsExperience != null) list.push({ icon: Award, label: "Expérience", value: plural(listing.guide.yearsExperience, "an") });
  if (listing.travelAgency) list.push({ icon: FileBadge, label: "Licence", value: listing.travelAgency.licenseNumber });
  if (listing.carRentalAgency) {
    list.push(
      { icon: UserRound, label: "Âge minimum", value: `${listing.carRentalAgency.minDriverAge} ans` },
      { icon: Banknote, label: "Caution", value: formatMoney(listing.carRentalAgency.depositAmount, listing.currency) },
      { icon: FileBadge, label: "Licence", value: listing.carRentalAgency.licenseNumber },
    );
  }
  return list;
}

function Gallery({ listing }: { listing: Listing }) {
  const [active, setActive] = useState(0);
  const photos = listing.photos;

  if (photos.length === 0) {
    return (
      <div className="h-56 overflow-hidden rounded-[2rem] sm:h-80">
        <ListingArt type={listing.type} alt={listing.name} iconClassName="h-40 w-40 right-8 bottom-6" />
      </div>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_7rem]">
      <div className="h-64 overflow-hidden rounded-[2rem] bg-sand-100 sm:h-[26rem]">
        <img key={photos[active].id} src={resolveAssetUrl(photos[active].url)} alt={listing.name} className="h-full w-full animate-fade object-cover" />
      </div>
      {photos.length > 1 && (
        <div className="scrollbar-none flex gap-3 overflow-auto lg:max-h-[26rem] lg:flex-col">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setActive(index)}
              aria-label={`Photo ${index + 1}`}
              aria-pressed={index === active}
              className={cn(
                "h-20 w-28 shrink-0 overflow-hidden rounded-2xl ring-2 transition lg:w-full",
                index === active ? "ring-brand-500" : "opacity-70 ring-transparent hover:opacity-100",
              )}
            >
              <img src={resolveAssetUrl(photo.url)} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 font-display text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Reviews({ listingId }: { listingId: string }) {
  const reviews = useListingReviews(listingId);
  if (reviews.isLoading) return <Skeleton className="h-28" />;
  if (!reviews.data?.length) {
    return <EmptyState icon={MessageSquare} title="Pas encore d'avis" text="Les voyageurs peuvent laisser un avis une fois leur réservation terminée." />;
  }
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {reviews.data.map((review) => (
        <li key={review.id} className="rounded-3xl border border-sand-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pine-100 font-bold text-pine-800">{review.authorName.charAt(0)}</span>
              <div>
                <p className="text-sm font-semibold">{review.authorName}</p>
                <p className="text-xs text-ink-500">{formatDate(review.createdAt)}</p>
              </div>
            </div>
            <Stars value={review.rating} />
          </div>
          {review.comment && <p className="mt-3 text-sm leading-relaxed text-ink-700">{review.comment}</p>}
          {review.reply && (
            <div className="mt-3 flex gap-2 rounded-2xl bg-sand-50 p-3 text-sm">
              <CornerDownRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
              <p className="text-ink-700">
                <span className="font-semibold">Réponse du prestataire : </span>
                {review.reply}
              </p>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export function ListingPage() {
  const { id = "" } = useParams();
  const { data: listing, isLoading, isError } = useListing(id);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <Skeleton className="h-80 rounded-[2rem]" />
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={SearchX}
          title="Annonce introuvable"
          text="Elle a peut-être été retirée, ou n'est plus en ligne."
          action={
            <Link to="/" className={buttonClass("dark")}>
              Retour aux annonces
            </Link>
          }
        />
      </div>
    );
  }

  const theme = LISTING_TYPE[listing.type];
  const TypeIcon = theme.icon;
  const units = listing.units.filter((unit) => unit.active);
  const selected = units.find((unit) => unit.id === selectedId) ?? units[0];
  const factList = facts(listing);

  return (
    <div className="mx-auto max-w-7xl animate-fade px-4 py-6 sm:px-6">
      <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Toutes les annonces
      </Link>

      <Gallery listing={listing} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_23rem]">
        <div className="min-w-0">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset", theme.chip)}>
            <TypeIcon className="h-3.5 w-3.5" aria-hidden />
            {theme.label}
          </span>
          <h1 className="mt-3 font-display text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">{listing.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-600">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand-600" aria-hidden />
              {[listing.address, listing.city, countryName(listing.countryCode)].filter(Boolean).join(", ")}
            </span>
            {listing.reviewsCount > 0 ? (
              <a href="#avis" className="flex items-center gap-1.5 font-semibold text-ink-900 hover:underline">
                <Star className="h-4 w-4 fill-saffron-400 text-saffron-400" aria-hidden />
                {listing.ratingAvg.toFixed(1)} <span className="font-medium text-ink-500">· {plural(listing.reviewsCount, "avis", "avis")}</span>
              </a>
            ) : (
              <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-xs font-bold">Nouveau</span>
            )}
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-ink-400" aria-hidden />
              Proposé par {listing.providerName}
            </span>
          </div>

          {listing.description && <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-700">{listing.description}</p>}

          {factList.length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {factList.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl border border-sand-200 bg-white p-4">
                  <Icon className="h-5 w-5 text-brand-600" aria-hidden />
                  <dt className="mt-2 text-xs font-semibold tracking-wide text-ink-500 uppercase">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {(listing.phone || listing.email) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {listing.phone && (
                <a href={`tel:${listing.phone}`} className={buttonClass("outline", "sm")}>
                  <Phone className="h-4 w-4" aria-hidden />
                  {listing.phone}
                </a>
              )}
              {listing.email && (
                <a href={`mailto:${listing.email}`} className={buttonClass("outline", "sm")}>
                  <Mail className="h-4 w-4" aria-hidden />
                  {listing.email}
                </a>
              )}
            </div>
          )}

          <Block title={UNITS_TITLE[listing.type]}>
            {units.length === 0 ? (
              <EmptyState icon={SearchX} title="Rien à réserver pour le moment" text="Ce prestataire n'a pas encore publié d'offre." />
            ) : (
              <div role="radiogroup" aria-label={UNITS_TITLE[listing.type]} className="space-y-3">
                {units.map((unit) => (
                  <UnitCard key={unit.id} unit={unit} selected={unit.id === selected?.id} onSelect={() => setSelectedId(unit.id)} />
                ))}
              </div>
            )}
          </Block>

          <div id="avis" className="scroll-mt-24">
            <Block title="Avis des voyageurs">
              <Reviews listingId={listing.id} />
            </Block>
          </div>
        </div>

        {selected && (
          <aside>
            <div className="lg:sticky lg:top-24">
              <BookingPanel key={selected.id} listing={listing} unit={selected} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
