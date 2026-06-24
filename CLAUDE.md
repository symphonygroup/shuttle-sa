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
MANAGER_EMAILS=manager@symphony.is        # comma-separated; can book multiple seats for guests
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=mailto:admin@symphony.is
```

Generate VAPID keys: `node -e "const wp=require('web-push'); const k=wp.generateVAPIDKeys(); console.log(JSON.stringify(k,null,2));"`

In **production** (`NODE_ENV=production`) the server fails fast at boot if `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, or `SESSION_SECRET` are missing (dev only warns). VAPID missing only disables push (no crash).

## Architecture

**Backend** (`server.js`): Express + Socket.io on a single HTTP server. Session via `express-session` with `session-file-store` in **both** dev and prod (`./data/sessions`) — prod requires a persistent volume on `./data` or sessions are lost on redeploy. Cookie `secure` is on only in prod. Passport Google OAuth restricts login to `@symphony.is` emails. Driver role is env-var-driven (`DRIVER_EMAILS`); manager role likewise (`MANAGER_EMAILS`). Both flags (`isDriver`/`isManager`) live on the session user, set at login — **changing env emails requires re-login to take effect** (old sessions keep their old flags).

**Socket.io auth**: every socket must carry an authenticated session (rejected via `io.use` otherwise). Driver-only events (`joinDriverInbox`, `driverLocation`, `driverStopSharing`) require `socket.data.user.isDriver`. `joinTour`/location events validate `tourId ∈ TOURS`. Client `leaveRoom` is handled server-side. `driverLocation`/`driverLocationStopped` payloads carry `tourId` (+ `name`/`departureTime`) so the map auto-identifies the active ride; `lat`/`lng` are validated with `Number.isFinite` before storing/broadcasting. `sendMessage`'s `userName` is taken from the server-side session (`socket.data.user.displayName`), never trusted from the client payload (was spoofable). A driver's GPS share is pinned to the tour active when sharing started (client tracks this in `sharingTourId`, independent of later dropdown changes) — `driverSocketByTour` (tourId → socket.id) lets the server clear `driverLocations[tourId]` on `disconnect` if a driver closes the tab/loses signal mid-share without clicking Stop, preventing a stale "ghost bus" marker.

**Database** (`db.js` + `data/db.json`): Flat JSON file, **git-ignored** (was previously committed with real data). Seeded from `data/db.example.json`, auto-created on boot if missing. Writes are atomic (tmp file + rename). No ORM, no migrations. Schema: `{ reservations: {tourId: {seatNumber: {userId, userName, stop, guest?, reservedAt}}}, pushSubscriptions: [], messages: [] }` (`guest:true` on manager-booked seats). Expired push subs (404/410) pruned by the 15:00 cron.

**Routes**:
- `routes/api.js`: REST endpoints under `/api` — tours list, reserve/cancel, driver passenger list, public passenger manifest, push subscriptions, manual reset. `GET /tours/:tourId/passengers` (any authed user) and driver-only `GET /driver/passengers/:tourId` share `buildManifest()` (names grouped by stop, route order; exposes only userName/seat/stop/guest). Mutating endpoints (`reserve`, cancel, `push/subscribe`, `driver/reset`) are behind a per-IP `express-rate-limit` (60/min). Plus `GET /health` in `server.js` for Railway healthchecks.
- `routes/tours.js`: Static `TOURS` config object + `TOTAL_SEATS=19`. All tour data (stops, times, direction) lives here.
- Auth routes inline in `server.js`: `/auth/google`, `/auth/google/callback`, `/auth/logout`, `/auth/user`

**Frontend** (`public/`): Single-page app, no bundler. `public/js/app.js` is one large file with all UI logic. Tabs: tours, map (Leaflet + OpenStreetMap), chat, driver panel (hidden for non-drivers). Map tab has **no tour selector**: it shows an empty state (`#mapEmpty`) until a driver shares location, then reveals the map with a `#mapActiveTour` overlay naming the live ride (driven by `driverLocation`/`driverLocationStopped`). The map only auto-centers on the bus marker once per "reveal" (`mapCenteredOnReveal` flag, reset on `driverLocationStopped`) — recenter is gated on `#tab-map` actually being visible, since Leaflet computes wrong bounds against a hidden (0×0) container; after that first center it never fights a manual pan/zoom. Tours tab also has a "Ko putuje" manifest (tour selector → colleague names by station, route order, live via `seatUpdate`/`reservationsReset`). State is module-level vars. Socket.io for real-time seat updates, GPS location sharing, and chat. Driver chat alert plays `public/sounds/driver-alert.mp3` (falls back to a synthesized tone if missing/blocked by autoplay policy). Responsive tablet breakpoint at `min-width:768px` (driver uses a tablet); `min-width:700px` reflows the driver split.

