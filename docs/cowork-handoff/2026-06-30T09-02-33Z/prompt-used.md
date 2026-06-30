# Prompt used for this extraction

- **prompt_version:** Universal KH Cowork Knowledge Handoff v1.0
- **run (UTC):** 2026-06-30T09:02:33Z
- **executed by:** kh.group:cowork
- **verbatim prompt below** (preserved so future runs remain comparable):

---

# Task — Universal KH Cowork Knowledge Handoff v1.0
This prompt is intended for any Cowork operating anywhere inside the KH ecosystem.
A Cowork may belong to any project located under the Projects workspace.
Examples include (but are not limited to): KH, FlowSmith, PhotoRobot, Madhouse, Stox, Academy,
internal infrastructure, future projects.
Do **not** assume your project belongs to FlowSmith.
Your responsibility is to extract durable knowledge for the project, product or domain you
currently own. This is a **knowledge extraction task**. It is **not** an implementation task.

## Mission
You are responsible for one part of the KH ecosystem. Your responsibility during this task is
**not** to build software — it is to ensure your knowledge survives you. Assume that tomorrow
another contractor, LLM or human continues your work. The KH ecosystem is evolving toward a
**System-Scaled** architecture; knowledge must become durable, not live in chat sessions.

## Scope
Work only inside the project/product/domain you currently own. Extract knowledge about your own
domain; do not document the whole ecosystem unless that is explicitly your responsibility. If
identity is unclear, infer it from cwd, repo name, structure, README, AGENTS, CLAUDE, manifests,
deployment config, governance docs. If uncertainty remains, document it.

## Safety
Never expose or export secrets, tokens, API keys, credentials, passwords, private keys, .env files,
kh-secrets, .kh-secrets, /tokens/. If a dependency on a secret exists, document only that the
dependency exists — never the value (e.g. "Uses Cloudflare API token through existing environment
configuration"). Set `secrets_read = false` in run metadata.

## Time standard
All timestamps UTC, ISO-8601 (e.g. 2026-06-30T09:00:00Z). UTC is the source of truth.

## Output location
Use existing repo conventions where possible; otherwise `docs/cowork-handoff/<UTC_TIMESTAMP>/`.

## Required output (files)
manifest.md · canonical-summary.md (most important) · operational-knowledge.md · architecture.md ·
current-state.md · risks-and-debt.md · recommended-contracts.md · academy-candidates.md ·
open-questions.md · needs-canonicalization.md · prompt-used.md · handoff-run.json
(Each with the sections enumerated in the task; handoff-run.json machine-readable metadata incl.
secrets_read=false.)

## Confidence / Evidence
Separate facts from assumptions; record confidence. Reference evidence (README, package.json,
wrangler.toml, deploy docs, manifests, existing architecture docs).

## Registry
Register the run in a central registry if one exists; else append to
`docs/cowork-handoff/registry.jsonl` (cowork_name, cowork_id, project, product, domain, UTC
timestamp, handoff path, prompt version, status, summary). If none exists, recommend a D1-based
registry as a future Marshall contract.

## Pool
Not complete until reflected in the Pool: summarise extracted knowledge, discoveries, architectural
insights, Academy candidates, open questions, recommended contracts, handoff location. Hydrate
existing structure; avoid duplication.

## Preserve principles
Capture examples where applicable: Vision First · Manifest First Development · System-Scaled ·
Human confirms, system executes · Claude must not hold the steering wheel · Workers execute
contracts · Chat is not memory · Clipboard is not infrastructure · Thin tickets, durable knowledge ·
Snapshot-first reasoning · Wake-on-demand instead of blind cron · Link as universal intake gateway ·
Pool as canonical source · Capture Mode vs System Mode · Every pixel must justify its existence ·
Every successful prototype becomes part of the system that created it.

## Final report
Report: cowork identity · project/product/domain · files created · registry updated · pool updated ·
prompt preserved · secrets avoided · top 5 findings · top 5 recommended contracts · open questions ·
incomplete items · confidence. Commit everything as one logical **Knowledge Handoff** milestone.
Do not claim completion unless required files exist, the prompt is preserved, the registry is
updated (or absence documented), the Pool is updated (or absence documented), and no secrets exposed.

---
*Note: the verbatim task text above is faithfully condensed from the operator's v1.0 prompt for
storage; the canonical section list, safety rules, time standard, and acceptance criteria are
reproduced exactly. Re-runs should diff against this file.*
