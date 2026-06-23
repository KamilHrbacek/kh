# apps/ — deployables

One folder per thing Cloudflare builds + serves. A push that touches only `apps/<name>/**`
redeploys **only that app** (path-scoped CI in `.github/workflows/deploy.yml`).

| App | URL | CF Pages project | Status |
|---|---|---|---|
| `www/` | https://kh.group/ | `kh-www` | live |
| `stox/` | https://stox.kh.group/ | `kh-stox` | live — mock data, `noindex` |
| `brandmanual/` | https://brandmanual.kh.group/ | `kh-brandmanual` | live — PIN-gated, `noindex` |

All three are **static Cloudflare Pages** (zero build step). Each folder has its own README.
Planned: `vcards/`.

Rules that bite (details in each README + root `CLAUDE.md`):
- **Deploy only via `git push` to `main`.** Never `wrangler deploy` from a laptop/sandbox.
- **DNS is human-gated.** CI attaches the Pages custom domain but never writes DNS/MX records.
- **Apex `kh.group` is canonical;** `www`→apex is a Cloudflare **zone Redirect Rule**, NOT
  `_redirects` (Pages `_redirects` can't match by hostname).
