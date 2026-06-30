# Current State — kh.group (UTC 2026-06-30T09:02:33Z)

## Live
- **kh.group** (apps/www) — live on Pages `kh-www`, apex-canonical, www→apex redirect rule.
- **brandmanual.kh.group** (apps/brandmanual) — live, `noindex`.
- **stox.kh.group** (apps/stox) — live, `noindex`. `/api/*` Pages Functions ARE served
  (verified: `…/api/health`→`{ok:true,phase:"A (mock)"}`, `…/api/portfolios`→`["KH","Monika"]`,
  `…/api/fx`→ live `{source:"frankfurter",…}`).

## Done (STOX B-series)
- **B0** — fixed CI so Pages Functions actually deploy (`working-directory: apps/stox` +
  `wrangler pages deploy .`). Was the cause of the blank-dashboard outage.
- **B1** — fail-safe `khLive()` overlay: inline base always renders; per-domain live upgrade with
  inline fallback + content-type guard (catches the SPA-HTML 404 case). jsdom-verified (up→live,
  404/HTML→inline, never blanks).
- **B2** — **all 8 data domains wired through khLive():** fx, holdings, signals, advisor, yields,
  watchlist, sources, news (commits `2498cba`…`5e72a31`, builds to `2026.06.28-2`). Live data so far
  = FX (Frankfurter). Each wiring kept the money path untouched and shipped with a node `--check` +
  jsdom unit test.

## Under development / partially complete
- **`kh-stox` D1 + `fx_rates` číselník:** created, EMPTY. ČNB+ECB daily upserts NOT written; D1 NOT
  bound to the kh-stox Pages project; `/api/fx` does NOT yet read from D1 (it live-fetches per
  request). This is the next concrete stox step.
- **Access / per-portfolio:** stox is NOT gated (only noindex). A KH-RBAC manifest is drafted at
  `reference/stox-handoff/access-requirements.yaml` (group `stox-owner` = 3 KH emails, Stay-on-PIN
  interim). The `members(email→role→portfolios)` table + function authZ are designed, not built.

## Known problems / blockers
- **Public exposure of real data** (stox not gated) — blocked on a KH hard-gate (CF Access apply)
  + cross-lane coordination with `kh-rbac:cowork` (bus id 263, awaiting reply).
- **No per-ticket preview URLs** (CI main-only) — raised on the bus (id 269) as an architecture bug
  for the team; awaiting Marschall/peers.
- **`drain-my-lane` is not continuous** — fires every 3h only while the desktop app is open/awake.

## Recent changes (evidence: kh git log, newest first)
`5e72a31` sources→overlay (8th, final) · `39261f5` watchlist · `c8ff647` yields · `2dfa3f7` stox
KH-RBAC manifest draft · `4baf6b9` advisor · `b726bb3` signals · `9d51667` holdings filter
universes · `8bd9645` holdings · `67bf39e` live FX recompute · `2498cba` FX backend + onboarding.

## Pending reviews
- Per the team workflow, stox work would land via `ticket-NNN` → review → KH merge. In practice kh
  pushes have gone straight to `main` (operator-directed, in-session). No open PRs/reviews tracked
  for kh.group on the board at handoff time.

## Repo-vs-reality mismatches
- The repo cannot fully express CF-side state: D1 **binding** to the Pages project, custom-domain
  attach, and (future) CF Access policy are configured via API/dashboard, not in git. Treat the
  repo as necessary-but-not-sufficient for reproducing the live system.
- `reference/stox-handoff/` describes a Worker scaffold; the live implementation is Pages Functions
  (`apps/stox/functions/api/[[route]].js`) — same contract, different host. Keep them aligned.
