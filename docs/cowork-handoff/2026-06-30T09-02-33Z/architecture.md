# Architecture — kh.group

## Runtime
Static-first. Each app is plain HTML/CSS/JS served by **Cloudflare Pages** (zero build step).
STOX adds **Cloudflare Pages Functions** (one async catch-all, `apps/stox/functions/api/[[route]].js`)
for its `/api/*` JSON API. No Node server, no framework.

## Cloudflare assets (account `e23e7f2a089411193e86a3f444cf0954`)
- **Pages projects:** `kh-www` (kh.group + www), `kh-stox` (stox.kh.group), `kh-brandmanual`
  (brandmanual.kh.group). Production branch `main`.
- **Pages Functions:** stox `/api/*` only. Endpoints (evidence: grep of the function):
  `/health /me /portfolios /holdings /fx /yields /watchlist /news /signals /advisor
  /recommendations /sources`.
- **D1:** `kh-stox` (`4f6c5ca8-46a3-46a3-ac6f-b352d0f85b03`, region EEUR) — table `fx_rates`
  (FX číselník). **Created but empty; not yet bound to the kh-stox Pages project.** Other D1s in the
  account belong to other lanes (agent-bus, kh-inbox, kh-forms, photorobot-io-data, exchange-db,
  kh-agents) — NOT ours.
- **KV / R2 / Queues / Vectorize:** none used by kh.group today. (PhotoRobot uses R2; not ours.)
- **Workers (standalone):** none for kh.group (everything is Pages/Pages-Functions).
- **Zone settings:** apex-canonical; www→apex via a CF zone Redirect Rule (not Pages `_redirects`).

## External dependencies
- **Frankfurter** `api.frankfurter.app` — live ECB FX rates, server-side in `/api/fx`, no key,
  edge-cached ~1h, mock fallback. (Future: **ČNB** daily kurzovní lístek as a second source.)
- **GitHub** `KamilHrbacek/kh` — source of truth + only deploy trigger.
- **agent-bus** D1 (coordination), **KH-RBAC** (access gate, cross-lane), **Marschall** (orchestrator).

## Data flow (STOX)
```
browser → stox.kh.group (Pages static index.html)
  index.html renders synchronously from INLINE data (always-on base)
  then khLive(domain) fetches /api/<domain>:
     Pages Function → mock constants  (today)
                    → external adapter (FX: Frankfurter live; later D1 fx_rates; bank export; AI)
     on success: re-render that domain;  on 404/HTML/empty/identical/malformed: keep inline
  (FX additionally drives a whole-app recompute: recomputeFX)
later: CF Access (gate, via KH-RBAC) → CF-Access-Authenticated-User-Email header →
       kh-stox D1 members table → per-portfolio scope in the function
```

## Ownership boundaries
- **Cloud-only:** the Pages deployments, Pages Functions, the `kh-stox` D1, CF Access/zone config.
  These exist only in Cloudflare; the repo describes them but cannot fully reproduce CF-side state
  (custom domains, D1 bindings, Access policies are configured via API/dashboard).
- **Local-only:** the macOS LaunchAgents (git mirror + secrets watcher), the off-mount cowork-push
  cache, and plaintext secrets in `~/Projects/.kh-secrets` + `~/Projects/tokens/.env` (backed up
  encrypted in the private `kh-secrets` repo via the secrets-vault skill; values never read here).
- **Git (portable):** all app source + CI + docs.

## n8n
Not used by kh.group directly. n8n has its own Cloudflare D1 token (`n8n-d1`) and writes to D1 by
its own path; kh.group does not depend on it. (Documented only because the token naming was cleaned
up earlier in this domain's work.)
