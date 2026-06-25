---
description: Specify the production-readiness hardening plan (P0→P2) into .claude/CURRENT.md
argument-hint: optional phase filter — P0 | P1 | P2 (default = all, phased)
---

# /prod-ready — produce the production-hardening plan

You are in the SDD **specify** phase. Goal: turn the verified findings below into an accurate, actionable, **phased** plan in `.claude/CURRENT.md`. **Research + Plan only. No code modifications.** Then user runs `/implement`.

Optional arg **$ARGUMENTS**: if it names a phase (`P0`/`P1`/`P2`), plan only that phase; else plan all three, ordered.

Project = Express + Socket.io (`server.js`), raw JS/HTML/CSS frontend (`public/`), flat-JSON DB (`db.js` + `data/db.json`), Passport Google OAuth, `session-file-store`, `web-push`, `node-cron`, Biome v2. No bundler, no build, no tests. Deployed to Railway. Read root `CLAUDE.md` for full architecture + biz rules first.

## Locked decisions (do NOT re-ask these)

1. **Scope** = one CURRENT.md, **phased P0 → P1 → P2**, each phase independently committable so `/implement` can ship phase-by-phase.
2. **No new dependencies** for observability — keep `console.*`. Do NOT add pino/morgan/Sentry. (Upgrading existing deps is fine.)
3. **Destructive + infra ops = documented runbook only.** Plan WRITES a manual checklist (git-history purge commands, Railway dashboard steps, VAPID rotation) but `/implement` AUTO-RUNS NOTHING destructive (no force-push, no history rewrite, no `npm audit fix --force` without listing first). User executes those by hand.
4. **PWA = manifest + icons only.** Add `manifest.webmanifest` + icons (incl. the missing `/images/bus-icon.png`) + `<link rel="manifest">`. NO offline caching / SW fetch handler this round.

## Method

Findings below were verified against the codebase on review, but line numbers drift. For EACH item: re-locate the exact `file:line` in the current tree before planning it; if a finding no longer applies (already fixed), mark it `RESOLVED — skip` in the plan with one-line proof. Mirror existing patterns (cite `file:line`). Pull current docs (WebFetch/context7) for any library upgrade API change — never guess. Flag anything conflicting with `CLAUDE.md` biz rules.

---

## FINDINGS (authoritative spec input)

### P0 — production blockers / data loss / security

