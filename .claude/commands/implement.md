---
description: Implement the plan in .claude/CURRENT.md end-to-end, verify, push, output PR text
argument-hint: no arguments, review .claude/CURRENT.md what will be used here
---
# /implement — build plan

Read `.claude/CURRENT.md`. Empty/missing → stop, tell user run `/specify <task>` first.
Load `CLAUDE.md` (root) for architecture + biz rules + workflow rules.

Project = Express + Socket.io (`server.js`), raw JS frontend (`public/`), flat-JSON DB (`db.js` + `data/db.json`). No build step, no tests, npm + Biome v2.

**Hard rule:** DB = local `data/db.json` file (git-ignored, auto-created from `data/db.example.json` on boot). No remote DB, no migrations. Step needs remote/prod data store → stop, ask.

Work phases in order. Failed verification → stop after 2 attempts same failure, present options (per global stuck-loop rule), don't loop.

## Phase 0 — Preflight (branch + deps + env)

Run from repo root. Any step fail → stop, report.

1. **Branch**: `git switch main` → `git pull origin main`. Make feature branch `<type>/<kebab-desc>`: deduce `<type>` from task (`feat`/`bugfix`/`chore`/...), `<kebab-desc>` from CURRENT.md title. e.g. `feat/ride-date-label`. `git switch -c <branch>`.
2. **Deps**: `npm install`.
3. **Env**: confirm `.env` exists, required keys (see `CLAUDE.md` → "Required environment variables") hold real, non-placeholder values. Missing/placeholder → list exact keys, stop, ask user fill. (VAPID missing only disables push, not blocker.)
4. **DB**: `data/db.json` auto-created on boot from `data/db.example.json`. Plan adds new top-level keys → make sure `data/db.example.json` carries same shape.

## Phase 1 — Implement

- Follow CURRENT.md plan step by step. Mirror existing patterns (cite from research).
- Backend changes in `server.js` / `routes/*.js`; DB access via `db.js` helpers (atomic tmp+rename writes — don't bypass). Frontend in `public/js/app.js` + html/css/`sw.js`.
- Socket.io: respect auth gating (`io.use`), driver-only event guards (`socket.data.user.isDriver`), `tourId ∈ TOURS` validation when adding events.
- No deps without telling user first. No secrets / `.env` in commits.
- **Commit at each coherent milestone** (e.g. BE slice done, FE slice done). Stage intentionally. No AI/co-author footer. Commit format = short caveman subject + short bullet body.

## Phase 2 — Verify (must pass = "done")

1. **Lint/format** (definition of done per CLAUDE.md): `npm run lint` then `npm run format`. Fix reported issues, re-run till both clean.
2. **Smoke**: start dev server background (`npm run dev`, port 3000); hit `GET /health`, confirm app boots no errors. Tear down (`npm run stop`) after.
3. **Playwright (mobile-first)**: for user-facing flow in CURRENT.md, drive via Playwright MCP against running app — **default mobile viewport**, navigate, act, assert expected UI/state, screenshot key step. Check console errors. Google OAuth: click "Sign in with Google" once (on-device Chrome session auto-logs in). Manage dev server lifecycle self: start before, `npm run stop` + quit Chrome after — every run, no leftovers.
4. Pick methods fit task (backend/socket-only change → smoke + API/socket check; UI change → Playwright). Run smallest reproducer for specific feature.
5. Failed check ≠ done. Fix root cause, re-run. Repeated failure → stop, surface (stuck-loop rule).

## Phase 3 — Docs self-heal

Implementation changed anything significant (new endpoint, new Socket.io event, new env var, new DB key, new convention, new biz rule) → update root `CLAUDE.md` to match reality — short, clean, caveman-tight. Commit doc updates. Also consider updating `specify.md` and `implement.md` if things changed, same manner as `CLAUDE.md`.

## Phase 4 — Ship

1. Final commit any remaining changes.
2. `git push -u origin <branch>`.
3. Output (do **not** open PR) ready-to-paste **PR title** + **PR description**. No template in repo → use: short summary, bullet list changes, verification results (method + pass/fail). Imperative subject, no AI footer.

## Final report

Summarize: branch, commits made, what verified (method + result), doc changes, PR title/description block. State plainly what passed, what (if anything) still open.