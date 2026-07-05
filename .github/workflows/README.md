# Go Rent — full stack demo

Rent a place for exactly as long as you need it. A term-first rental platform:
pick a duration (weekend / week / month / season / year) before you browse, and
every price on the site is already correct for it.

## Stack

- **Backend:** Node.js + Express, JWT auth (bcryptjs + jsonwebtoken), JSON-file
  datastore (`src/data/db.json`) — swap for Postgres/Mongo later without
  touching the routes, since all access goes through `src/db.js`.
- **Frontend:** Vanilla HTML/CSS/JS (no build step), served as static files by
  Express and talking to the API over `fetch`. Structured as a regular
  multi-page site — see below.

## Run it

```bash
npm install
npm start
```

Then open **http://localhost:4000**. The API and frontend are served from the
same port.

For auto-reload during development: `npm run dev` (requires `nodemon`, already
in devDependencies).

## Project structure

```
go-rent/
├── server.js                # Express app entry point
├── src/
│   ├── db.js                 # JSON-file data access layer
│   ├── data/db.json           # Seed data: 6 listings, empty users/bookings
│   ├── utils/pricing.js       # Term definitions + price calculation
│   ├── middleware/auth.js     # JWT verification + role guard
│   └── routes/
│       ├── auth.js            # register / login
│       ├── listings.js        # browse, view, create (host only)
│       └── bookings.js        # create + look up bookings
└── public/
    ├── index.html             # Home — hero search, featured listings, teasers
    ├── explore.html           # Explore — full listings grid, filters, booking
    ├── how-it-works.html      # How It Works — booking flow, stay gauge, pricing table
    ├── host.html              # Host a place — benefits + listing form
    ├── styles.css
    ├── common.js               # shared: API helper, auth state, modal plumbing
    ├── home.js                 # page script for index.html
    ├── explore.js               # page script for explore.html
    ├── how-it-works.js          # page script for how-it-works.html
    └── host.js                  # page script for host.html
```

The frontend is a regular multi-page site (four linked HTML pages sharing one
header/footer/auth-modal, plus a `common.js` for shared state) rather than a
single scrolling page — real navigation between Home, Explore, How It Works,
and Host a Place, each served directly as a static file by Express.

## API reference

### Auth

| Method | Route | Body | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password, role }` | `role` is `"guest"` or `"host"`. Returns `{ token, user }`. |
| POST | `/api/auth/login` | `{ email, password }` | Returns `{ token, user }`. |

Send the token back as `Authorization: Bearer <token>` on protected routes.

### Listings

| Method | Route | Auth | Notes |
|---|---|---|---|
| GET | `/api/listings` | — | Query params: `location`, `term`. Returns listings with `pricing` attached. |
| GET | `/api/listings/terms` | — | Returns the raw term definitions the gauge is built from. |
| GET | `/api/listings/:id` | — | Single listing with pricing for all 5 terms. |
| POST | `/api/listings` | host only | `{ title, city, country, nightlyRate, bedrooms?, image?, description? }` |

### Bookings

| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/api/bookings` | — (guest checkout) | `{ listingId, term, moveInDate, guestName, guestEmail }` |
| GET | `/api/bookings/:id` | — | Look up a single booking. |
| GET | `/api/bookings?email=` | — | All bookings for an email address. |

## Pricing model

Every listing stores one `nightlyRate`. `src/utils/pricing.js` applies a
discount multiplier per term and multiplies by that term's night count:

| Term | Nights | Multiplier |
|---|---|---|
| Weekend | 2 | 1.00 |
| Week | 7 | 0.85 |
| Month | 30 | 0.65 |
| Season (3 mo) | 90 | 0.60 |
| Year | 365 | 0.46 |

This is the same logic behind the "Stay Gauge" on the homepage — the gauge just
visualizes `GET /api/listings/:id`'s `pricing` array.

## Notes on this being a demo

- The JSON-file datastore is fine for local development and evaluation, not
  concurrent production traffic — move to a real database before deploying.
- Booking is "confirmed" immediately; there's no payment gateway wired in.
- `JWT_SECRET` defaults to a hardcoded dev value — set the `JWT_SECRET`
  environment variable before deploying anywhere real.
