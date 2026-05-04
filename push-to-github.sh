#!/bin/bash
# DEPRECATED — GitHub sync now happens automatically.
#
# Every commit (including Replit checkpoints) is mirrored to GitHub via the
# git post-commit hook installed by scripts/install-git-hooks.sh.
# The hook calls scripts/github-sync.sh, which requires GITHUB_TOKEN to be
# set as a Replit secret.
#
# You only need to run this script manually if the hook has been lost and
# you need an immediate one-off push before the next task merge restores it.

set -e

git config user.email "yavoyweb@gmail.com"
git config user.name "YaVoy"

git remote add github "https://daps000:${GITHUB_TOKEN}@github.com/daps000/yavoy.git" 2>/dev/null \
  || git remote set-url github "https://daps000:${GITHUB_TOKEN}@github.com/daps000/yavoy.git"

git push --force github main

echo ""
echo "Done! Code is now live at https://github.com/daps000/yavoy"
