# Pushing from cowork (no GitHub Desktop clipboard)

`scripts/cowork-push.sh` commits + pushes this repo to GitHub **from the cowork
sandbox**, so you don't hand-copy anything into GitHub Desktop. Cloudflare builds
the changed app(s) automatically on the push.

## Why it's built this way (the constraints, measured)

In a cowork sandbox:

- `github.com` is reachable, but `api.github.com` is **blocked** (egress allowlist).
  → plain `git push` works; the GitHub **API** (and `gh`, and repo *creation*) does not.
- The sandbox has **no git credentials** by default.
- The **mounted folder cannot unlink `.git` lock files** (`Operation not permitted`),
  so running `git` directly on the mount **wedges the repo**.

So the script does git **off the mount**: it clones the repo into the sandbox's own
filesystem, `rsync`s your mounted files into that clone, and commits + pushes from
there. The mount is only ever read. The same script works in any KH cowork repo.

## One-time machine setup

1. **Create a GitHub fine-grained PAT** (github.com → Settings → Developer settings →
   Fine-grained tokens):
   - Repository access: the repos you'll push (or *All repositories* for every cowork).
   - Permissions: **Contents: Read and write**, **Workflows: Read and write**
     (needed to push `.github/workflows/**`), Metadata: Read (auto).
   - Set an expiry you're comfortable with.
2. **Save the token where the sandbox can read it, outside any repo**, so it's shared
   by all repos and never committed:
   ```
   mkdir -p ~/Projects/.kh-secrets
   printf '%s' 'PASTE_TOKEN_HERE' > ~/Projects/.kh-secrets/gh-token
   chmod 600 ~/Projects/.kh-secrets/gh-token
   ```
   Do this in your own Terminal — **don't paste the token into chat.** (Override the
   location with `KH_GH_TOKEN_FILE` if you prefer somewhere else.)
3. **Create the empty GitHub repo once** on github.com (New repository → empty, no
   README). Repo creation can't be automated from cowork because `api.github.com` is
   blocked — this is the only manual GitHub-UI step, once per repo.

## Per-repo setup

A `.cowork-push.conf` at the repo root (committed, not secret):

```
REMOTE_SLUG=KamilHrbacek/<repo>
BRANCH=main
```

To reuse in another repo: copy `scripts/cowork-push.sh` into that repo's `scripts/`
and add its own `.cowork-push.conf`. (Or promote the script into the `kh-cowork`
plugin so every cowork has it without copying.)

## Usage

```
scripts/cowork-push.sh "your commit message"
```

- Pushes the **current state of the mounted folder** to `main`.
- Prints `nothing to push` if the working tree already matches the remote.
- Never prints the token; never writes it into git config or a remote URL (uses an
  Actions-style `http.extraheader` per call).

## Notes / gotchas

- **Never run `git add/commit` directly in the mounted folder from cowork** — it
  wedges on `.git` locks. Let this script (which works off-mount) do all git.
- A leftover wedged `.git` in the mount is harmless (the script ignores it); you can
  delete it host-side: `rm -rf ~/Projects/<repo>/.git`.
- First push to a brand-new empty repo just works (the script starts `main` fresh).
- Token rotation: replace the file in `~/Projects/.kh-secrets/`; nothing else changes.
