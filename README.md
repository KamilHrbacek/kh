# kh

KH Group umbrella monorepo — everything under the **kh.group** brand, one repo,
one deployable per `apps/` folder, built from git by Cloudflare.

| Path | What | Target |
|---|---|---|
| `apps/www` | kh.group website | kh.group (CF Pages) |
| `apps/stox` | portfolio + market-signal app | stox.kh.group (CF Worker) |
| `packages/` | shared code (brand, ui, auth) | — not deployed |
| `scripts/`, `docs/` | ops + design | — |

Planned: `apps/vcards`, `apps/brandmanual`.

See `CLAUDE.md` for the convention and `docs/architecture.md` for the rationale.
Push to `main` → Cloudflare rebuilds the changed app(s) only (path-scoped CI).
