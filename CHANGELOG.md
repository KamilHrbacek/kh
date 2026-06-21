# Changelog

Newest first. UTC timestamps.

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
