#!/bin/bash
set -e

npm install --legacy-peer-deps
npm run db:push

# Reinstall the git post-commit hook so every future commit auto-syncs to GitHub.
# The hook lives in .git/hooks (not committed) and may be lost on environment reset.
bash scripts/install-git-hooks.sh

# Also sync immediately for the merge commit itself.
bash scripts/github-sync.sh