**Cron jobs** (in `server.js`): two reservation-reset crons split by direction, each firing after that direction's tours have departed (Europe/Sarajevo) — morning (`morning1`/`morning2`) at 10:00, afternoon (`afternoon1`/`afternoon2`) at 18:30; both call `db.resetReservationsForTours(tourIds)` and emit `reservationsReset`. A single wholesale 11:00 wipe used to delete same-day afternoon bookings made before 11:00 (afternoon tours depart 16:20/17:30, after 11:00) — fixed by scoping each cron to its own direction group. `db.resetAllReservations()` still exists, used only by the manual driver-only `POST /api/driver/reset` (full immediate wipe, unchanged). Push notifications still sent at 15:00.

Note: the FE "today vs tomorrow" label cutoff (`public/js/app.js` `getRideDate()`/`defaultManifestTourId()`) still flips at 11:00 — now cosmetically out of sync with the 10:00/18:30 backend reset times (label logic untouched, separate concern).

**Concurrency guard**: `reservationLocks` (in-memory Set) prevents double-booking on the same seat — not durable across restarts.

## Key business rules

- 1 reservation per user per morning group (`morning1`/`morning2`) and 1 per afternoon group (`afternoon1`/`afternoon2`). **Managers (`isManager`) bypass this** — they book multiple seats (one DELETE per seat) for guests who can't log in; each such seat is flagged `guest:true` and shown as ★/Gost in grid + manifests. Cap is unchanged: distinct seats per tour ≤ `TOTAL_SEATS` (seats are unique 1..19).
- `toOffice` tours (morning1/2) share the same stops; `fromOffice` tours (afternoon1/2) have **different** stops. All stop logic is per-tour (`TOURS[tourId].stops`) — never hardcode a stop list.
- A station must be chosen before reserving (no auto-selected first stop; reserve button disabled until chosen; BE still 400s on empty/invalid stop)
- Drivers like a chat message by double-tapping it (≤350ms), not by clicking the heart; heart is a visual indicator only. Like toggle stays driver-only (server-gated)
- Drivers can cancel any reservation; users (incl. managers) can only cancel their own bookings (a manager owns their guest seats)
- `isDriver` flag on the session user object gates driver endpoints (`ensureDriver` middleware); `isManager` is checked inline in `POST /api/reserve` (no dedicated middleware)
- Chat is always global (no per-tour chat)
- Push notification at 15:00 only fires if VAPID keys are configured and don't contain placeholder text

## Workflow rules

- **Playwright**: when used for manual testing/verification, Claude must manage the dev server lifecycle itself — start it before, stop it (`npm run stop`) and quit Chrome after, every run, no leftovers. Always launch Playwright with a default mobile viewport size (this is a mobile-first app).
- **Google OAuth**: when using Playwright for testing, click on button to sign in with Google on my behalf, session is saved on-device (Chrome) so you will get logged on with one click - and be ready for testing.
- **Definition of done**: before declaring any task complete, run `npm run lint` and `npm run format`, fix any reported issues, and re-run until both pass clean. A task is not done if linting/formatting fails.

## AI Docs Rules

- Always update this @CLAUDE.md file if there are significant changes like:
  - Something new added that is worth mentioning for AI assistants in future sessions
  - Something significant changed in current state that is worth removing or updating for future sessions
  - Keep the file always clean, short and understandable

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk go test             # Go test failures only (90%)
rtk jest                # Jest failures only (99.5%)
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk pytest              # Python test failures only (90%)
rtk rake test           # Ruby test failures only (90%)
rtk rspec               # RSpec test failures only (60%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%). Format flags (-c, -l, -L, -o, -Z) run raw.
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category         | Commands                       | Typical Savings |
| ---------------- | ------------------------------ | --------------- |
| Tests            | vitest, playwright, cargo test | 90-99%          |
| Build            | next, tsc, lint, prettier      | 70-87%          |
| Git              | status, log, diff, add, commit | 59-80%          |
| GitHub           | gh pr, gh run, gh issue        | 26-87%          |
| Package Managers | pnpm, npm, npx                 | 70-90%          |
| Files            | ls, read, grep, find           | 60-75%          |
| Infrastructure   | docker, kubectl                | 85%             |
| Network          | curl, wget                     | 65-70%          |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->
