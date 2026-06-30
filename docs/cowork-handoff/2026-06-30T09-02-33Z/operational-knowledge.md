# Operational Knowledge — kh.group

## Project structure (`~/Projects/kh`, repo `KamilHrbacek/kh`)
```
apps/
  www/          static kh.group site            → Pages kh-www         → kh.group (apex canonical)
  stox/         portfolio dashboard             → Pages kh-stox        → stox.kh.group (noindex)
    index.html  the WHOLE app (~1450 lines): inline data + khLive() overlay + all render fns
    functions/api/[[route]].js   Pages Function: /api/* (catch-all router, async)
    favicon*, assets/, maps/
  brandmanual/  private brand manual            → Pages kh-brandmanual → brandmanual.kh.group
packages/       shared (brand/ui/auth) — mostly empty
scripts/        one-off ops
docs/           README.md, architecture.md, git-push.md, cowork-handoff/<UTC>/ (this)
reference/      archived source + handoffs (NOT deployed) incl. stox-handoff/ (API contract,
                sample-data.json, access-requirements.yaml draft)
.github/workflows/deploy.yml   path-scoped CI
.cowork-push.conf              REMOTE_SLUG=KamilHrbacek/kh, BRANCH=main
CLAUDE.md                      agent brief + "Layer 0 — KH cowork DNA"
```

## Deploy workflow (git → Cloudflare; evidence: `.github/workflows/deploy.yml`)
- Trigger: push to `main` (+ `workflow_dispatch`). `dorny/paths-filter` classifies which app(s)
  changed; only those jobs run. A push under root/docs/packages deploys nothing.
- Each app job: `working-directory: apps/<app>` then
  `npx wrangler@4 pages deploy . --project-name=kh-<app> --branch=main`.
  **CRITICAL:** run from inside the app dir so `wrangler` finds `./functions` and compiles Pages
  Functions. Deploying `apps/<app>` from the repo root uploads `functions/` as STATIC files → `/api`
  404s to the SPA (this was the Phase-A outage root cause).
- Custom domains attached idempotently via CF API in CI. **DNS records are NEVER created by CI**
  (DNS-less token by design); apex/www/sub CNAMEs added by hand. Never touch kh-group.eu MX.
- CF account id `e23e7f2a089411193e86a3f444cf0954` (not secret).

## Push workflow (from the cowork sandbox)
- **Never run `git` on the mounted folder** — the mount can't unlink `.git` locks and wedges.
- Use the **cowork-push** skill (off-mount cached clone + PAT over HTTPS):
  `bash ~/Projects/kh-cowork/skills/cowork-push/scripts/cowork-push.sh -C ~/Projects/kh "<msg>"`.
  It is synchronous and prints `DONE ✓`; big-repo-safe (shallow cached clone, flock-serialised,
  push-verify). Modes: default / `--wait` / `--status` / `--ticket <NNN>` / `--merge`.
- After push, a host LaunchAgent mirrors origin→local (`fetch + reset --hard`), so the mounted
  working copy catches up.

## Review / verification workflow
- **Verify LIVE before "done".** For stox: fetch the endpoint
  (`stox.kh.group/api/health` → JSON `{ok:true}`; `…/api/fx` → `{source:"frankfurter",…}`) and load
  the dashboard in a browser. For www: the footer build stamp.
- Frontend logic is checked headlessly: extract the `<script>`, `node --check`, and a **jsdom**
  smoke test that runs the script against a mocked `fetch` and asserts (a) the API-up path upgrades
  the section AND (b) api-404 / api-returns-HTML keeps inline and never throws. (npm i jsdom in the
  sandbox; /tmp is wiped between calls so reinstall in the same command.)
- Pages Functions: a tiny node harness that imports `onRequest` and calls each route — assert shapes.

## Local commands / traps
- **Sandbox bash 45s cap** per command — never chain two long `sleep`s; long clones must run
  detached. (This is why cowork-push backgrounds + caches.)
- **`/tmp` is cleared between bash calls** — install + run test in ONE command.
- The Pages Function file is literally named `[[route]].js` (double brackets = catch-all) — quote it
  in shell (`"functions/api/[[route]].js"`).
- The stox build stamp lives inline in index.html (`build YYYY.MM.DD-N`) — bump it per change; it is
  the only visible deploy trace on stox.

## Known conventions
- British English, quiet factual voice, no emoji in user-facing copy.
- Apex canonical (kh.group); www→apex is a **Cloudflare zone Redirect Rule**, NOT `_redirects`.
- Always maintain `CHANGELOG.md` (UTC, newest first) + README + CLAUDE.md on every change.
- One umbrella repo per brand; kh.group subdomains are `apps/<name>` inside this repo.

## What usually breaks
- `/api` 404→SPA when Functions aren't compiled (deploy-from-wrong-dir) → blank dashboard if the
  frontend hard-depends on /api. The `khLive()` fail-safe + inline base is the guard.
- Forgetting the build-stamp bump (no visible trace the deploy landed).
- Concurrent cowork-push on the same repo (now flock-serialised; older versions silently dropped
  commits — see risks-and-debt.md).
