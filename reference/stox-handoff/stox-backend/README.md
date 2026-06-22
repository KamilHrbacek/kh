# STOX — backend scaffold (Cloudflare)

Status today: **the dashboard runs fully on deterministic mock data and needs no backend to demo.**
This scaffold defines the contract so cowork can wire live data one endpoint at a time. The frontend
already has the slots — swapping mock → live is a single `fetch` per domain.

## Architecture (recommended)
- **Cloudflare Pages** serves the static dashboard (stox.kh.group).
- **Pages Functions / Worker** (`worker.js`) exposes a small JSON API under `/api/*`.
- **Cloudflare Access** gates the whole app + per-portfolio scope (owner / advisor / read-only).
- Data adapters (bank export, Yahoo Finance, FX, e-mail newsletters, Perplexity) live behind the Worker,
  so the frontend never talks to third parties directly and no keys ship to the browser.

## API contract (shapes the frontend already expects)
GET `/api/me`                        → { user, role:'owner|advisor|readonly', portfolios:[id] }
GET `/api/portfolios`                → [{ id, name }]
GET `/api/holdings?pf=KH`            → [{ sym,name,type,region,ccy,value,returnPct,dayPct }]
GET `/api/fx`                        → { EUR:1, USD:.92, JPY:.0062, CZK:.040, asOf }
GET `/api/history?sym=JQUA&tf=1Y`    → [{ t:ISODate, v:Number }]   // native ccy
GET `/api/dividends?pf=KH`           → [{ sym, yieldPct, received:[{date,amount,ccy}] }]
GET `/api/advisor?sector=All`        → [{ act,sym,sector,conviction,rationale,sources:[[name,weight,lean]] }]
GET `/api/sources`                   → [{ name, weight, status:'live|lagging|down', lastUpdate }]
GET `/api/watchlist?pf=KH`           → [{ sym,name,region,ccy,entry,last,flaggedAt }]
POST `/api/watchlist`  body {sym,…}  → 201
GET `/api/lots?sym=JQUA&pf=KH`       → [{ date, action:'buy|add|sell', amount, ccy }]   // real cost basis
GET `/api/settings?pf=KH`            → { feePct, tags:{sector:0|1|2}, sources:{name:weight} }
PUT `/api/settings?pf=KH`            → 200

All money values are in the holding's **native currency**; the frontend converts via `/api/fx`.
Returns/percentages are trailing unless a forward field is explicitly named.

## What each domain needs from the owner (to go live)
- **holdings / lots** → real positions + buy/add/sell history (replaces synthetic cost basis & contributions).
- **fx / history / dividends** → a market-data source (bank export format, Yahoo Finance, an FX feed).
- **advisor / sources** → the AI engine (reads newsletters from e-mail, Perplexity, …) writing recommendations
  in the `/api/advisor` shape; the Gemini "gem" can post here too.
- **me / portfolios / access** → Cloudflare Access rules: which e-mail sees which portfolio(s) and role.

## State if NO new data/connectors arrive
- Dashboard stays a complete, self-contained prototype on mock data. Nothing breaks.
- `worker.js` here returns the same mock shapes, so you can stand the API up empty and the frontend
  behaves identically — then replace each handler's body with a real adapter when data is ready.
- No secrets in the client. No hard dependency on any third party until you choose to wire one.
