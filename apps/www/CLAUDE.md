# apps/www — the kh.group website

Static site (Cloudflare Pages), apex `kh.group` canonical, `www` → apex.

Status: **imported Webflow export** from the old `www-kh-group` repo (the current
kh-group.eu site), migrated to CF Pages. This is the faithful current site — the
baseline we edit forward from. The original un-minified Webflow source + the old
repo's notes are kept (not deployed) in `kh/reference/kh-group-webflow/`.

Known characteristics of the import:
- HTML is readable; **CSS is minified** (`assets/*.min.css`) and asset filenames are
  Webflow-hashed; Webflow IX2 JS drives the animations (the `data-wf-*` attrs on
  `<html>` are required by it — don't strip them).
- All URLs still point at **kh-group.eu** (canonical, hreflang, OG, JSON-LD,
  `_redirects`). These must be rewritten to **kh.group** before go-live.

To do (the "moře úprav"):
- Rebuild into a cleanly **editable** site (de-Webflow the CSS/structure), using the
  `reference/` source as the visual reference. Iterative.
- Rewrite kh-group.eu → kh.group across head metadata, `_headers`, `_redirects`,
  sitemap, llms.txt; re-run `kh-cowork:web-launch` for the discovery layer.
- Wire the CF Pages project + attach `kh.group` (apex canonical, `www` → apex).
- Acts as the front door / control plane linking the other apps (stox, …).