- **P0.1 Railway volume for `./data`.** `session-file-store` (`./data/sessions`) + `db.json` live on local disk; no in-repo deploy config. Without a mounted volume, every redeploy wipes reservations/sessions/db/push-subs + logs everyone out. → Commit a `railway.json` (or `.toml`) declaring volume mount on `./data`, `startCommand: npm start`, `healthcheckPath: /health`, `restartPolicyType: ON_FAILURE`, `numReplicas: 1`. Add boot-time log/assert that `./data` is writable so a misconfig is loud. Runbook: dashboard steps to attach the volume.
- **P0.2 Single-instance assumption.** `driverLocations`, `driverSocketByRide`, `reservationLocks` (in-mem module state), Socket.io rooms (no Redis adapter), file DB, and 4 crons all assume one process. >1 replica ⇒ double-booking, split GPS/chat, duplicate push, crons fire ×N. → Pin `numReplicas: 1` in `railway.json` (P0.1) + document the scaling ceiling in `CLAUDE.md`. (No Redis/Postgres this round — just enforce + document the single-instance contract.)
- **P0.3 Dependency vulns.** `npm audit` = 1 high (`ws`, transitive via socket.io — reachable WS DoS/mem-disclosure) + 7 moderate (`qs`/`express` DoS, **`passport` 0.6→0.7 session-fixation fix**, `node-cron`/`uuid`, `brace-expansion`). → Plan: list exact `npm audit fix` (non-`--force`) changes; explicit `npm update socket.io express passport`; verify login still works after passport bump (`req.logout` already callback-style). Defer major bumps (helmet 8, node-cron 4, dotenv 17, express-rate-limit 8) to P2 with per-dep testing. Re-run `npm audit` after, record residual count.
- **P0.4 PII in git history.** `data/db.json` committed @ `a4f64a9` (real employee names, chat messages, push-subscription endpoints + p256dh/auth keys), removed @ `42387b7` but recoverable from history. → **Runbook only** (decision 3): write `git filter-repo`/BFG purge commands + force-push + team re-clone steps, AND VAPID keypair rotation steps (regen, update Railway env, old push subs self-prune on 404/410). Do NOT execute. Flag force-push as destructive needing user confirmation + coordination.
- **P0.5 Reconnect loses state.** `public/js/app.js` socket `reconnect` handler (~76-82) re-joins rooms but never re-fetches → any `seatUpdate`/`reservationsReset` during the drop is lost; seat grid + manifests stay stale until manual reload. → On every (re)connect: rejoin rooms THEN reconcile (`loadTours()` + rebuild manifest/driver options + reload open manifest/passenger panels) — reuse the `reservationsReset` handler body. Also reconcile on initial `connect`, not just hide `connBanner`.
- **P0.6 `uncaughtException` keeps process alive.** `server.js:~377-378` logs but does not exit → zombie in undefined state keeps serving. → Log then `process.exit(1)` (let Railway restart). Same review for `unhandledRejection` (log; exit optional/configurable).
- **P0.7 No graceful shutdown.** No SIGTERM/SIGINT handler; Railway SIGTERMs every redeploy → sockets hard-killed, possible interrupt mid db read-modify-write. → Add handler: stop accepting, `io.close()` → `server.close()` → exit, with a timeout fallback force-exit.

### P1 — correctness / UX / robustness

- **P1.1 API auth redirect.** `middleware/auth.js:~3` `ensureAuthenticated` does `res.redirect('/login')` for ALL routes incl. `/api/*` → on session expiry `fetch()` follows 302, gets login HTML, client `res.json()` throws / misbehaves. → For `/api/*` (and XHR/`Accept: application/json`) return `401 {error}`; keep redirect for page routes (`/`). Update `app.js` fetchers to treat 401 as "session expired → /login".
- **P1.2 Missing `res.ok` guards.** `loadPassengers` (~904) and `doDriverReset` (~891) call `res.json()` directly — driver panel breaks silently on 401/500. → Add `if(!res.ok)` guard + user toast + 401→login, matching `loadTours`/`loadManifest`.
- **P1.3 PWA manifest + icons.** No `manifest.webmanifest`, no `<link rel="manifest">` (`index.html`), and `public/images/` is MISSING so `sw.js:6-7` `/images/bus-icon.png` notification icon+badge are broken. → Add `manifest.webmanifest` (name, short_name, theme/bg color matching the `theme-color` metas, `display: standalone`, start_url `/`, icon set 192/512 + maskable), create `public/images/bus-icon.png` (+ any icon sizes), link manifest in `index.html`. (No offline SW — decision 4.)
- **P1.4 Loading + error states.** Tours grid, "Ko putuje" manifest, and driver passenger list render empty/stale with no feedback during fetch or on failure. → Add skeleton/loading + explicit error UI (toast or inline) for each.
- **P1.5 Accessibility (reservation flow keyboard/SR-inaccessible).** Seat cells are non-semantic `<div>` (no `role=button`/`tabindex`/keyboard activation/`aria-label`). `#seatModal` has no `role=dialog`/`aria-modal`/focus-trap/Esc-to-close/focus-return. Tabs lack `role=tab`/`aria-selected`/`aria-controls`. → Make seats keyboard-operable + labeled (e.g. "Sjedište 5, slobodno"); make modal a real dialog (focus trap, Esc, restore focus); add tab ARIA. Keep changes minimal + style-preserving.
- **P1.6 Double-cancel.** `doCancel` (~659) doesn't disable the button during in-flight DELETE → double-tap fires 2 DELETEs, 2nd 404s → confusing error toast. → Disable button during request (mirror `doReserve`).
- **P1.7 Two simultaneous drivers.** `app.js` `driverLocation` handler (~136-146) renders any rideId's location onto one shared `busMarker` → two live buses ping-pong one marker. → Either key marker by rideId (support N buses) OR explicitly handle/label the multi-bus case. Pick simplest correct (confirm real-world: can 2 buses run at once? if morning1+morning2 overlap, yes). Document choice.
- **P1.8 `writeDB` no fsync.** `db.js` tmp+rename guards truncation but no `fsync` on fd/dir → kill/power-loss can leave stale/zero-length `db.json`. → `fs.fsync` the tmp fd before rename + fsync dir after (small, durability win).
- **P1.9 `POST /api/driver/reset` unguarded mass-wipe.** `resetAllReservations()` drops ALL dates, no confirm/undo, no backup. → Add a server-side guard (e.g. require explicit confirm token/body flag) + a timestamped backup copy of `db.json` before reset. Keep the existing client `confirm()` too. (Note: client uses native `confirm()` — see P2.)
- **P1.10 No Node version pin.** No `engines.node` / `.nvmrc`; local is v24, Railway picks default → drift. Code uses `node:` import prefixes. → Add `"engines": {"node": ">=20"}` (or chosen LTS) + `.nvmrc`. Confirm Railway uses `npm ci` (lockfile present).

