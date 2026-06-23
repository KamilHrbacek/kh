# docs/

Architecture + design notes for the kh monorepo.

- `architecture.md` — why the repo is laid out this way (one umbrella repo per brand;
  `apps/` = deployables; `packages/` = shared, not deployed).
- `git-push.md` — the cowork → GitHub push flow (off-mount, fine-grained PAT) + one-time
  setup. See also the `cowork-push` / `cowork-sync` skills in the `kh-cowork` plugin.
