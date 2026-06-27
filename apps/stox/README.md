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
  via `recomputeFX()`), **`/holdings`** (B2 — live positions for the active portfolio mutate `H`
  in place then run the same `recomputeFX()`; mock today, a bank-export adapter later) and
  **`/signals`** (B2 — the AI signal-strength meters; `renderSignals()` re-renders only that section,
  like news; mock today, the signal engine later) and **`/advisor`** (B2 — the AI recommendation
  cards; `renderRecs()` re-renders only the cards + their sector filter, never the money path; the
  filter universe is rebuilt from the live rows so a new sector grows a chip and a dropped one falls
  back to **All**, with the active sector preserved; buy-list picks survive; mock today, the AI engine
  later). Other domains still read inline until wired; swap
  a handler body for a real adapter (bank export, Yahoo Finance, AI engine) then point its `khLive()`
  at it. The holdings currency/region filter universes are
  rebuilt from the live rows inside `recomputeFX()` (`rebuildFilterUniverses()`), so a payload that
  introduces a new currency/region grows its filter chip and one that drops it loses the chip (an
  active filter whose value disappears falls back to **All**).
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
