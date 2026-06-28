# Changelog

## 2026-06-28 07:39 UTC
- stox B2 — **wired `/api/sources` through the fail-safe `khLive()` overlay (8th and final live
  data domain**, after news/fx/holdings/signals/advisor/yields/watchlist — every data domain now
  flows through the overlay). The Settings data-sources mixer (the catalogue of feeds the AI weighs
  and the user can tune) now upgrades from a live `[{name,weight,status,lastUpdate}]` payload. The
  apply is deliberately **additive**: a live feed the user does not already have is introduced into
  `SET.sources` at its catalogue weight, but an existing feed's weight is **never overwritten** and
  a feed absent from the live payload is **never removed** — so a live refresh can grow the mixer
  (a genuinely new source lights up) yet can never clobber the user's tuning or drop a feed they
  rely on (a user-set "off"/0 weight stays off). Touches only its own surface (`renderSet()`), never
  the money path. Today's mock is a subset of the inline catalogue, so the live path is a visual
  no-op and a proven hook for the source registry to light up by swapping the `/sources` handler
  body. Surfacing feed health/`status` in the mixer UI is a separate (non-no-op) increment, left for
  later. Frontend-only (`apps/stox/index.html`); build stamp `2026.06.28-2`; `node --check` clean;
  17-case unit test of the apply (no-op subset / empty / non-array / bad-row-rejects-all /
  out-of-range + negative reject / new-feed-add + round / existing-preserved / absent-not-removed /
  user-off-stays-off) all green.

## 2026-06-28 04:35 UTC
- stox B2 — **wired `/api/watchlist` through the fail-safe `khLive()` overlay (7th live data domain**,
  after news/fx/holdings/signals/advisor/yields). The sandbox watchlist (flagged-but-unbought ideas
  and what they would have done) now upgrades from a live
  `[{sym,name,region,ccy,weeksAgo,entry,last,notional,dayPct}]` payload: a well-formed, materially-
  different payload rebuilds the `wrows` model in place and `renderWatch()`s, while an empty,
  malformed (bad row, non-finite/non-positive price, unknown currency), identical (mock-fallback),
  404 or SPA-HTML response changes nothing and the inline ideas stay on screen. Ticks (`selW`) are
  preserved for surviving symbols and brand-new ideas default to selected, so a live refresh never
  strands the user's selection. Reads FX for the would-be P/L but never writes the money path. Mock
  today matches inline, so the live path is a visual no-op and a proven hook for a real watchlist
  store (D1/KV — the `POST /watchlist` already stubs persistence) to light up by swapping the
  `/watchlist` handler body. Only `/sources` (metadata) now reads inline unwired. Frontend-only
  (`apps/stox/index.html`); build stamp `2026.06.28-1`; `node --check` clean; 13-case unit test of
  the apply (no-op/empty/bad-price/unknown-ccy reject, materially-different rebuild, tick-preservation
  across deselect + new idea) all green.

## 2026-06-27 19:39 UTC
- stox B2 — **wired `/api/yields` through the fail-safe `khLive()` overlay (6th live data domain**,
  after news/fx/holdings/signals/advisor). The per-holding dividend yields behind the Income modal
  now upgrade from a live `{ sym: yield% }` payload: a well-formed, materially-different payload
  replaces the inline `YIELD` map in place (so the next Income-modal open reads live yields; if the
  modal is already open it re-renders live), while an empty, malformed (non-object, negative or
  out-of-range yield), identical (mock-fallback), 404 or SPA-HTML response changes nothing and the
  inline yields stay on screen. Touches only its own surface (the Income modal), never the money
  path — yields carry no currency. Mock today matches inline, so the live path is a visual no-op and
  a proven hook for the dividend feed (bank export) to light up by swapping the `/yields` handler
  body. Frontend-only (`apps/stox/index.html`); `node --check` clean.

