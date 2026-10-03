# Booking Platform - Frontend

React + TypeScript (Vite) client for the booking platform backend, styled with Tailwind CSS v4.

## Structure

Feature-based, not layer-based - everything needed for one feature lives together:

```
src/
  app.tsx                routes + providers (composition root)
  shared/
    api/                 axios instance (auth header injection), shared DTO types
    stores/authStore.ts  zustand store for the JWT + role, persisted to localStorage
    lib/                 cn() classname helper, category -> icon/gradient/label theme map
    components/          Layout, ProtectedRoute, ListingMedia (category placeholder art)
    components/ui/       Button, Field/Input/Select/Textarea, Badge, Alert, Skeleton, EmptyState
  features/
    auth/                login/register pages + API calls
    listings/             browse/search, listing detail + booking form, provider "create listing" form
    bookings/             API calls + "my bookings" page
```

`shared/components/ui/` is a small local design system (not a UI library) - every page is built
from these same primitives so buttons, inputs, and empty/error states look and behave identically
everywhere. Listings have no photo upload pipeline yet, so `ListingMedia` renders a category-themed
gradient + icon instead of a fake stock photo (stays = blue/building, rentals = teal/key, attractions
= amber/rose/violet by sub-type) - honest placeholder art rather than misleading imagery.

Each `features/<x>/api.ts` is the only place that talks to a given backend resource - pages call it,
never `axios`/`httpClient` directly. Server state (listings, bookings) is cached with React Query;
the only client-only state is the auth session (zustand).

## Running locally

Requires the backend running on `http://localhost:8080` (see `../backend/README.md`).

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` if the backend runs on a different URL.

## Roles

- **Customer**: browse/search listings, book, view/cancel their own bookings.
- **Provider**: create + publish listings (multi-vendor - each provider only manages their own).

There is no provider-side "bookings on my listings" view yet - see the backend README's
"deliberately not built yet" section.