### P2 — polish / hygiene

- **P2.1** `escapeHtml` (`app.js:~1059`) doesn't escape `'` — not currently exploitable (text/double-quoted sinks) but a footgun. Add `'`→`&#39;`.
- **P2.2** Trusted-but-unescaped innerHTML: `tour.name`/`departureTime`/`dateLabel`/`displayDate` injected raw in card/modal renders. Safe today (server config) but inconsistent. Route through `escapeHtml`.
- **P2.3** Leaflet loaded from `unpkg.com` (`index.html:15-19`) with no SRI/`crossorigin` and no local fallback → map dead if CDN blocked, `L` undefined throws. Add `integrity`+`crossorigin` (pin known hashes) or self-host.
- **P2.4** Google Fonts via render-blocking `@import` in `css/app.css` on the app page (login uses `<link>`). Move app font to `<link rel="stylesheet">` in `index.html` head (preconnect already present).
- **P2.5** Chat send uses deprecated `keypress` (`app.js:~753,878`) — unreliable on mobile/IME. Switch to `keydown`.
- **P2.6** Identity keyed on `displayName` (`isMine`, driver self-ding suppression, `.mine` styling) → collides for duplicate display names. Key on stable `userId` (already on session user). Server already stamps `userName` from session (no XSS), this is correctness only.
- **P2.7** `socket.emit('sendMessage', {text, userName})` still sends `userName` — server ignores it (uses session). Drop the dead/misleading field client-side.
- **P2.8** `playDing()` builds `new Audio()` per alert → GC churn / mobile throttling. Cache one Audio instance.
- **P2.9** Manifest renderer (`app.js:~368-390`) and driver-passenger renderer (~904-943) ~90% duplicated → extract shared renderer to stop drift.
- **P2.10** Service worker has no update/versioning lifecycle (`navigator.serviceWorker.register` no `updatefound`/`controllerchange`). Even push-only, add minimal update handling so future SW changes don't get stuck. (Still no caching — decision 4.)
- **P2.11** `@keyframes cardIn` stagger uses `.tour-card:nth-child(n)` but `loadTours` interleaves `.ride-date-label`/`.tour-group-label` as grid children → delays land on labels, stagger broken. Fix selector or wrap cards.
- **P2.12** Dead CSS: `.map-header`/`.map-status` (no matching markup since map overlay replaced them). Remove.
- **P2.13** Native `confirm()` for driver reset — jarring on mobile, off-style. Replace with the app's modal/toast pattern.
- **P2.14** `.env.example` has real-ish addresses (`MANAGER_EMAILS`, `VAPID_EMAIL`) — replace with obvious placeholders (`manager@example.com`). Drop the `SESSION_SECRET || 'change_me'` fallback in `server.js` (rely on fail-fast).
- **P2.15** No CI runs lint. Add a minimal GitHub Actions workflow running `npm ci` + `npm run lint` on PRs. (No new runtime deps.)
- **P2.16** Major dep bumps deferred from P0.3: helmet 7→8, node-cron 3→4 (breaking scheduler API), dotenv 16→17, express-rate-limit 7→8 — bump one at a time, smoke each.

