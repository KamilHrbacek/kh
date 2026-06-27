# Changelog

## 2026-06-27 07:36 UTC
- stox B2 (holdings filter universes) — **live holdings payloads now grow/shrink the currency &
  region filter chips.** Previously `FCCYS`/`FREGS` were `const`, snapshotted from the inline rows
  at init, so a live `/api/holdings` payload introducing a NEW currency or region propagated into
  the table and totals but never gained a filter chip. Added `rebuildFilterUniverses()`, called
  inside `recomputeFX()` before `buildChips()`: it rebuilds both universes from the current rows
  **stably** — keeps existing chip order, drops the gone, appends the new — so the common no-op
  payload reorders nothing; and if the active filter's value is no longer present it falls back to
  `ALL` (else a removed-currency payload would hide every row behind a dead chip). The chip label
  now guards an unknown currency symbol (`SYM[c]||''`) so a new currency renders as plain code, not
  `undefined`. Fail-safe unchanged: the rebuild only runs on the recompute path, which fires solely
  on a well-formed, materially-different payload — malformed/empty/identical/404/HTML still keep the
  inline universe untouched. Verified across 7 checks (4 jsdom integration: new ccy GBP + region UK
  → chips appear with no `undefined`, page intact, 0 errors; single-currency payload → universe
  shrinks to that one; malformed and empty → inline retained, page never blanks. 3 unit over the
  real function source: active CCY/region removed → filter resets to ALL; new currency appended with
  stable order + active filter preserved). Completes the follow-up flagged in the 04:40 entry; the
  holdings live path is now whole-app complete (totals, table, base column, books, chart/donuts,
  and now filters).

## 2026-06-27 04:40 UTC
- stox B2 (second live domain) — **live holdings now flow on screen.** Wired `/api/holdings?pf=<name>`
  through the same fail-safe `khLive()` overlay + whole-app recompute that FX uses: on a well-formed,
  materially-different payload for the active portfolio we map the API objects back to the inline tuple
  shape, mutate the active portfolio array `H` in place, then call `recomputeFX()` so live positions
  propagate to header totals, the holdings table, the base-currency column and the books summary (and,
  guarded, the hero chart + donuts). Fail-safe by construction: an empty, malformed (bad/≤0 value, bad
  return/day, missing sym), identical (mock-fallback), 404 or SPA-HTML response triggers no recompute and
  the inline positions stay on screen. Verified in jsdom across five paths (live +10% → re-render
  547,358→602,093 base USD; identical / 404 / html / malformed → inline retained, 0 errors, page never
  blanks). Known follow-up: the currency/region filter universes (FCCYS/FREGS) are snapshotted at init,
  so a payload introducing a NEW currency/region won't add a filter chip yet — rebuilding those is the
  next holdings step. Today's payload matches inline, so this is a no-op live and a proven path for the
  bank-export adapter to light up.

## 2026-06-27 01:47 UTC
- stox B2 (frontend) — **live FX now flows on screen.** Wired `/api/fx` through the fail-safe
  `khLive()` overlay with a whole-app recompute: holdings derivation is now a re-callable
  `computeHoldings()`, the holdings table a re-callable `renderHoldTable()`, and a new
  `recomputeFX()` mutates `FX` in place then re-renders header totals, holdings table, base-currency
  column, books summary, the hero chart and (if open) the composition donuts. Fail-safe by
  construction: the live handler recomputes **only** on a valid, materially-different payload —
  a malformed, identical (mock-fallback), 404, or SPA-HTML response triggers no recompute and the
  inline base rates stay on screen. Verified in jsdom across five paths (live → re-render
  547,358→557,094 base; identical / html / 404 / bad-rates → inline retained, 0 errors, page never
  blanks). News stays wired; FX is the first live data domain visibly flowing. Next B2 step: wire
  holdings off `/api/holdings` through the same recompute path.

## 2026-06-26 22:52 UTC
- stox B2 (start) — `/api/fx` now returns **live ECB rates** via Frankfurter (no key), fetched
  server-side in the Pages Function and edge-cached ~1h, with a **fall back to the mock rates** on
  any error (`source: frankfurter | mock-fallback` in the payload). Backend-only: the frontend still
  reads inline FX, so the dashboard is visually unchanged and never at risk — next B2 step wires FX
  through the `khLive()` overlay (with a re-callable dashboard refresh) so live rates actually flow.
- Also: this cowork (`kh.group:cowork`) onboarded to the agent-bus DNA — see `CLAUDE.md` "Layer 0".

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
