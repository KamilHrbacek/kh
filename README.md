# kh

KH Group umbrella monorepo — everything under the **kh.group** brand, one repo,
one deployable per `apps/` folder, built from git by Cloudflare.

| Path | What | Target |
|---|---|---|
| `apps/www` | kh.group website | kh.group (CF Pages: `kh-www`) |
| `apps/stox` | portfolio + market-signal app | stox.kh.group (CF Pages: `kh-stox`) — mock data, noindex |
| `apps/brandmanual` | private brand manual (PIN-gated) | brandmanual.kh.group (CF Pages: `kh-brandmanual`) — noindex |
| `packages/` | shared code (brand, ui, auth) | — not deployed |
| `scripts/`, `docs/`, `reference/` | ops, design, archived handoffs | — |

Planned: `apps/vcards`. Each `apps/<name>` has its own README (`apps/README.md` is the index).

See `CLAUDE.md` for the convention and `docs/architecture.md` for the rationale.
Push to `main` → Cloudflare rebuilds the changed app(s) only (path-scoped CI).
