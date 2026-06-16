---
description: Research a feature/task and write a plan to .claude/CURRENT.md
argument-hint: <explain what needs to be done!>
---

# /specify — produce the plan

Task to specify: **$ARGUMENTS**

You are in SDD specify phase. Goal: research the codebase, produce an accurate, actionable plan in `.claude/CURRENT.md`. **Research + Plan only. No code modifications.**

Project = Express + Socket.io backend (`server.js`), raw JS/HTML frontend (`public/`), flat-JSON DB (`db.js` + `data/db.json`). No bundler, no build step, no tests. Biome v2 for lint/format. Read `CLAUDE.md` (root) for full architecture + business rules before planning.

## 1. Research

Scope research to the task. For a wide/unfamiliar surface, spawn a subagent (Agent) so main context stays clean; report only conclusions.

- Locate every file the task touches:
  - **Backend**: `server.js` (Express routes, Socket.io handlers, cron, session/auth), `routes/api.js` (REST under `/api`), `routes/tours.js` (`TOURS` config + `TOTAL_SEATS`), `db.js` (read/write helpers).
  - **Frontend**: `public/js/app.js` (single large file, all UI logic + Socket.io client + tabs), `public/index.html`, `public/login.html`, `public/css/`, `public/sw.js` (service worker / push).
- Identify the DB shape touched in `data/db.json` (`reservations`, `pushSubscriptions`, `messages`). No migrations — note any new keys + whether `data/db.example.json` needs the same shape.
- Note Socket.io events involved (auth gating in `io.use`, driver-only events, `joinTour`/location). Cite `file:line`.
- Note existing patterns to mirror (cite `file:line`). Find the closest existing slice and follow it.
- If a library detail is uncertain, pull current docs via WebFetch/WebSearch. ⊥ guess APIs.
- Flag anything that conflicts with the business rules or workflow rules in `CLAUDE.md`.

## 2. Resolve unknowns

If something is genuinely ambiguous and changes the approach, ask the user sharp questions before writing the plan. Otherwise pick the obvious option and record the assumption.

## 3. Write `.claude/CURRENT.md`

Overwrite the file (it may hold a stale plan). Caveman style (per session caveman mode): drop articles/filler, fragments OK, but keep every technical fact, path, and identifier. Preserve code/JSON/identifiers verbatim. Use this shape:

```
# CURRENT — <task title>

## Goal
<1-3 lines: what + why>

## Context (cite file:line)
- <existing pattern / constraint / related slice>

## Affected
- BE: <server.js sections / routes/*.js>
- FE: <public/js/app.js sections / html / css / sw.js>
- DB: <data/db.json keys touched; data/db.example.json update? y/n>
- Socket.io: <events added/changed; auth gating>

## Plan (ordered)
1. <step> → <file>
2. ...

## Contracts
- api: <METHOD /api/path> → <status> <resp shape>
- socket: <event> → <payload> (auth: any | driver-only)
- db shape changes

## Invariants (V)
V1: <must-hold rule>

## Verify
- npm run lint + npm run format clean
- smoke: /health, app boots
- Playwright (mobile viewport) targets for the user flow

## Open questions / assumptions
- <only if any>
```

## 4. Report

Print a 3-5 line summary + the planned step count. Tell user to review `.claude/CURRENT.md`, then run `/implement`.
