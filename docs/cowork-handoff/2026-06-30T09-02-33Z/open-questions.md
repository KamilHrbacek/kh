# Open Questions — kh.group

## Lane / identity (needs human or Marschall confirmation)
- **Is `kh.group:cowork` the correct lane for me?** Self-assigned because the work (stox/kh
  portfolio/kh-cowork) is unclaimed and matches my history; env/mount is `www-flowsmith` which is
  ambiguous, and `flowsmith:cowork` already exists. Asked Marschall (bus id 151) — **no reply yet.**
  Assumption, MEDIUM confidence.

## Access architecture (needs `kh-rbac:cowork` + KH)
- **Where does the stox access manifest live** — a handoff dir KH-RBAC ingests, or `access-
  requirements.yaml` in the kh repo that the applicator reads? (bus id 263, awaiting reply.)
- **Does KH-RBAC's schema express per-portfolio scope** (which portfolio a member sees), or must
  that authZ live app-side in a `kh-stox` D1 `members` table? KH leans D1/admin-visible.
- **Which CF token applies Access?** KH-RBAC's applicator needs a write-scoped CF API token that
  (per their README) KH hasn't created yet. Blocks C1.

## Per-ticket previews (architecture, team)
- Was board ticket 030 ("branch previews are gone") a **deliberate** removal or a workaround for the
  CI-main-only gap? Who owns rolling the preview-deploy fix across repos? (bus id 269, awaiting.)

## STOX data
- **ČNB source format** — assuming the daily text kurzovní lístek (CZK-based; convert to EUR-per-unit
  to match `FX[ccy]`). Confirm endpoint + whether KH wants ČNB as primary for CZK or just stored.
- **Real data beyond holdings** — bank-export format for live positions/lots, dividends feed, and
  the AI advisor/sources engine are all still owner-provided / TBD (per `reference/stox-handoff/`).
- **Which portfolios + members** beyond owner (KH) — wife→Monika, banker→read-only-subset: confirm
  the exact email→portfolio→role matrix before building C4.

## Operational
- **Machine-awake assumption** — is Amphetamine running so `drain-my-lane` (3h) actually fires
  overnight? If not, autonomous progress is illusory.
- **Is the per-lane "Pool"** a formal structure for kh.group, or is the bus + this handoff the pool?
  No kh-local board exists (the board is `www-flowsmith/backlog`, project-tagged). Documented as a
  gap (see needs-canonicalization.md).
