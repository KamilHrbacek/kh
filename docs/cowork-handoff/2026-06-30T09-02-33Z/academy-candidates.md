# Academy Candidates — kh.group (teach the reasoning, not the docs)

### 1. "Never make a working UI hard-depend on a not-yet-served backend" (anti-pattern → principle)
The stox frontend was converted to a `<script type="module">` with a top-level
`await fetch('/api/...')`. When the deployed Pages Functions weren't actually served, the fetch
rejected, the module died, and the **whole dashboard went blank**. Lesson: render from a local/
last-good base FIRST (always works), treat live data as a non-blocking, per-domain ENHANCEMENT with
fallback. A rejected top-level await renders *nothing*. → Pattern now in stox as `khLive()`:
**inline base + fail-safe overlay**. Ties to *"Human confirms, system executes"* and resilience —
the page must survive its dependencies being down.

### 2. "Your verification must not mock away the very thing that fails"
The jsdom smoke test originally **mocked `fetch`**, so it proved the happy path while the real
failure (the API not being served in production) sailed through. Good verification exercises the
FAILURE path too: api-404 and api-returns-HTML must keep the page alive. → *Verify live before done*,
and test the unhappy paths explicitly.

### 3. "Where a tool runs is part of its contract" (the wrangler-functions trap)
`wrangler pages deploy apps/stox` from the repo root uploaded `functions/` as **static files**;
the same command run **from inside `apps/stox`** compiled them into Pages Functions. Identical
intent, different CWD, opposite result — and CI "succeeded" both times. Lesson: read the actual
build log, don't trust green; understand what a CLI keys off (here: CWD).

### 4. "In a sandbox with a per-command time limit, never scale with history"
`cowork-push` re-cloned full git history every push and blew the ~45s ceiling on big repos; a
long clone also hogged the single process slot. Fix: shallow + cached clone, and run heavy work
**detached + poll a status file** so the per-command cap stops being a correctness bug. → Maps to
*Snapshot-first reasoning* and to designing for the platform's real constraints.

### 5. "`noindex` is not access control"
Real portfolio data sat on a public URL protected only by `noindex` for a week. Search-hiding ≠
authorisation. → Gate sensitive data with real authN/Z (CF Access + KH-RBAC); *the system, not a
meta tag, enforces access.*

### 6. "Cron is not presence — prefer wake-on-demand"
`drain-my-lane` every 3h only works while the machine is awake + app open; it silently does nothing
otherwise, and it's easy to over-claim "it runs without me." → *Wake-on-demand instead of blind
cron*; and be honest about what autonomy actually covers.

### 7. "Chat is not memory" (why this handoff exists)
Months of architecture lived only in one long session. The System-Scaled move is to externalise it:
durable handoff docs + a registry + the Pool, so the next contractor/LLM continues with confidence.
*Every successful prototype becomes part of the system that created it.*

### 8. "Read the bus before you act"
Being reminded to read the agent-bus revealed: the scheduler had already advanced stox overnight,
the ticket workflow (central board + ticket-request→steward→branch→KH-merge), a new PII hard-rule,
and that an access framework (KH-RBAC) already existed — preventing me from reinventing it. → Orient
in the shared state first; *Pool as canonical source.*
