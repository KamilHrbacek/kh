# apps/stox — portfolio + market-signal app

`stox.kh.group`. A Cloudflare Worker app. Two intertwined goals:

1. **Portfolio overview** — a better view over KH's holdings (mostly ETFs) than the
   bank tools / iPhone widget give: positions, performance, charts, a notes space,
   room for future strategies.
2. **Public-statement → market-reaction analysis** — capture public statements,
   correlate them with how named ETFs / stocks move, surface which instruments react
   best to what.

Status: **placeholder**. Design first (see `docs/architecture.md` → stox data layer):
- market/price data source (API),
- statements feed (the fragile part — Truth Social / X ingestion),
- storage (D1?), charts, notes.

No `wrangler.toml` yet — added when the Worker is wired (name TODO, e.g. `kh-stox`,
custom domain `stox.kh.group`).
