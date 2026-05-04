#!/bin/bash
# Shared logic for syncing the Replit main branch to GitHub.
# Called by both the post-commit git hook and the post-merge script.

if [ -z "$GITHUB_TOKEN" ]; then
  echo "[github-sync] GITHUB_TOKEN not set — skipping GitHub sync"
  exit 0
fi

git remote add github "https://daps000:${GITHUB_TOKEN}@github.com/daps000/yavoy.git" 2>/dev/null \
  || git remote set-url github "https://daps000:${GITHUB_TOKEN}@github.com/daps000/yavoy.git"

# Use --force to mirror Replit (source of truth) onto GitHub.
# This is intentional: Replit owns the canonical history; GitHub is a read mirror.
if git push --force github main 2>&1; then
  echo "[github-sync] Synced to https://github.com/daps000/yavoy"
else
  echo "[github-sync] Push failed — will retry on next commit"
fi
