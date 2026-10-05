# Booking Platform - Frontend

The website of the booking platform: React 19 and TypeScript on Vite, styled with Tailwind CSS v4.
The interface is in French; the code is in English. It talks to the API described in
`../backend/README.md`.

## Running locally

The backend must be running on `http://localhost:8080` (see `../backend/README.md`).

```bash
npm install
npm run dev
```

The site opens on `http://localhost:5173`. Copy `.env.example` to `.env` if the API is elsewhere.

`npm run build` type-checks and builds; `npm run lint` runs oxlint.

## What it offers

- **Visitors** search listings (text, type, city, budget, rating, sort), open a listing with its
  photos and offers, see the price and availability for their dates, and keep favourites.
- **Customers** sign up, verify their email, reset a forgotten password, book, follow and cancel
  their bookings, leave a review, and edit their profile and photo.
- **Providers** (`/pro`) register a business, manage listings, offers, photos and their team,
  handle bookings, and answer reviews.
- **Admins** (`/admin`) approve, reject or suspend providers and deactivate accounts.

## Structure

Grouped by feature: what one feature needs lives in one folder.

```
src/
  App.tsx                 the routes
  index.css               design tokens (colours, fonts, shadows, animations) and base styles
  shared/
    api/                  axios client, the API's types, error messages in French, file upload
    stores/               the session, favourites and toasts (zustand)
    lib/                  formatting, labels and colours per listing type
    ui/                   Button, form fields, Modal, Tabs, badges, alerts, skeletons
    components/           Layout, ProtectedRoute, Avatar, ListingArt, FavoriteButton
  features/
    explore/              home page: search, filters, destinations, listing cards
    listing/              listing page: gallery, offers, booking panel, reviews
    auth/                 login, sign-up, forgotten password, email verification
    bookings/             my bookings, and the page of one booking
    favorites/            saved listings
    profile/              account, traveller details, password, photo
    pro/                  the provider's space
    admin/                platform administration
```

## How it is put together

- **Server data** goes through React Query. The search filters live in the URL, so a search can be
  shared and survives a reload; the API does the filtering, sorting and paging.
- **Client state** is small: the session (token and user) and the favourites are kept in
  `localStorage`; the choices in the booking panel are kept in `sessionStorage` so they survive the
  detour through the login page.
- **Everything is in MAD.** Amounts come from the API with their currency and are formatted by
  `formatMoney`.
- **The API answers in English.** `shared/api/errorMessages.ts` holds the French wording of each
  message; a message missing from it is shown as the API wrote it.
- **A listing without a photo** shows generated artwork in the colour of its type (`ListingArt`).
