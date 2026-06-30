# Recommended Marshall Contracts — kh.group

### C1 — Gate stox.kh.group (close the public-data exposure)
- **Goal:** stox reachable only by authorised identities; real holdings no longer public.
- **Scope:** finalise the drafted `access-requirements.yaml` (group `stox-owner` = the 3 KH emails),
  KH-RBAC applicator applies the CF Access policy to stox.kh.group (Stay-on-PIN / email OTP interim).
- **Why:** real financial data is currently public behind only `noindex`. Top risk.
- **Recommended contractor:** `kh-rbac:cowork` (owns the gate) + `kh.group:cowork` (provides manifest).
- **Risk:** HIGH (access change + needs write-scoped CF token) → **KH hard-gate**.
- **Expected output:** CF Access app on stox.kh.group; the 3 emails can enter, others can't.
- **Acceptance:** anonymous fetch of stox.kh.group + `/api/holdings` returns the Access login, not data.

### C2 — Per-ticket preview deployments (architecture fix, ecosystem-wide)
- **Goal:** every `ticket-NNN` branch gets a CF Pages preview URL so KH reviews before merge.
- **Scope:** CI deploys non-main branches as previews (`wrangler pages deploy . --branch=$ref`);
  standardise once in kh-cowork (`cf-app-deploy`) and roll to every umbrella repo. Production stays main.
- **Why:** the human-confirms-before-merge gate currently has no artifact (bus id 269).
- **Recommended contractor:** a CI/infra owner + each lane to adopt; reference impl by `kh.group:cowork`.
- **Risk:** MEDIUM (CI change; preview envs need their own bindings/secrets).
- **Expected output:** ticket branches deploy to `ticket-NNN.<project>.pages.dev`.
- **Acceptance:** push a ticket branch → a preview URL appears and renders.

### C3 — FX číselník populated (ČNB + ECB, persisted history)
- **Goal:** `kh-stox.fx_rates` holds daily ECB + ČNB rates with history; `/api/fx` reads from D1.
- **Scope:** ČNB daily kurzovní-lístek fetch+parse (CZK-based → EUR-per-unit), ECB via Frankfurter,
  daily upsert into `fx_rates`; bind D1 to the kh-stox Pages project; `/api/fx` latest-from-D1 with
  live→mock fallback.
- **Why:** persistence + cross-source comparison; foundation for watchlist/settings/lots later.
- **Recommended contractor:** `kh.group:cowork`.
- **Risk:** LOW–MEDIUM (D1 binding is a small config gate).
- **Expected output:** `/api/fx?source=cnb|ecb` + history; číselník rows accumulating daily.
- **Acceptance:** D1 query shows ≥1 day of both sources; `/api/fx` returns D1-sourced values.

### C4 — Per-portfolio authZ for stox
- **Goal:** owner sees all; wife sees Monika; banker sees read-only subset.
- **Scope:** `members(email,role,portfolios)` in `kh-stox`; function reads
  `CF-Access-Authenticated-User-Email` → scopes `/api/holdings` etc.
- **Why:** the access model KH wants ("see who has access where") — app-side layer atop the gate.
- **Recommended contractor:** `kh.group:cowork` (coordinated with `kh-rbac:cowork`).
- **Risk:** MEDIUM (depends on C1 gate). **No PII in client** (board rule 146).
- **Acceptance:** the wife's email sees only Monika; banker is read-only; owner unchanged.

### C5 — Modularise / harden STOX
- **Goal:** reduce the 1450-line single file's blast radius; converge duplicated holdings data.
- **Scope:** split render modules; single source of truth for holdings (D1/adapter, not 3 copies).
- **Why:** debt + token cost + outage risk.
- **Recommended contractor:** `kh.group:cowork`.
- **Risk:** MEDIUM (touches the live app — go incremental, keep fail-safe + verify live).
- **Acceptance:** behaviour byte-identical; per-domain modules; one holdings source.
