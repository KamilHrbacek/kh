# Risks & Debt — kh.group

## Architectural risks
1. **Real financial data on a publicly-reachable URL.** stox.kh.group serves real holdings/values
   and is only `noindex` (not auth-gated). `noindex` ≠ protection. **Highest risk.** Fix: CF Access
   gate via KH-RBAC (KH hard-gate, pending). Confidence: HIGH this is unmitigated today.
2. **No per-ticket preview deployments.** CI is `branches: [main]` + `--branch=main`, so `ticket-NNN`
   branches never deploy → the "review at a URL before merge" gate has no artifact. The whole
   human-confirms-before-merge loop is weakened. Ecosystem-wide (likely all umbrella repos). Raised
   on bus id 269. Confidence: HIGH for kh; assumption it's shared (verify per repo).
3. **STOX is one ~1450-line `index.html`.** No module boundaries; every change is global blast
   radius. A single mistake (top-level `await` on a not-yet-served `/api`) blanked the entire page
   once. Mitigated by the inline-base + fail-safe overlay pattern, but the file size itself is debt.

## Technical debt
- **fx_rates číselník is built but unused** — D1 exists, no upserts, not bound, `/api/fx` doesn't
  read it. Live FX is fetched per-request (edge-cached) with no history. Half-finished.
- **Mock vs live split inside one function** — 7 of 8 domains still return embedded mock constants;
  the real owner data (12 holdings) is duplicated between inline `index.html` AND the function's
  constants. Two copies of "truth" until D1/adapters land.
- **Access model designed in 3 places** (this handoff, the drafted manifest, KH's "D1 table" idea)
  but not reconciled with KH-RBAC's actual schema — boundary still fuzzy (see needs-canonicalization).

## Duplicated knowledge / workflows
- Holdings data: inline in `index.html` + as constants in the Pages Function + sample in
  `reference/stox-handoff/sample-data.json`. Should converge on one source (D1/adapter).
- The cowork-push / secrets-vault patterns are documented in kh-cowork AND echoed in per-repo
  CLAUDE.md — useful redundancy but drifts.

## Brittle assumptions
- "`drain-my-lane` keeps stox moving" — only true while the Mac is awake + app open every 3h. If
  not, nothing happens. (Prefer wake-on-demand over blind cron — see academy.)
- "wrangler picks up functions/" — only when invoked from the app dir; silently degrades to static
  upload otherwise.

## Local-only dependencies (single points of failure)
- The whole sandbox→git path depends on the local PAT in `~/Projects/.kh-secrets` + the host
  LaunchAgents (git mirror + secrets watcher). If the machine is lost, recovery is the
  `bootstrap` + `secrets-vault` flow (kh-cowork). Documented; not yet drill-tested by another person.
- cowork-push relies on a single cached off-mount clone per repo; concurrent runs once silently
  dropped commits — now flock-serialised (ticket 142/194), but it's still one shared clone.

## Expensive LLM behaviour
- Long interactive sessions doing what a contract/scheduler should do — this very handoff exists to
  move knowledge out of chat. The `drain-my-lane` prompt is self-contained to avoid re-deriving
  context each tick.
- Re-reading the 1450-line index.html per change is token-heavy; modularising stox would cut this.

## Over-reliance on one contributor
- kh.group, the kh-cowork toolkit, secrets-vault and cowork-push were largely shaped in one
  long operator+cowork session. The steering still concentrates here. This handoff + the
  recommended contracts are the deliberate de-risking.
