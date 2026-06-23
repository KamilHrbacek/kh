# apps/brandmanual — KH brand manual (private)

Static brand manual for **https://brandmanual.kh.group/**. Cloudflare Pages project
**`kh-brandmanual`**. Private + `noindex`.

## Access gate (email PIN)
`functions/_middleware.js` gates the whole site with an email one-time PIN (stateless,
HMAC-signed challenge + session cookie; signing key self-generated and stored in KV).
- **Allowlist is in code** (`ALLOW`, not secret): `kh@kh-group.eu`, `kamil@hrbacek.net`,
  `kamil.hrbacek@gmail.com` — edit `ALLOW` to add/remove reviewers.
- Needs on the Pages project: KV binding **`BM_KV`** (namespace `kh-brandmanual-auth`) +
  a mail var **`BM_MAIL_FROM`** (default `forms@flowsmith.online`).
- **Interim:** if `BM_KV` isn't bound, the middleware lets traffic through (open) but stays
  `noindex`. The PIN goes live the moment you bind `BM_KV` + set the mail var.

## Files
- `index.html`, `assets/`, `logos/` — the manual.
- `functions/_middleware.js` — the PIN gate. `robots.txt` + `_headers` — `noindex` everywhere.

## Deploy
Push `apps/brandmanual/**` to `main` → CI builds `kh-brandmanual` → brandmanual.kh.group.

## Footguns
- The gate is a **Pages Function** — it runs only on the deployed Pages domain, not on a
  local file open.
- **Never** put Cloudflare Access (or anything) in front of the whole host — the PIN gate
  handles auth itself.
- `BM_MAIL_FROM` sends from a flowsmith address because kh.group isn't a mail domain — do
  NOT point it at kh-group.eu (would touch real email/MX).
