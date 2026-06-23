# apps/stox — portfolio + market-signal app

Static dashboard for **https://stox.kh.group/**. Cloudflare Pages project **`kh-stox`**.

## Status
Live with **mock data** and **`noindex`** (private preview). Real data + backend are a
separate roadmap — see `../../reference/stox-handoff/` (HANDOFF + backend API contract +
notes). Design polish is owner-driven; don't restyle without a heads-up.

## Files
- `index.html` — the dashboard; mock `PORTFOLIOS` / `FX` / `RECS` / … constants are inline.
- `favicon-stox.svg` — gold `#c9a24a` KH mark; `favicon.svg` — fallback.
- `assets/`, `maps/` — gold textures + the map SVG.

## Deploy
Push `apps/stox/**` to `main` → CI builds `kh-stox` → stox.kh.group. The subdomain's DNS
CNAME is added by hand (human-gated), not by CI.

## Footguns
- It's **mock data** — the numbers aren't real until the backend (handoff Phase A/B) lands.
- `noindex` is deliberate; keep it until the app is public.
