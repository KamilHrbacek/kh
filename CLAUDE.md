# CLAUDE.md — kh (KH Group monorepo)

Agent brief. Read before editing.

## What this is

The **KH Group umbrella monorepo**: one git repo for everything under the
`kh.group` brand. One repo per brand/domain is the KH convention — this is the
`kh.group` one (sibling brands like `flowsmith` live in their own umbrella repos).

```
apps/          things Cloudflare DEPLOYS (one folder per deployable)
  www/         the kh.group website            → kh.group            (CF Pages)
  stox/        portfolio + market-signal app   → stox.kh.group       (CF Worker)
packages/      shared code consumed by apps (brand, ui, auth/KH-RBAC) — empty until first shared
scripts/       one-off ops scripts
docs/          architecture + design notes
```

Future apps (planned): `vcards/` (team v-cards), `brandmanual/`.

## The convention (why the layout is this way)

- **Repo boundary = brand/domain.** One umbrella repo per product/domain. `kh.group`
  subdomains (stox, vcards…) are `apps/<name>` inside THIS repo.
- **`apps/` = deployables.** Anything Cloudflare builds/serves. Each app owns its own
  `wrangler.toml` (Workers) or is a static dir (Pages), and its own path-scoped deploy
  job — a change in one app never redeploys another.
- **`packages/` = shared, NOT deployed.** Brand tokens, UI components, auth (KH-RBAC).
- **`apps/www` is the front door / control plane.** "Run everything from the web" is a
  product concern (www links/embeds the other apps + their admin), not a repo-layout one.

## Deploy model

- Git → Cloudflare. Push to `main` triggers path-scoped deploys
  (`.github/workflows/deploy.yml`). No deploys from a laptop sandbox.
- `apps/www` → Pages project (**TODO: create + name**); `apps/stox` → Worker
  (**TODO: name**). Custom domains `kh.group` (apex canonical) + `stox.kh.group`.
- CF account: `e23e7f2a089411193e86a3f444cf0954` (KH — **verify**).

## Push (commit → GitHub)

From cowork: `scripts/cowork-push.sh "message"` (NOT raw `git` on the mount — it
wedges on `.git` locks). The script does git off-mount and pushes to `main` over
HTTPS with a fine-grained PAT; Cloudflare then builds the changed app(s). One-time
setup (PAT + empty GitHub repo) and the rationale are in `docs/git-push.md`. The
script + pattern are reusable in any KH cowork repo.

## Conventions

- Apex canonical (`https://kh.group/`); `www` 301s to apex.
- Always maintain `CHANGELOG.md` (UTC, newest first), this file, and `README.md`.
- British English, quiet factual voice, no emoji in user-facing copy.
