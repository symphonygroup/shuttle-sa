# CLAUDE.md

Guide for Claude Code (claude.ai/code) working in this repo.

## Commands

```bash
npm run dev      # nodemon, ignores public/ and data/ (session-file-store writes there); port 3000
npm start        # production start
npm run stop     # kill port 3000
npm run restart  # stop + dev
npm run lint     # biome lint . (lint rules only, no format check)
npm run format   # biome format --write . (opt-in; do NOT mass-reformat untouched files)
```

No build step. No tests. Frontend raw JS/HTML served static — changes live on reload. Linter/formatter **Biome v2** (`biome.json`); only `recommended` rules + `a11y.useValidLang: off` (Biome's valid-language list lacks `bs`/Bosnian, valid ISO 639-1 code used by UI).

## Required env vars

Copy to `.env` before run:

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

Gen VAPID keys: `node -e "const wp=require('web-push'); const k=wp.generateVAPIDKeys(); console.log(JSON.stringify(k,null,2));"`

In **production** (`NODE_ENV=production`) server fails fast at boot if `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, or `SESSION_SECRET` missing (dev only warns). VAPID missing only disables push (no crash).

## Architecture

**Backend** (`server.js`): Express + Socket.io, single HTTP server. Session via `express-session` + `session-file-store` in **both** dev and prod (`./data/sessions`) — prod needs persistent volume on `./data` or sessions lost on redeploy. Cookie `secure` on only in prod. Passport Google OAuth restricts login to `@symphony.is` emails. Driver role env-var-driven (`DRIVER_EMAILS`); manager role same (`MANAGER_EMAILS`). Both flags (`isDriver`/`isManager`) live on session user, set at login — **changing env emails needs re-login to take effect** (old sessions keep old flags).

**Ride identity (two-day window)**: rooms + GPS + manifests keyed by **`rideId = `${tourId}__${date}`** (date = `YYYY-MM-DD` Sarajevo). `rides.js` is source of truth: `getActiveRides()` returns today (per-direction, only before its cutoff) + tomorrow (always) ride objects `{id,tourId,date,dateLabel('Danas'/'Sutra'),displayDate,direction,name,departureTime,stops}`; `isRideActive(tourId,date)` gates reserve; `sarajevoDate(offset)`/`parseRideId`/`rideId` helpers. Cutoffs: morning(`toOffice`) 10:00, afternoon(`fromOffice`) 18:30. Window is calendar-anchored (never day-after-tomorrow); rolls at midnight.

**Socket.io auth**: every socket needs authed session (rejected via `io.use` else). Driver-only events (`joinDriverInbox`, `driverLocation`, `driverStopSharing`) need `socket.data.user.isDriver`. `joinTour`/`leaveRoom`/`driverStopSharing` take a **`rideId`** (server `parseRideId` → validates `tourId ∈ TOURS`). `seatUpdate`/`driverLocation`/`driverLocationStopped` payloads carry `tourId`+`date` (driverLocation also `name`/`departureTime`) so client matches the right dated ride; `lat`/`lng` validated `Number.isFinite` before store/broadcast. `driverLocation` is **not** gated on the cutoff so a ride in progress past its cutoff keeps streaming (no frozen bus). `sendMessage`'s `userName` taken from server-side session (`socket.data.user.displayName`), never trusted from client payload (was spoofable). Driver's GPS share pinned to the rideId active when sharing started (client tracks via `sharingTourId`=rideId) — `driverSocketByRide` (rideId → socket.id) lets server clear `driverLocations[rideId]` on `disconnect` if driver closes tab/loses signal mid-share w/o clicking Stop, prevents stale "ghost bus" marker.

**Database** (`db.js` + `data/db.json`): Flat JSON file, **git-ignored** (prev committed w/ real data). Seeded from `data/db.example.json`, auto-created on boot if missing. Writes atomic (tmp file + rename). No ORM. Schema: `{ reservations: {date: {tourId: {seatNumber: {userId, userName, stop, guest?, reservedAt}}}}, pushSubscriptions: [], messages: [] }` — reservations **date-keyed** (`date`=`YYYY-MM-DD` Sarajevo) so today's & tomorrow's same tour have separate seat pools (`guest:true` on manager-booked seats). Helpers take `date`: `getReservationsForRide(date,tourId)`, `reserve(date,tourId,seat,data)`, `cancelReservation(date,tourId,seat)`, `resetReservationsForTours(date,tourIds)`. `purgePastDates(today)` drops past dates; `migrateLegacyReservations(today,tourIds)` moves any pre-date-window `reservations[tourId]` under `reservations[today][tourId]`. **Boot** (`server.js`) runs migrate+purge once (no in-flight loss on first deploy of date schema). Expired push subs (404/410) pruned by 15:00 cron.

**Routes**:
- `routes/api.js`: REST endpoints under `/api` — `GET /tours` (returns active dated **rides**, today+tomorrow window), reserve/cancel, driver passenger list, public passenger manifest, push subs, manual reset. All ride-scoped routes carry **date**: `POST /reserve` body `{tourId,date,seatNumber,stop}` (400s if `!isRideActive(tourId,date)`); cancel `DELETE /reserve/:tourId/:date/:seatNumber`. `GET /tours/:tourId/:date/passengers` (any authed user) + driver-only `GET /driver/passengers/:tourId/:date` share `buildManifest(date,tourId)` (names grouped by stop, route order; exposes only userName/seat/stop/guest). Per-user group limit (1 morning+1 afternoon) scoped **per date**. Mutating endpoints (`reserve`, cancel, `push/subscribe`, `driver/reset`) behind per-IP `express-rate-limit` (60/min). Plus `GET /health` in `server.js` for Railway healthchecks.
- `routes/tours.js`: Static `TOURS` config object + `TOTAL_SEATS=19`. All tour data (stops, times, direction) lives here.
- Auth routes inline in `server.js`: `/auth/google`, `/auth/google/callback`, `/auth/logout`, `/auth/user`

**Frontend** (`public/`): Single-page app, no bundler. `public/js/app.js` one big file, all UI logic. Tabs: tours, map (Leaflet + OpenStreetMap), chat, driver panel (hidden non-drivers). Map tab has **no tour selector**: shows empty state (`#mapEmpty`) til driver shares location, then reveals map w/ `#mapActiveTour` overlay naming live ride (driven by `driverLocation`/`driverLocationStopped`). Map auto-centers on bus marker only once per "reveal" (`mapCenteredOnReveal` flag, reset on `driverLocationStopped`) — recenter gated on `#tab-map` actually visible, since Leaflet computes wrong bounds against hidden (0×0) container; after first center never fights manual pan/zoom. Tours grid grouped by service date (Danas section then Sutra), each with morning/afternoon subgroups; cards/ids keyed by `rideId`. Tours tab also has "Ko putuje" manifest (ride selector labeled `name · time · Danas/Sutra` → colleague names by station, route order, live via `seatUpdate`/`reservationsReset`). `reservationsReset` triggers a full `loadTours()` refetch (drops retired rides, surfaces new tomorrow). Driver dropdown lists **today's** rides only. State module-level vars (`manifestRideId`, `activeDriverTourId`/`sharingTourId` hold rideIds). Socket.io for real-time seat updates, GPS share, chat. Driver chat alert plays `public/sounds/driver-alert.wav` (falls back to synthesized tone if missing/blocked by autoplay policy). Responsive tablet breakpoint at `min-width:768px` (driver uses tablet); `min-width:700px` reflows driver split.

**Cron jobs** (in `server.js`, Europe/Sarajevo): morning retire 10:00 `db.resetReservationsForTours(sarajevoDate(),['morning1','morning2'])`; afternoon retire 18:30 same for afternoons; **midnight 00:00** `db.purgePastDates(sarajevoDate())` (calendar rollover tidy). All emit `reservationsReset` (clients refetch the window). With date-keying, tomorrow's same tour (different date key) is untouched by a retire cron — no collision possible; the retire crons mainly drop the now-departed today data + push a live refresh so open clients hide retired rides. `db.resetAllReservations()` (wipes all dates) still used only by manual driver-only `POST /api/driver/reset`. Push notifs still sent 15:00.

Note: today/tomorrow is now real (per-date seat pools), no longer a cosmetic 11:00 FE label — `getRideDate()`/`nowMinutesSarajevo()` removed; FE renders BE-provided `dateLabel`/`displayDate` from `rides.js`.

**Concurrency guard**: `reservationLocks` (in-memory Set) stops double-booking same seat — not durable across restarts.

**Scaling ceiling — SINGLE INSTANCE ONLY** (`numReplicas: 1`, set in Railway dashboard; default is 1). `driverLocations`/`driverSocketByRide`/`reservationLocks` are in-memory module state, Socket.io rooms have no Redis adapter, DB is a local file, and crons run in-process. With >1 replica: seat double-booking (locks not shared), GPS/seat/chat updates only reach clients on the same instance, crons fire once **per** replica (duplicate push), and two instances on separate volumes diverge. Horizontal scaling would require Postgres/Redis + `@socket.io/redis-adapter` + externalized session store and locks — out of current scope.

**Deploy/ops**: `railway.json` (repo root) pins `startCommand: npm start`, `healthcheckPath: /health`, `restartPolicyType: ON_FAILURE`. **Volume + replicas=1 are NOT declarable in `railway.json`** (Railway schema) — set them in the dashboard: persistent Volume mounted at `<service>/data` (else every redeploy wipes sessions + `db.json` + push subs), replicas=1. Boot fails fast in prod if `./data` not writable (`server.js`). Graceful shutdown on SIGTERM/SIGINT closes Socket.io + HTTP before exit; `uncaughtException`/`unhandledRejection` log then `exit(1)` (Railway restarts clean, no zombie).

## Key biz rules

- 1 reservation per user per morning group (`morning1`/`morning2`) + 1 per afternoon group (`afternoon1`/`afternoon2`), **scoped per date** (user may hold today-morning AND tomorrow-morning, but not two in the same day's morning group). **Managers (`isManager`) bypass this** — book multiple seats (one DELETE per seat) for guests who can't log in; each such seat flagged `guest:true`, shown ★/Gost in grid + manifests. Cap unchanged: distinct seats per dated ride ≤ `TOTAL_SEATS` (seats unique 1..19).
- `toOffice` tours (morning1/2) share same stops; `fromOffice` tours (afternoon1/2) have **different** stops. All stop logic per-tour (`TOURS[tourId].stops`) — never hardcode stop list.
- Station must be chosen before reserve (no auto-selected first stop; reserve button disabled til chosen; BE still 400s on empty/invalid stop)
- Drivers like chat msg by double-tap (≤350ms), not click heart; heart visual indicator only. Like toggle stays driver-only (server-gated)
- Drivers cancel any reservation; users (incl managers) only cancel own bookings (manager owns their guest seats)
- `isDriver` flag on session user object gates driver endpoints (`ensureDriver` middleware); `isManager` checked inline in `POST /api/reserve` (no dedicated middleware)
- Chat always global (no per-tour chat)
- Push notif at 15:00 only fires if VAPID keys configured + no placeholder text

## Workflow rules

- **Playwright**: when used for manual test/verify, Claude must manage dev server lifecycle itself — start before, stop (`npm run stop`) + quit Chrome after, every run, no leftovers. Always launch Playwright w/ default mobile viewport size (mobile-first app).
- **Google OAuth**: when using Playwright for testing, click sign-in-with-Google button on my behalf, session saved on-device (Chrome) so you get logged on one click — ready for testing.
- **Definition of done**: before declaring task complete, run `npm run lint` + `npm run format`, fix reported issues, re-run til both pass clean. Task not done if lint/format fails.

## AI Docs Rules

- Always update this @CLAUDE.md file if significant changes like:
  - Something new added worth mentioning for AI assistants future sessions
  - Something significant changed in current state worth removing/updating for future sessions
  - Keep file clean, short, understandable

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands w/ `rtk`**. If RTK has dedicated filter, uses it. If not, passes through unchanged. RTK always safe to use.

**Important**: even in command chains w/ `&&`, use `rtk`:
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

Note: Git passthrough works ALL subcommands, even unlisted.

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

Overall avg: **60-90% token reduction** on common dev ops.
<!-- /rtk-instructions -->