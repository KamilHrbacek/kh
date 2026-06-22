# STOX — handoff for cowork

A private, dark, luxury-styled portfolio dashboard for KH Group. This package is everything needed
to start building. **It runs as-is on mock data** — open `index.html`, nothing else required.

## What's in the box
- `index.html` — the whole STOX dashboard (single file: Portfolio, Watchlist, Advisor, Settings,
  plus Composition / Flow / FX risk / Income / Map modals and the Model-a-mix tools).
- `maps/c-sirlisko.svg` — the world map (CC0), fetched at runtime by the Map modal. **Keep the path.**
- `favicon.svg` — KH mark (auto-recolours light/dark). **TODO: wire it** (see below).
- `stox-backend/` — Cloudflare Worker scaffold + API contract + sample data (read its README).
- `STOX - notes for cowork & roadmap.md` — full inventory: done / blocked / data needed.

## Run / deploy
- Static site, no build step. Serve the folder; `index.html` must sit next to `maps/`.
- Fonts load from Google Fonts CDN (Titillium Web + DM Mono).
- Recommended host: Cloudflare Pages (then add the Worker in `stox-backend/` under `/api/*`).

## TODO for cowork — in priority order
1. **Wire live data** (the only thing standing between this and production). Replace the inline mock
   in `index.html` with `fetch` calls to the API in `stox-backend/` — one domain at a time:
   holdings → fx → history → dividends → advisor/sources. Shapes already match; see backend README.
   Search `index.html` for `const PORTFOLIOS`, `const FX`, `priceFrom(`, `RECS`, `YIELD` — those are
   the mock sources to swap.
2. **Favicon**: add to `<head>` of `index.html`:
   `<link rel="icon" href="favicon.svg" type="image/svg+xml">` (file is included).
3. **Mobile audit**: the layout is responsive (breakpoints at 880/620px — tabs collapse, tables
   reflow, grids stack), BUT it was designed desktop-first and the modals (Map, Flow, Composition,
   Model-a-mix) are wide — **test every modal on a phone** and tighten: modal padding, the wide
   sankey/map SVGs (let them scroll-x or scale), the hero number clamp, and the timeframe/pill rows.
   This is the main hands-on polish pass.
4. **Cloudflare Access**: gate the app; per-portfolio scope (owner / advisor / read-only). The
   portfolio switcher + roles UI are previews — real auth is CF. See backend README `/api/me`.
5. **AI source engine** (the differentiator): feed Advisor/Settings from the real reader (newsletters,
   Perplexity, the Gemini "gem"). Frontend hooks (recommendations, watchlist chips, Add-idea hint,
   source weights) are all in place and read the `/api/advisor` + `/api/sources` shapes.

## What is REAL vs MOCK (so you don't chase ghosts)
- REAL (owner-provided): the 12 KH holdings (native value, currency, total-return %), watchlist tickers.
- MOCK (replace): FX rates, intraday %, ALL price-history curves & sparklines, per-title lots/contributions,
  dividends, watchlist entry prices, advisor calls & sources. All deterministic — safe to demo.

## Design notes (keep the look consistent)
- Palette: deep warm black, brushed-gold accents, green/red for gain/loss (conventions, not decoration).
- Type: Titillium Web (UI) + DM Mono (numbers/labels). Machined top-right corner radius is the motif.
- Currency: locale-aware via `cur(amount, ccy)` (cs-CZ Kč, ja-JP ¥, en-US $, de-DE €). Use it for any
  new money string — don't hand-concatenate symbols.
- Lockup: KH logo + `|` + `STOX` (gold X). Keep it.