---

## Write `.claude/CURRENT.md`

Overwrite it. Caveman style (drop articles/filler, fragments OK) but keep EVERY path, identifier, `file:line`, contract verbatim. Shape:

```
# CURRENT — Production hardening (P0→P2)

## Goal
<2-3 lines: make shuttle-sa safe to run in prod; phased.>

## Phases overview
- P0 (blockers): items + 1-line each
- P1 (correctness/UX): ...
- P2 (polish): ...

## Per-item plan
For each P-item (in order, P0 first):
  ### P0.1 <title>   [status: PLAN | RESOLVED-skip]
  - locate: <file:line confirmed now>
  - change: <concrete edit>
  - files: <list>
  - risk/notes: <breaking? needs lib doc? biz-rule touch?>

## Runbook (manual — NOT auto-run by /implement)
- git-history PII purge: <exact commands>
- VAPID rotation: <steps>
- Railway dashboard: volume mount on ./data, replicas=1, healthcheck /health, restart policy

## Contracts (changed/added)
- api: <e.g. ensureAuthenticated → 401 JSON for /api/*>
- socket: <reconnect reconcile; driverLocation multi-bus>
- db: <fsync; backup-before-reset; no schema change>
- config: railway.json, manifest.webmanifest, engines, .nvmrc

## Invariants (V)
V1: single instance only (replicas=1) — locks/GPS/crons/file-DB not shared.
V2: /api/* never 302-redirects; returns JSON status.
V3: no new runtime deps added this round.
V4: /implement auto-runs nothing destructive (history rewrite, force-push, mass data ops).
V5: ./data must be a persistent mount in prod or all data is ephemeral.
<add more as found>

## Verify (for /implement Phase 2)
- npm run lint + npm run format clean (definition of done).
- npm audit: record before/after counts; residual listed.
- smoke: app boots, GET /health ok, no console errors.
- Playwright (mobile viewport), per role — toggle DRIVER_EMAILS/MANAGER_EMAILS in .env + re-login (flags set at login):
  - regular user: reserve (station required), cancel own, group/seat limits enforced, 2-day window (Danas/Sutra) correct.
  - driver: GPS share/stop, passenger manifest, reset (guarded), chat like (double-tap), driver-only gating.
  - manager: multi-seat guest booking (★/Gost), cancel own guest seats.
  - reconnect: drop socket, confirm state reconciles (P0.5).
  - a11y smoke: keyboard reserve + modal focus trap/Esc (P1.5).

## Open questions / assumptions
- <only genuine blockers; otherwise record assumption + proceed>
```

## Resolve unknowns

Only ask the user if something is GENUINELY ambiguous and changes the approach (the 4 locked decisions above are already settled — don't re-ask). Otherwise pick the obvious option, record the assumption in CURRENT.md.

## Report

Print 3-5 line summary + total planned step count + per-phase counts + any RESOLVED-skip items. Tell user: review `.claude/CURRENT.md`, then run `/implement` (optionally phase-by-phase — `/implement` ships one branch+PR per run, so consider running it once per phase for reviewable PRs).
