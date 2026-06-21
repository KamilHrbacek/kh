# CLAUDE.md — agent brief for kh-group.eu

> Canonical brief for any AI agent (Claude Code, Cursor, Codex, future-you)
> working on this repo. Read it first.

## 1. What this project is

`kh-group.eu` is the public landing page for **KH Group**.

KH Group — průmyslové portfolio se zaměřením na výrobu, technologie a nemovitosti.

Holding pro PhotoRobot, sls.market, prototype.builders a další aktivity. Obsahové změny od 1.7.2026 (viz WEB-BUILD-ROADMAP §1): vyřazena elektromobilita, uni-max prodán Zafidu, posílit PhotoRobot, doplnit sls.market + prototype.builders, zdůraznit tech-zázemí (laserové robotické sváření, SLS, Trumpf, Mazak Integrex CNC).

History: designed in Webflow as a Starter site (free tier), originally
hosted on Google Cloud Storage via a YAML pipeline. Migrated to
Cloudflare Pages in May 2026 as part of a broader kh-group portfolio
migration off Webflow. The original Webflow mirror sits in `source/`
(gitignored) and can be regenerated with `mirror_webflow.py`.

## 2. Stack and architecture

- **Single static page.** `index.html` + flat `assets/` folder. No build
  step, no framework.
- **Hosting**: Cloudflare Pages. GitHub repo to be created at
  `KamilHrbacek/www-kh-group` — https://github.com/KamilHrbacek/www-kh-group
- **Custom domains**: `kh-group.eu` (apex, canonical) + `www.kh-group.eu` (301 →
  apex via `_redirects`).
- **Language**: cs primary, no i18n switcher.
- **Inherited Webflow runtime**: jQuery + Webflow IX2 JS power the
  interactions baked into the original Webflow design. We keep them
  for now; replacing with vanilla JS is in the backlog.

## 3. File layout

```
/
├── index.html                  # head meta + JSON-LD, IX2 attrs intact
├── assets/                     # content-hashed CSS/JS/images/fonts
├── robots.txt                  # 25+ AI bots allowed
├── sitemap.xml                 # apex + llms.txt
├── llms.txt                    # Answer.AI standard
├── manifest.webmanifest
├── _headers                    # HSTS, CSP, security
├── _redirects                  # www → apex 301
├── README.md
├── CLAUDE.md                   # this file
└── source/                     # Webflow mirror, gitignored
```

## 4. Sync rules — when X changes, also update Y

| You edit                                          | You must also                                                  |
|---------------------------------------------------|----------------------------------------------------------------|
| `index.html` `<title>` or `<meta description>`    | Mirror into og/twitter, JSON-LD `WebSite.name`/`description`, `llms.txt`. |
| Contact details                                   | Update visible `<a>` tags, JSON-LD `Organization` properties, and `llms.txt`. |
| Hero image                                        | Update `og:image`, `twitter:image`, JSON-LD entity `image`. |
| Adding a second language                          | Add `<link rel="alternate" hreflang>`, `og:locale:alternate`, sitemap `xhtml:link`, JSON-LD `WebSite.inLanguage` array. |
| New page                                          | Add `<url>` to `sitemap.xml`, consider listing in `llms.txt`. |
| Files NOT to crawl                                | Add to `robots.txt` `Disallow:`. |

## 5. Conventions

- **No emoji** in user-facing copy.
- **Apex is canonical**: `https://kh-group.eu/` with trailing slash.
- **Do NOT strip `data-wf-domain/page/site`** from `<html>` — required
  by Webflow IX2 runtime. Removing them silently breaks the page.
  (Confirmed during ella.direct pilot, May 2026.)
- **No build step.** Zero-build by design.

## 6. Operational notes

- **Deploy**: push to `main` → Cloudflare Pages auto-builds → live in 30–60s.
- **CF zone settings** (live outside repo):
  - SSL/TLS Always Use HTTPS = ON
  - HSTS = ON, 12mo, includeSubDomains, preload, no-sniff
  - Security → Bots → AI Scrapers and Crawlers = Do not block (off)
  - Speed → Auto Minify = OFF (corrupts inline JSON-LD)
  - Encoded in `kh-cowork:cf-zone-ops`.

## 7. Backlog

### Before DNS cutover
- [ ] Validate CF Pages preview deployment matches source visually.
- [ ] Apply `kh-cowork:cf-zone-ops` standards once `kh-group.eu` zone is in
      the CF account (domain transfer handled by `kh-cowork:domain-migration`).
- [ ] Per-project cowork: provést obsahové změny dle §1 WEB-BUILD-ROADMAP.md.

### Polish
- [ ] Replace Webflow IX2 + jQuery with vanilla JS.
- [ ] Self-host Google Fonts.
- [ ] Lighthouse audit, log baseline scores.
- [ ] Run Google Rich Results Test on the apex.
- [ ] Submit `kh-group.eu` to `hstspreload.org` after HSTS has been stable
      a few weeks.

## 8. Out of scope

- Don't change canonical host. Apex is canonical.
- Don't enable Cloudflare "Auto Minify".
- Don't add a build step.
- Don't expose family/private context in public files (`llms.txt`,
  JSON-LD). Keep it here in CLAUDE.md.
