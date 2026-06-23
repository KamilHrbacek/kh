# apps/www — the kh.group website

Static, zero-build site for **https://kh.group/**. Cloudflare Pages project **`kh-www`**
(custom domains `kh.group` apex-canonical + `www.kh.group`).

## Files
- `index.html` — the whole single-page site (sections: home, brands, companies, contact, legal).
- `brand-tokens.js` — single source of truth for brand colours; served with
  `Access-Control-Allow-Origin: *` (see `_headers`) so other KH surfaces (e.g. brandmanual)
  can read it.
- `favicon.svg` — gold `#FFB800` KH mark. One ambidextrous colour on purpose: readable on
  light AND dark tabs. No `prefers-color-scheme` (Safari ignores it in favicons).
- `assets/` — fonts/images, incl. `assets/img/og-cover.png` (1200×630 logotype-only social card).
- `_headers` — CORS for `brand-tokens.js`, long cache for `/assets/*`.
- `_redirects` — same-host PATH redirects only.

## Deploy
Push to `main` with changes under `apps/www/**` → CI builds `kh-www` → kh.group. No laptop deploys.

## Footguns
- **www→apex is a Cloudflare zone Redirect Rule** ("Redirect from WWW to root", 301 +
  preserve query) — NOT `_redirects` (which can't redirect by hostname on Pages).
- Favicons cache hard — after a change, hard-refresh / reopen the tab.
- Social share previews are cached per-URL by WhatsApp/FB/LinkedIn — test a fresh share or `?x=1`.
