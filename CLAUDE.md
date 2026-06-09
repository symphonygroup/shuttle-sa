# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # nodemon, ignores public/ and data/ (session-file-store writes there); port 3000
npm start        # production start
npm run stop     # kill port 3000
npm run restart  # stop + dev
npm run lint     # biome lint . (lint rules only, no format check)
npm run format   # biome format --write . (opt-in; do NOT mass-reformat untouched files)
```

No build step. No tests. Frontend is raw JS/HTML served statically — changes take effect on page reload. Linter/formatter is **Biome v2** (`biome.json`); only `recommended` rules plus `a11y.useValidLang: off` (Biome's valid-language list lacks `bs`/Bosnian, a valid ISO 639-1 code used by the UI).

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

In **production** (`NODE_ENV=production`) the server fails fast at boot if `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, or `SESSION_SECRET` are missing (dev only warns). VAPID missing only disables push (no crash).

## Architecture

**Backend** (`server.js`): Express + Socket.io on a single HTTP server. Session via `express-session` with `session-file-store` in **both** dev and prod (`./data/sessions`) — prod requires a persistent volume on `./data` or sessions are lost on redeploy. Cookie `secure` is on only in prod. Passport Google OAuth restricts login to `@symphony.is` emails. Driver role is env-var-driven (`DRIVER_EMAILS`).

**Socket.io auth**: every socket must carry an authenticated session (rejected via `io.use` otherwise). Driver-only events (`joinDriverInbox`, `driverLocation`, `driverStopSharing`) require `socket.data.user.isDriver`. `joinTour`/location events validate `tourId ∈ TOURS`. Client `leaveRoom` is handled server-side.

**Database** (`db.js` + `data/db.json`): Flat JSON file, **git-ignored** (was previously committed with real data). Seeded from `data/db.example.json`, auto-created on boot if missing. Writes are atomic (tmp file + rename). No ORM, no migrations. Schema: `{ reservations: {tourId: {seatNumber: {userId, userName, stop, reservedAt}}}, pushSubscriptions: [], messages: [] }`. Expired push subs (404/410) pruned by the 15:00 cron.

**Routes**:
- `routes/api.js`: REST endpoints under `/api` — tours list, reserve/cancel, driver passenger list, push subscriptions, manual reset. Mutating endpoints (`reserve`, cancel, `push/subscribe`, `driver/reset`) are behind a per-IP `express-rate-limit` (60/min). Plus `GET /health` in `server.js` for Railway healthchecks.
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

## Workflow rules

- **Playwright**: when used for manual testing/verification, Claude must manage the dev server lifecycle itself — start it before, stop it (`npm run stop`) and quit Chrome after, every run, no leftovers. Always launch Playwright with a default mobile viewport size (this is a mobile-first app).
- **Definition of done**: before declaring any task complete, run `npm run lint` and `npm run format`, fix any reported issues, and re-run until both pass clean. A task is not done if linting/formatting fails.

## AI Docs Rules

- Always update this @CLAUDE.md file if there are significant changes like:
  - Something new added that is worth mentioning for AI assistants in future sessions
  - Something significant changed in current state that is worth removing or updating for future sessions
  - Keep the file always clean, short and understandable
