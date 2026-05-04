#!/bin/bash
# Installs the post-commit git hook so every commit is mirrored to GitHub.
# This script is called automatically from scripts/post-merge.sh on every
# task merge, keeping the hook current across environment resets.

set -e

HOOK_DIR="$(git rev-parse --git-dir)/hooks"
HOOK_PATH="$HOOK_DIR/post-commit"
SYNC_SCRIPT="$(pwd)/scripts/github-sync.sh"

mkdir -p "$HOOK_DIR"

cat > "$HOOK_PATH" <<EOF
#!/bin/bash
# Auto-installed by scripts/install-git-hooks.sh
# Mirrors every commit to GitHub.
"$SYNC_SCRIPT"
EOF

chmod +x "$HOOK_PATH"
chmod +x "$SYNC_SCRIPT"

echo "[install-git-hooks] post-commit hook installed at $HOOK_PATH"
