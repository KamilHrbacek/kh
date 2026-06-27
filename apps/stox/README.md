# apps/stox — portfolio + market-signal app

Static dashboard for **https://stox.kh.group/**. Cloudflare Pages project **`kh-stox`**.

## Status
Live with **mock data** and **`noindex`** (private preview). An `/api/*` scaffold is in place
(`functions/api/[[route]].js`, mock today) for wiring live data later — but the **frontend still
runs on its inline data** (partly real; it's the base we keep). Phase B layers live sources in
**per-domain** with inline fallback, retiring mock only once enough live sources exist (never an
all-or-nothing dependency on `/api`). Contract + roadmap: `../../reference/stox-handoff/`. Design
polish is owner-driven; don't restyle without a heads-up.

## Files
- `index.html` — the dashboard; data is **inline** (mock + some real), rendered synchronously.
- `functions/api/[[route]].js` — the `/api/*` scaffold (Pages Functions) returning the same mock
  shapes: `/me /portfolios /holdings /fx /yields /watchlist /news /signals /recommendations
  /sources`. Wired into the frontend **per domain** via the fail-safe `khLive()` overlay (inline
  data is always the base; a live `/api` upgrade re-renders a section on success, any failure keeps
  inline). Live so far: **`/news`** (B1), **`/fx`** (B2 — live ECB rates drive a whole-app recompute
  via `recomputeFX()`) and **`/holdings`** (B2 — live positions for the active portfolio mutate `H`
  in place then run the same `recomputeFX()`; mock today, a bank-export adapter later). Other domains
  still read inline until wired; swap a handler body for a real adapter (bank export, Yahoo Finance,
  AI engine) then point its `khLive()` at it. Note: the holdings currency/region filter universes are
  snapshotted at init — a live payload with a new currency/region won't add a filter chip until that
  rebuild lands (next holdings step).
- `favicon-stox.svg` — gold `#c9a24a` KH mark; `favicon.svg` — fallback.
- `assets/`, `maps/` — gold textures + the map SVG.

## Deploy
Push `apps/stox/**` to `main` → CI builds `kh-stox` → stox.kh.group. The subdomain's DNS
CNAME is added by hand (human-gated), not by CI.

**Pages Functions gotcha:** the deploy step runs `wrangler pages deploy .` **from inside
`apps/stox`** (`working-directory: apps/stox`). Wrangler compiles `functions/` only when it sits
in the CWD — deploying `apps/stox` from the repo root uploads `functions/` as static files and
`/api/*` then 404s to the SPA. Keep the `working-directory`. (Verify after deploy:
`stox.kh.group/api/health` must return JSON, not the dashboard HTML.)

## Footguns
- It's **mock data** — the numbers aren't real until the backend (handoff Phase A/B) lands.
- `noindex` is deliberate; keep it until the app is public.
