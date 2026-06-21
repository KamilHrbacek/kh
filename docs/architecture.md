# Architecture — kh umbrella monorepo

## The one rule

**Repo boundary = brand/domain boundary.** One umbrella repo per product/domain,
not one mega-repo for the whole company, and not one repo per single site.

- `kh` = everything under `kh.group` (this repo).
- `flowsmith` = everything under `flowsmith.online` (its own umbrella repo).
- each future brand = its own umbrella.

Shared code crosses brands only via published `packages/`, never by merging repos.

## Inside an umbrella

Two independent decisions, deliberately kept separate:

1. **Where code lives (layout).**
   - `apps/<name>` — anything Cloudflare deploys. Each owns its deploy boundary
     (own `wrangler.toml` / static dir + its own path-scoped CI job).
   - `packages/<name>` — code consumed by apps (brand tokens, UI, auth/KH-RBAC).
     Not deployed.
   - `scripts/`, `docs/`, `backlog/` at the root.

2. **How it runs / is managed (product).**
   - `apps/www` is the front door — it can link to or embed the other apps and
     their admin surfaces. "Manage everything from the website" is satisfied here,
     at the product layer — it does **not** mean nesting other apps' code inside
     www's folder.

Keeping these two apart is what prevents the layout from drifting as the repo grows.

## Deploy

Git → Cloudflare, path-scoped. A push that touches only `apps/stox/**` deploys only
stox; `apps/www/**` deploys only the site; root/docs/packages changes deploy nothing
(unless a package is wired into an app's build). Pattern mirrors the proven
`flowsmith` repo (GitHub Actions + `dorny/paths-filter`, direct `wrangler` deploy with
explicit project/worker names — no Cloudflare dashboard "root directory" coupling).

## stox — data layer (to design)

stox is more than portfolio tracking: the thesis is "public statements → market
reaction". That needs two feeds designed up front:
1. **Market/price data** — a market-data API (prices, ETF/stock history).
2. **Statements feed** — the public statements to correlate against (the fragile
   part: Truth Social / X ingestion).
Plus charts, a notes space, and a place for future strategies. Design before build.
