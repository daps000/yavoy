#!/bin/bash
set -e

npm install --legacy-peer-deps
npm run db:push

if [ -n "$GITHUB_TOKEN" ]; then
  git config user.email "yavoyweb@gmail.com"
  git config user.name "YaVoy"
  git remote add github "https://daps000:${GITHUB_TOKEN}@github.com/daps000/yavoy.git" 2>/dev/null \
    || git remote set-url github "https://daps000:${GITHUB_TOKEN}@github.com/daps000/yavoy.git"
  git push --force github main
  echo "Synced to GitHub: https://github.com/daps000/yavoy"
else
  echo "GITHUB_TOKEN not set — skipping GitHub sync"
fi
