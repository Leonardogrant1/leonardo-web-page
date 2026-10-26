#!/usr/bin/env bash
# Lokale Preview mit Auto-Rebuild: ./dev.sh → http://localhost:8742
# Ändert sich content.json, styles.css oder assets/, wird dist/ automatisch
# neu gebaut — im Browser dann einfach neu laden.
set -euo pipefail
cd "$(dirname "$0")"

node build.mjs
python3 -m http.server 8742 -d dist &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null' EXIT

echo "Preview: http://localhost:8742 (Beenden mit Ctrl+C)"
node --watch --watch-path=content.json --watch-path=styles.css --watch-path=assets build.mjs
