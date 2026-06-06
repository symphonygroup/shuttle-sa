# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # nodemon, ignores public/; port 3000
npm start        # production start
npm run stop     # kill port 3000
npm run restart  # stop + dev
```

No build step. No linter configured. No tests. Frontend is raw JS/HTML served statically — changes take effect on page reload.

## Required environment variables

Copy to `.env` before running:

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
SESSION_SECRET=
DRIVER_EMAILS=driver@symphony.is          # comma-separated
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=mailto:admin@symphony.is
```

Generate VAPID keys: `node -e "const wp=require('web-push'); const k=wp.generateVAPIDKeys(); console.log(JSON.stringify(k,null,2));"`

## Architecture

**Backend** (`server.js`): Express + Socket.io on a single HTTP server. Session via `express-session` with `session-file-store` in dev, memory in prod. Passport Google OAuth restricts login to `@symphony.is` emails. Driver role is purely env-var-driven (`DRIVER_EMAILS`).

**Database** (`db.js` + `data/db.json`): Flat JSON file. No ORM, no migrations. Reads/writes on every call — fine for low traffic. Schema: `{ reservations: {tourId: {seatNumber: {userId, userName, stop, reservedAt}}}, pushSubscriptions: [], messages: [] }`.

**Routes**:
- `routes/api.js`: REST endpoints under `/api` — tours list, reserve/cancel, driver passenger list, push subscriptions, manual reset
- `routes/tours.js`: Static `TOURS` config object + `TOTAL_SEATS=19`. All tour data (stops, times, direction) lives here.
- Auth routes inline in `server.js`: `/auth/google`, `/auth/google/callback`, `/auth/logout`, `/auth/user`

**Frontend** (`public/`): Single-page app, no bundler. `public/js/app.js` is one large file with all UI logic. Tabs: tours, map (Leaflet + OpenStreetMap), chat, driver panel (hidden for non-drivers). State is module-level vars. Socket.io for real-time seat updates, GPS location sharing, and chat.

**Cron jobs** (in `server.js`): Reset all reservations daily at 11:00 Europe/Sarajevo; send push notifications at 15:00.

**Concurrency guard**: `reservationLocks` (in-memory Set) prevents double-booking on the same seat — not durable across restarts.

## Key business rules

- 1 reservation per user per morning group (`morning1`/`morning2`) and 1 per afternoon group (`afternoon1`/`afternoon2`)
- Drivers can cancel any reservation; users can only cancel their own
- `isDriver` flag on the session user object gates driver endpoints (`ensureDriver` middleware)
- Chat is always global (no per-tour chat)
- Push notification at 15:00 only fires if VAPID keys are configured and don't contain placeholder text
