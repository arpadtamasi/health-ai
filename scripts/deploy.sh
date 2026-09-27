#!/usr/bin/env bash
# Deploys both halves: the backend (Cloud Run, scripts/deploy-backend.sh), then the frontend (the
# landing page on Firebase Hosting, scripts/deploy-frontend.sh). Either can run on its own.
#
#   PROJECT_ID=my-project PUBLIC_URL=https://my-project.web.app GOOGLE_CLIENT_ID=... \
#   GOOGLE_HEALTH_READ_SCOPES="..." GOOGLE_HEALTH_WRITE_SCOPES="..." scripts/deploy.sh
set -euo pipefail
DIR="$(dirname "${BASH_SOURCE[0]}")"

"$DIR/deploy-backend.sh"
"$DIR/deploy-frontend.sh"
source "$DIR/deploy-env.sh"
echo "MCP URL for Claude: ${PUBLIC_URL}/mcp"
