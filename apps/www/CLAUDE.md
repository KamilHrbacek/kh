# apps/www — the kh.group website

Static site (Cloudflare Pages), apex `kh.group` canonical, `www` → apex.

Status: **placeholder** (`index.html`). To do:
- Decide whether to seed from the existing `www-kh-group` repo (the current
  kh-group.eu site) or start fresh; decide kh-group.eu → kh.group migration/redirects.
- Run the `kh-cowork:web-launch` skill for the discovery layer (robots, sitemap,
  llms.txt, JSON-LD, `_headers`, manifest, OG).
- Acts as the front door / control plane linking the other apps (stox, …).