## 2026-06-27 16:40 UTC
- stox access onboarding — **drafted the canonical KH-RBAC manifest for stox.kh.group.**
  Added `reference/stox-handoff/access-requirements.yaml` (schema v1.1), the layer-3 source KH-RBAC
  has been waiting on (bus id263 → id306 opened a `from-stox/` slot → this delivers). Kept in the
  non-deployed `reference/` dir, not `apps/stox/`: the stox Pages deploy uploads everything under
  `apps/stox/`, so a manifest there would be served publicly and leak the owner emails (PII hard-rule). stox serves real
  portfolio holdings yet is `noindex`-only (publicly reachable today); the manifest closes that gap
  by declaring a single coarse gate: group **`stox-owner`** (`kh@kh-group.eu`, `kamil@hrbacek.net`,
  `kamil.hrbacek@gmail.com`) → ALLOW on the whole host `stox.kh.group/*` (SPA + `/api/*`), interim
  auth **Stay-on-PIN** (email OTP, ADR-0007 B3). No anonymous role — unlike Academy, stox has no
  public surface, so one host-level gate is correct (and dodges the 5-destination CF Access ceiling).
  `stox-advisor` (banker, read-only) + `stox-monika` (spouse subset) are declared for planning but
  phase B / no members yet. **Per-portfolio scoping stays app-side** (confirmed id306 Q2): KH-RBAC
  owns coarse "can reach stox at all"; per-row owner=all / Monika=subset / advisor=read-only lives in
  a future `kh-stox` D1 members table keyed on group membership (offboarding-safe), matching
  `identity()` + the HOLDINGS keys. Paths, app-side authZ, constraints (tighten API CORS `*` →
  `https://stox.kh.group` when Access lands), and four open questions for KH (advisor/Monika emails,
  health-endpoint visibility, session duration) all captured. YAML validated (`yaml.safe_load`).
  Updated `apps/stox/README.md` (new Access/gating section). **This is a PROPOSAL** — the live CF
  Access apply (create the group + policy) is a KH hard-gate; no infra touched. Next: ping KH-RBAC
  on the bus that the manifest is ready, then resume stox B2 live domains (`/watchlist` or `/yields`).

## 2026-06-27 13:41 UTC
- stox B2 (fifth live domain) — **the AI recommendation cards now flow through the live overlay.**
  Wired `/api/advisor` through the same fail-safe `khLive()` overlay as news/signals. The advisor
  cards (Add/Buy/Hold/Trim/Watch/Avoid + the per-source conviction breakdown) already had a
  re-callable `renderRecs(sec)`; the new `khLive('advisor', '/advisor', …)` block maps the API's
  `[{act,sym,sector,conviction,rationale,sources:[[name,weight,sign]]}]` back to the inline tuple
  shape, keeps `RECS` canonical (mutated in place so `openCandidate()`'s `RECS.find` stays valid),
  rebuilds the **sector filter universe** from the live rows (a new sector grows a chip; a dropped
  one makes the active filter fall back to **All** so the list can't strand behind a dead chip; the
  active sector is otherwise preserved), and re-renders **only the cards + their filter** — never the
  money/`recomputeFX()` path (recommendations carry no currency). Buy-list picks survive a live
  re-render. Fail-safe by construction: a non-array (e.g. a 404 object), empty, malformed (bad row,
  unknown `act`, conviction outside 0..100, missing `sector`/`rationale`, bad `sources`), identical
  (mock-fallback) or failed payload triggers no re-render and the inline cards stay on screen
  (`khLive` already swallows fetch/JSON errors). Mock matches inline today, so this is a no-op live
  and a proven path for the AI engine to light up. Verified: `node --check` on the full inline script
  (syntax OK) + an 18-case unit test over the apply logic (identical→no churn; live diff→re-render +
  `RECS` replaced + sector preserved; dropped sector→falls back to All; empty/non-array/unknown act/
  conviction>100/conviction<0/empty sector/bad sources×3→inline retained; unknown sign→normalised to
  neutral + render). Bumped the footer build stamp (header + watchlist) `2026.06.27-1 · 10:39 UTC`
  → `2026.06.27-2 · 13:41 UTC`.

## 2026-06-27 10:39 UTC
- stox B2 (fourth live domain) — **AI signal-strength meters now flow through the live overlay.**
  Wired `/api/signals` through the same fail-safe `khLive()` overlay as news: the inline meter
  render is refactored into a re-callable `renderSignals(sig)` (called inline at first paint,
  re-called by the overlay), and a new `khLive('signals', '/signals', …)` block maps the API's
  `[{name,score}]` back to the inline `[name,score]` tuple, keeps `SIG` canonical, and re-renders
  **only the meters** — never the money/recompute path (signals carry no currency). Fail-safe by
  construction: a non-array (e.g. a 404 object), empty, malformed (any row missing `name` or with a
  score outside 0..100), identical (mock-fallback) or failed payload triggers no re-render and the
  inline meters stay on screen (`khLive` already swallows fetch/JSON errors). Mock today matches
  inline, so this is a no-op live and a proven path for the signal engine to light up. Verified:
  `node --check` on the full inline script (syntax OK) + a 10-case unit test over the apply logic
  (identical→no churn; live diff→re-render + `SIG` updated; empty/bad-row/score>100/score<0/
  non-numeric/non-array→inline retained; new engine shape→re-render). Also bumped the stale footer
  build stamp (header + footer) from `2026.06.22-1` to `2026.06.27-1 · 10:39 UTC`.

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
