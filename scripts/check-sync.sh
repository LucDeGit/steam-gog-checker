#!/usr/bin/env bash
# The chromium/ and firefox/ variants must share identical functional code;
# only manifest.json (and per-variant READMEs) may differ.
# Usage: scripts/check-sync.sh          -> fail if the copies differ
#        scripts/check-sync.sh --fix    -> copy chromium/ files over firefox/
set -euo pipefail
cd "$(dirname "$0")/.."

SHARED=(background.js content.js styles.css rules.json icon48.png icon128.png LICENSE .gitignore)
status=0
for f in "${SHARED[@]}"; do
  if ! cmp -s "chromium/$f" "firefox/$f"; then
    if [[ "${1:-}" == "--fix" ]]; then
      cp "chromium/$f" "firefox/$f"
      echo "synced $f"
    else
      echo "::error file=firefox/$f::firefox/$f differs from chromium/$f (run scripts/check-sync.sh --fix)"
      status=1
    fi
  fi
done
exit $status
