# Canonical Summary — kh.group cowork (read this first)

*UTC 2026-06-30T09:02:33Z · author `kh.group:cowork` · confidence: HIGH on stox/CI, MEDIUM on access/RBAC boundary.*

## What this cowork owns
The **kh.group umbrella** (repo `KamilHrbacek/kh`): three static Cloudflare-Pages apps —
`apps/www` → kh.group, `apps/stox` → stox.kh.group, `apps/brandmanual` → brandmanual.kh.group.
Plus co-stewardship of the shared **kh-cowork** toolkit (cowork-push, secrets-vault, …) used by
the whole ecosystem.

## Current status (evidence: `kh/CHANGELOG.md`, git log to 2026-06-28, live fetches)
- **STOX is the active workstream and is in good shape.** It is a single-file dashboard
  (`apps/stox/index.html`) whose inline data is the always-on base, with a fail-safe **`khLive()`
  overlay** that upgrades each domain from `/api/*` (Cloudflare Pages Functions,
  `apps/stox/functions/api/[[route]].js`) and silently falls back to inline on any failure.
  **All 8 data domains are now wired:** news, fx, holdings, signals, advisor, yields, watchlist,
  sources (commits `2498cba`→`5e72a31`).
- **Live data:** `/api/fx` returns real ECB rates (Frankfurter, edge-cached, mock fallback) and
  flows on-screen via a whole-app recompute (`recomputeFX`). Other domains return mock today;
  going live = swap one handler body, frontend unchanged.
- **`kh-stox` D1 created** (`4f6c5ca8-46a3-…`, EEUR) with an `fx_rates` číselník (rate register:
  `date,source,base,ccy,rate,fetched_at`). **Not yet populated / not yet bound to the Pages
  project** — ČNB+ECB daily upserts are the next concrete step.
- **www / brandmanual:** live (kh.group, brandmanual.kh.group). brandmanual PIN go-live and
  www polish are lower-priority pending items.

## Architecture in one paragraph
Git → Cloudflare. Push to `main` triggers path-scoped GitHub Actions (`.github/workflows/deploy.yml`)
that run `wrangler pages deploy .` **from inside each app dir** (so `functions/` compiles into Pages
Functions — a fix; deploying from repo root uploads functions as static files and `/api` 404s).
DNS is human-gated and never touches kh-group.eu MX. STOX adds a D1 (`kh-stox`) and calls one
external API (Frankfurter) server-side. Coordination runs over the agent-bus D1; pushes from the
sandbox use the `cowork-push` skill (off-mount, big-repo-safe).

## Major risks (full list in risks-and-debt.md)
1. **stox.kh.group is NOT access-gated** — only `noindex`, i.e. publicly reachable while serving
   REAL holdings/values. KH-RBAC manifest is drafted; the CF Access apply is a KH hard-gate, pending.
2. **No per-ticket preview URLs exist** — CI deploys `main` only, so `ticket-NNN` branches never
   deploy; the review-at-a-URL gate is structurally broken (raised on bus, id 269; matches board
   ticket 030 "branch previews are gone").
3. **Single-file `apps/stox/index.html` (~1450 lines)** is a one-piece app — high blast radius;
   a top-level-await mistake once blanked the whole page (see academy-candidates.md).
4. **`drain-my-lane` cron ≠ continuous** — only fires every 3h AND only while the desktop app is
   open + awake. Overnight progress depends on the machine staying awake (Amphetamine).

## Recommended next actions (priority order)
1. **Gate stox** via KH-RBAC + CF Access (KH hard-gate) — close the public-exposure of real data.
2. **Populate the fx_rates číselník:** wire ČNB (+ ECB) daily upserts into `kh-stox` D1; bind D1 to
   the kh-stox Pages project; have `/api/fx` read latest-from-D1 (fallback live→mock).
3. **Fix per-ticket previews** (team/architecture; raised on bus): CI should deploy non-main
   branches as CF Pages previews. Standardise via kh-cowork/cf-app-deploy, not 21 hand-edits.
4. **Per-portfolio authZ:** `members(email→role→portfolios)` table in `kh-stox`, read from the
   `CF-Access-Authenticated-User-Email` header (owner=all, wife=Monika, banker=read-only).
