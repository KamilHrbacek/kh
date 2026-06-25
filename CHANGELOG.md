# Changelog

## 2026-06-25 17:12 UTC
- stox B1 (fail-safe live-data overlay): added a non-blocking `khLive(name, path, apply)` helper at
  the end of `index.html`. Inline data still renders synchronously and is the always-on base; per
  domain we may upgrade to `/api` and re-render just that section, but ANY failure — 404, network,
  or the SPA-HTML fallback (caught by a `content-type` guard) — silently keeps inline. No top-level
  await, no hard `/api` dependency, so the Phase-A blank cannot recur. Wired the **news** domain
  through it as the proof (mock-identical today). Verified in jsdom across three paths: api-up →
  live re-render; api-404 and api-returns-HTML → inline retained; the page never blanks. FX/holdings
  are deliberately NOT wired yet — they feed the whole dashboard and need a fuller refresh (B2).

## 2026-06-25 16:51 UTC
- stox B0 (deploy fix): kh-stox was serving `/api/*` as the SPA, not as Pages Functions — root
  cause of the Phase A blank. The deploy ran `wrangler pages deploy apps/stox` from the repo root;
  wrangler compiles `functions/` only when it's in the **CWD**, so `functions/api/[[route]].js` was
  uploaded as a static file (run #44 log: "Uploaded 2 files", no "Compiled Worker"). Fix: the stox
  deploy step now uses `working-directory: apps/stox` + `wrangler pages deploy .`, so `./functions`
  is found and compiled. Verify: `stox.kh.group/api/health` returns JSON. (Frontend still on inline
  data — this only makes the `/api` scaffold actually reachable for Phase B.)

## 2026-06-25 16:13 UTC
- stox Phase A (revised): added the `/api/*` scaffold — Cloudflare Pages Functions
  (`apps/stox/functions/api/[[route]].js`) returning today's mock data (`/me /portfolios /holdings
  /fx /yields /watchlist /news /signals /recommendations` + `/advisor` alias `/sources`), ready to
  swap to live adapters one endpoint at a time. **Frontend kept on its inline data** — it's partly
  REAL and is the base we keep.
- Reverted an over-eager cutover: index.html had been turned into a `type="module"` that fetched
  `/api` via top-level await. When the deployed Pages Functions weren't served, the failed
  top-level await killed the module and left the whole dashboard **blank**. Restored the inline
  data (synchronous render, always works offline).
- Plan (Phase B): layer live sources in **per-domain** with the inline data as fallback, and only
  retire the mock once enough live sources exist — never a hard all-or-nothing dependency on `/api`.

## Lesson
Don't make a working UI hard-depend on a not-yet-served backend. A `<script type="module">` whose
top-level `await fetch()` rejects renders NOTHING — one missing endpoint blanks the page. Keep the
inline/last-good data as the base and treat live data as a per-domain enhancement with fallback.

## 2026-06-23 16:31 UTC
- Docs/idiot-proofing: added READMEs for apps/www, apps/stox, apps/brandmanual + index READMEs (apps/, docs/, reference/). Corrected CLAUDE.md + root README to reality: brandmanual is live (not planned), stox is CF Pages not a Worker, project names kh-www/kh-stox/kh-brandmanual, www→apex is a CF zone Redirect Rule, secrets-vault note added.


Newest first. UTC timestamps.

## 2026-06-22 — kh.group LIVE (apps/www on Cloudflare Pages)
- apps/www is now the claude-design kh.group site v1 (single index.html + world-dots.svg,
  zero-build); the Webflow import is retired to git history + reference/.
- Automatic git→CF deploy: push apps/www → GitHub Actions → CF Pages project `kh-www`
  (auto-created) → custom domains kh.group + www attached via the CF API.
- Security model: the CI/deploy token is **DNS-less** (Cloudflare Pages + Workers +
  Workers Routes + Zone:Read). DNS — the highest blast-radius surface (MX/email) — is a
  deliberate, human-gated action and is NEVER done from CI. The apex + www CNAMEs to
  kh-www.pages.dev were added by hand.
- www → apex 301 via apps/www/_redirects. kh-group.eu and its Google Workspace email
  were not touched.
- Pending: mobile polish (with design); brand manual at brandmanual.kh.group (noindex);
  stox engine (awaiting design's face).

## 2026-06-21 — imported kh-group.eu site into apps/www
- Imported the Webflow export from the `www-kh-group` repo into `apps/www`
  (index.html, assets/, _headers, _redirects, robots/sitemap/llms/manifest) — the
  faithful current kh-group.eu site, now the baseline for kh.group.
- Kept the original Webflow source + old repo notes (not deployed) in
  `reference/kh-group-webflow/` for the editable rebuild.
- Next: rebuild into an editable site, rewrite kh-group.eu → kh.group everywhere,
  wire CF Pages + attach the domain. Old `www-kh-group` to be archived (local →
  `~/Projects/archive`) + its GitHub repo marked archived once this is confirmed up.

## 2026-06-21 — repo scaffolded
- Created the `kh` umbrella monorepo: `apps/{www,stox}`, `packages/`, `scripts/`,
  `docs/`, path-scoped `deploy.yml` (skeleton, CF identifiers TODO).
- `apps/www` placeholder for kh.group; `apps/stox` placeholder for the portfolio +
  public-statement / market-reaction analysis app.
- Convention documented in `CLAUDE.md` + `docs/architecture.md`.
- Pending: choose reusable cowork git-push mechanism (`docs/git-push.md`); create CF
  Pages project + Worker + zone; seed `apps/www`; design the stox data layer.
