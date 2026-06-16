---
description: Implement the plan in .claude/CURRENT.md end-to-end, verify, push, output PR text
argument-hint: no arguments, review .claude/CURRENT.md what will be used here
---

# /implement — build the plan

Read `.claude/CURRENT.md`. If empty/missing → stop, tell user to run `/specify <task>` first.
Load `CLAUDE.md` (root) for architecture + business rules + workflow rules.

Project = Express + Socket.io (`server.js`), raw JS frontend (`public/`), flat-JSON DB (`db.js` + `data/db.json`). No build step, no tests, npm + Biome v2.

**Hard rule:** DB is the local `data/db.json` file (git-ignored, auto-created from `data/db.example.json` on boot). No remote DB, no migrations. If a step seems to need a remote/prod data store, stop and ask.

Work the phases in order. After a failed verification, stop after 2 attempts on the same failure and present options (per global stuck-loop rule) instead of looping.

## Phase 0 — Preflight (branch + deps + env)

Run from repo root. Stop and report if any step fails.

1. **Branch**: `git switch main` → `git pull origin main`. Create feature branch `<type>/<kebab-desc>`: deduce `<type>` from the task (`feat`/`bugfix`/`chore`/...), `<kebab-desc>` derived from the CURRENT.md title. e.g. `feat/ride-date-label`. `git switch -c <branch>`.
2. **Deps**: `npm install`.
3. **Env**: confirm `.env` exists and the required keys (see `CLAUDE.md` → "Required environment variables") have real, non-placeholder values. If missing/placeholder → list exactly which keys, stop, ask user to fill. (VAPID missing only disables push, not a blocker.)
4. **DB**: `data/db.json` is auto-created on boot from `data/db.example.json`. If the plan adds new top-level keys, make sure `data/db.example.json` carries the same shape.

## Phase 1 — Implement

- Follow CURRENT.md plan step by step. Mirror existing patterns (cite from research).
- Backend changes in `server.js` / `routes/*.js`; DB access via `db.js` helpers (atomic tmp+rename writes — don't bypass). Frontend in `public/js/app.js` + html/css/`sw.js`.
- Socket.io: respect auth gating (`io.use`), driver-only event guards (`socket.data.user.isDriver`), and `tourId ∈ TOURS` validation when adding events.
- Don't add deps without telling the user. Don't commit secrets / `.env`.
- Make a **commit at each coherent milestone** (e.g. BE slice done, FE slice done). Stage intentionally. No AI/co-author footer. Commit format = short caveman subject + short bullet body.

## Phase 2 — Verify (must pass to be "done")

1. **Lint/format** (definition of done per CLAUDE.md): `npm run lint` then `npm run format`. Fix any reported issues, re-run until both pass clean.
2. **Smoke**: start dev server in background (`npm run dev`, port 3000); hit `GET /health` and confirm app boots without errors. Tear down (`npm run stop`) after.
3. **Playwright (mobile-first)**: for the user-facing flow in CURRENT.md, drive it with Playwright MCP against the running app — **default mobile viewport**, navigate, act, assert expected UI/state, screenshot key step. Check console for errors. Google OAuth: click "Sign in with Google" once (on-device Chrome session auto-logs in). Manage the dev server lifecycle yourself: start before, `npm run stop` + quit Chrome after — every run, no leftovers.
4. Choose methods that fit the task (backend/socket-only change → smoke + API/socket check; UI change → Playwright). Run the smallest reproducer for the specific feature.
5. Failed check is not done. Fix root cause, re-run. On repeated failure, stop and surface (stuck-loop rule).

## Phase 3 — Docs self-heal

If the implementation changed anything significant (new endpoint, new Socket.io event, new env var, new DB key, new convention, new business rule), update root `CLAUDE.md` to match reality — keep it short, clean, caveman-tight. Commit doc updates. Also think about updating `specify.md` and `implement.md` if there are things to change, do it in a simmilar manner as for `CLAUDE.md`.

## Phase 4 — Ship

1. Final commit of any remaining changes.
2. `git push -u origin <branch>`.
3. Output (do **not** open the PR) a ready-to-paste **PR title** + **PR description**. No template in repo → use: short summary, bullet list of changes, verification results (method + pass/fail). Imperative subject, no AI footer.

## Final report

Summarize: branch, commits made, what was verified (with method + result), doc changes, and the PR title/description block. State plainly what passed and what (if anything) is still open.
