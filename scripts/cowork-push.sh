#!/usr/bin/env bash
# cowork-push.sh — commit + push a repo to GitHub FROM THE COWORK SANDBOX, without
# running git on the mounted folder (the mount can't unlink .git lock files, so
# git-on-mount wedges the repo).
#
# Unlike the other kh-cowork skills (host-side: api.cloudflare.com is blocked in the
# sandbox), THIS script is designed to run IN the cowork sandbox bash — github.com IS
# reachable from the sandbox, and doing git off the mount sidesteps the lock problem.
#
# How: clones the repo fresh into the sandbox-native filesystem (off the mount),
# rsyncs the mounted working files into that clone, then commits + pushes from there.
# Cloudflare auto-builds the changed app(s). The mount is only ever read.
#
# Usage:  cowork-push.sh [-C <repo_path>] "commit message" [branch]
#   -C <repo_path>   repo to push (default: $COWORK_PUSH_REPO, else this script's
#                    parent repo if it has .cowork-push.conf, else $PWD)
#
# Per-repo config (committed, not secret) at <repo>/.cowork-push.conf:
#   REMOTE_SLUG=owner/repo
#   BRANCH=main
# Token (one-time, NOT in any repo) — see references/token-setup.md:
#   ~/Projects/.kh-secrets/gh-token   (override with $KH_GH_TOKEN_FILE)
set -euo pipefail

REPO_OVERRIDE=""
if [ "${1:-}" = "-C" ]; then REPO_OVERRIDE="${2:?-C needs a path}"; shift 2; fi
MSG="${1:?usage: cowork-push.sh [-C <repo>] \"commit message\" [branch]}"
BRANCH_ARG="${2:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if   [ -n "$REPO_OVERRIDE" ];           then REPO_ROOT="$(cd "$REPO_OVERRIDE" && pwd)"
elif [ -n "${COWORK_PUSH_REPO:-}" ];    then REPO_ROOT="$(cd "$COWORK_PUSH_REPO" && pwd)"
elif [ -f "$SCRIPT_DIR/../.cowork-push.conf" ]; then REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
else REPO_ROOT="$PWD"; fi

CONF="$REPO_ROOT/.cowork-push.conf"
# shellcheck disable=SC1090
[ -f "$CONF" ] && . "$CONF"
SLUG="${REMOTE_SLUG:?set REMOTE_SLUG=owner/repo in $CONF}"
BRANCH="${BRANCH_ARG:-${BRANCH:-main}}"

TOKEN_FILE="${KH_GH_TOKEN_FILE:-$REPO_ROOT/../.kh-secrets/gh-token}"
if [ ! -f "$TOKEN_FILE" ]; then
  echo "ERROR: GitHub token file not found: $TOKEN_FILE" >&2
  echo "       Create a fine-grained PAT and save it there (see references/token-setup.md)." >&2
  exit 1
fi
TOKEN="$(tr -d ' \t\r\n' < "$TOKEN_FILE")"
[ -n "$TOKEN" ] || { echo "ERROR: token file is empty: $TOKEN_FILE" >&2; exit 1; }

AUTH="Authorization: Basic $(printf 'x-access-token:%s' "$TOKEN" | base64 | tr -d '\n')"
URL="https://github.com/$SLUG.git"
WORK="${COWORK_PUSH_DIR:-$HOME/.cowork-push}/$(basename "$REPO_ROOT")"

echo "repo:   $REPO_ROOT"
echo "remote: $SLUG  (branch: $BRANCH)"

rm -rf "$WORK"; mkdir -p "$(dirname "$WORK")"
if git -c http.extraheader="$AUTH" clone --quiet --branch "$BRANCH" "$URL" "$WORK" 2>/dev/null; then
  echo "cloned existing $BRANCH"
else
  echo "branch '$BRANCH' not found remotely — starting it fresh"
  if ! git -c http.extraheader="$AUTH" clone --quiet "$URL" "$WORK" 2>/dev/null; then
    mkdir -p "$WORK"; git -C "$WORK" init -q
  fi
  git -C "$WORK" checkout -q -B "$BRANCH"
fi

git -C "$WORK" remote get-url origin >/dev/null 2>&1 || git -C "$WORK" remote add origin "$URL"
git -C "$WORK" config user.name  "${GIT_AUTHOR_NAME:-KH}"
git -C "$WORK" config user.email "${GIT_AUTHOR_EMAIL:-kh@kh-group.eu}"

rsync -a --delete \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='.wrangler/' \
  --exclude='.DS_Store' \
  "$REPO_ROOT/" "$WORK/"

git -C "$WORK" add -A
if git -C "$WORK" diff --cached --quiet; then
  echo "nothing to push (working tree matches remote $BRANCH)"
  exit 0
fi
git -C "$WORK" commit -q -m "$MSG"
git -C "$WORK" -c http.extraheader="$AUTH" push --quiet -u origin "$BRANCH"
echo "pushed → $SLUG@$BRANCH ✓  Cloudflare will build the changed app(s)."

# --- mirror cloud → local (host auto-sync) -----------------------------------------
# Drop a marker the host LaunchAgent watches; it runs `git fetch + reset --hard` on the
# local clone (origin is ahead → lossless) and DELETES the marker when the sync succeeds.
# A vanished marker therefore means "local now matches the cloud". The .installed presence
# file (created by the install step) tells us the auto-sync exists, so we only wait for
# confirmation when it can actually happen — no delay for users who haven't set it up.
SYNC_DIR="${COWORK_SYNC_DIR:-$REPO_ROOT/../.cowork-sync}"
NAME="$(basename "$REPO_ROOT")"
MARKER="$SYNC_DIR/$NAME.pushed"
mkdir -p "$SYNC_DIR" 2>/dev/null && printf '%s\n' "$BRANCH" > "$MARKER" 2>/dev/null || true
if [ -f "$SYNC_DIR/.installed" ]; then
  synced=""
  for _ in $(seq 1 20); do [ -f "$MARKER" ] || { synced=1; break; }; sleep 0.5; done
  if [ -n "$synced" ]; then
    echo "local mirror synced ✓  ~/Projects/$NAME now matches origin/$BRANCH (cloud == local)."
  else
    echo "note: auto-sync didn't confirm in ~10s — see ~/Projects/.cowork-sync/cowork-sync.log."
    echo "      sync now if needed: git -C ~/Projects/$NAME fetch origin && git -C ~/Projects/$NAME reset --hard origin/$BRANCH"
  fi
else
  echo "note: local auto-sync not installed — your local ~/Projects/$NAME is NOT updated by this push (the cloud is)."
  echo "      one-time setup makes it automatic: skills/cowork-push/references/local-sync.md"
fi
