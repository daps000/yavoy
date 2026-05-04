#!/bin/bash
# Run this once from the Replit Shell tab to push to GitHub
# Your GITHUB_TOKEN is already stored as a Replit secret

set -e

git config user.email "yavoyweb@gmail.com"
git config user.name "YaVoy"

git remote add github "https://daps000:${GITHUB_TOKEN}@github.com/daps000/yavoy.git" 2>/dev/null \
  || git remote set-url github "https://daps000:${GITHUB_TOKEN}@github.com/daps000/yavoy.git"

git push github main

echo ""
echo "✓ Done! Code is now live at https://github.com/daps000/yavoy"
