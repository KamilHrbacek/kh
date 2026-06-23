# Changelog

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
