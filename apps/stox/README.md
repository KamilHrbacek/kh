# apps/stox — portfolio + market-signal app

Static dashboard for **https://stox.kh.group/**. Cloudflare Pages project **`kh-stox`**.

## Status
Live with **mock data** and **`noindex`** (private preview). **Phase A done:** the frontend now
reads its data from `/api/*` (Cloudflare Pages Functions) instead of inline constants — going live
later is one adapter-swap per endpoint, no frontend change. Cloudflare Access + live data feeds are
Phase B/C. Contract + roadmap: `../../reference/stox-handoff/`. Design polish is owner-driven; don't
restyle without a heads-up.

## Files
- `index.html` — the dashboard (`<script type="module">`); on load it fetches `/api/*` once
  (top-level await) and adapts the responses to the shapes the UI renders.
- `functions/api/[[route]].js` — the mock API (Pages Functions): `/me /portfolios /holdings /fx
  /yields /watchlist /news /signals /recommendations /sources`. Swap a handler body for a real
  adapter (bank export, Yahoo Finance, FX, AI engine) to go live; the frontend stays put.
- `favicon-stox.svg` — gold `#c9a24a` KH mark; `favicon.svg` — fallback.
- `assets/`, `maps/` — gold textures + the map SVG.

## Deploy
Push `apps/stox/**` to `main` → CI builds `kh-stox` → stox.kh.group. The subdomain's DNS
CNAME is added by hand (human-gated), not by CI.

## Footguns
- It's **mock data** — the numbers aren't real until the backend (handoff Phase A/B) lands.
- `noindex` is deliberate; keep it until the app is public.
