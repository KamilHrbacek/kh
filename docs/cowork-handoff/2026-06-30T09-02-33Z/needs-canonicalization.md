# Needs Canonicalization — kh.group

Knowledge currently scattered; recommended single sources of truth.

### 1. STOX holdings / portfolio data — **3 copies today**
Inline in `apps/stox/index.html`, as constants in `apps/stox/functions/api/[[route]].js`, and in
`reference/stox-handoff/sample-data.json`. → **Canonical:** the `kh-stox` D1 (once adapters land);
until then, the Pages Function constants. Inline should become pure fallback-of-last-resort.

### 2. FX rates — live-fetch vs číselník
`/api/fx` live-fetches Frankfurter per request (edge-cached, no history); the `fx_rates` číselník
exists but is unused. → **Canonical:** `kh-stox.fx_rates` (daily ECB+ČNB upserts), `/api/fx` reads
latest-from-D1 with live→mock fallback.

### 3. Access / RBAC — three partial descriptions
This handoff, the drafted `reference/stox-handoff/access-requirements.yaml`, and KH's "D1 access
table" idea. → **Canonical:** **KH-RBAC** owns the gate (manifest is the source of truth for who may
enter); the per-portfolio map is a `kh-stox` D1 `members` table. Reconcile with `kh-rbac:cowork`
before building so there is ONE access truth, not three.

### 4. The cowork DNA / autonomy / hard-gates
Lives in `kh-cowork/COWORK-DNA.md` + `AUTONOMY.md`, echoed into each repo's `CLAUDE.md` "Layer 0",
and re-stated on the bus (msg 134/135). → **Canonical:** `kh-cowork/COWORK-DNA.md`; per-repo
CLAUDE.md should reference, not re-derive (it drifts).

### 5. The deploy/preview architecture
The wrangler-from-app-dir requirement + the main-only/no-preview gap are documented in `kh`'s
deploy.yml comments, `kh/CHANGELOG.md`, this handoff, and the `cf-app-deploy` skill. → **Canonical:**
the **`cf-app-deploy`** skill in kh-cowork (one reference CI pattern incl. branch previews), with
repos pointing at it.

### 6. Cowork handoff registry
No central registry exists yet. This run appends to `docs/cowork-handoff/registry.jsonl` (per-repo).
→ **Recommended canonical (future contract):** a **D1-backed handoff/registry table** queryable by
Marschall across all lanes, instead of N per-repo jsonl files. (See recommended-contracts / the
task prompt's own suggestion.)
