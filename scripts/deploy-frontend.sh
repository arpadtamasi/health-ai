#!/usr/bin/env bash
# Frontend: builds the static landing page (site/, Astro) and deploys Firebase Hosting, which serves
# its files and rewrites every other path to the Cloud Run service.
#
#   PROJECT_ID=my-project PUBLIC_URL=https://my-project.web.app \
#   GOOGLE_HEALTH_WRITE_SCOPES="..." scripts/deploy-frontend.sh
#
# GOOGLE_HEALTH_WRITE_SCOPES only decides whether the page shows the meal example; keep it the same
# as the backend's. Needs: npm and npx (firebase-tools, signed in with `npx firebase-tools login`).
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/deploy-env.sh"

echo "== Landing page (site/)"
(cd "$ROOT/site" && npm ci && \
  PUBLIC_URL="$PUBLIC_URL" GOOGLE_HEALTH_WRITE_SCOPES="$GOOGLE_HEALTH_WRITE_SCOPES" npm run build)

echo "== Firebase Hosting"
(cd "$ROOT" && npx --yes firebase-tools@latest deploy --only hosting --project "$PROJECT_ID" --non-interactive)

echo "== Frontend smoke check"
curl -fsS "${PUBLIC_URL}/" | grep -q "${PUBLIC_URL}/mcp" && echo "landing ok"
