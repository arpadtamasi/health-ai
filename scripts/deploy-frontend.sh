#!/usr/bin/env bash
# Frontend: builds the app (app/, Expo web export) and serves it at "/" from Firebase Hosting, together with the static files of
# site/ (icons). Hosting rewrites the API, MCP and OAuth paths to the Cloud Run service; every other path is the app.
#
#   PROJECT_ID=my-project PUBLIC_URL=https://my-project.web.app \
#   GOOGLE_HEALTH_WRITE_SCOPES="..." scripts/deploy-frontend.sh
#
# GOOGLE_HEALTH_WRITE_SCOPES only decides whether the page shows the meal example; keep it the same
# as the backend's. Needs: npm and npx (firebase-tools, signed in with `npx firebase-tools login`).
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/deploy-env.sh"

echo "== Static files (site/)"
(cd "$ROOT/site" && npm ci && \
  PUBLIC_URL="$PUBLIC_URL" GOOGLE_HEALTH_WRITE_SCOPES="$GOOGLE_HEALTH_WRITE_SCOPES" npm run build)

echo "== App (app/, Expo web export into site/dist)"
# --clear: Metro caches transformed files together with the EXPO_PUBLIC_* values they were built with, so a build made earlier
# with EXPO_PUBLIC_MOCK=1 would otherwise be reused. EXPO_PUBLIC_MOCK is emptied: the deployed app never runs on sample data.
APP_OUT="$(mktemp -d)"
(cd "$ROOT/app" && npm ci && CI=1 EXPO_PUBLIC_MOCK= npx expo export --clear --platform web --output-dir "$APP_OUT")
rm -f "$ROOT/site/dist/index.html"   # the old landing page; the app's signed-out screen replaces it
cp -R "$APP_OUT"/. "$ROOT/site/dist/"
if grep -rqs "Sample mode: the model is not connected" "$ROOT/site/dist/_expo"; then
  echo "ERROR: the app build contains the sample-data mode; refusing to deploy it." >&2
  exit 1
fi

echo "== Firebase Hosting"
(cd "$ROOT" && npx --yes firebase-tools@latest deploy --only hosting --project "$PROJECT_ID" --non-interactive)

echo "== Frontend smoke check"
curl -fsS "${PUBLIC_URL}/" | grep -q "<div id=\"root\"" && echo "app ok"
[ "$(curl -s -o /dev/null -w '%{http_code}' "${PUBLIC_URL}/api/app/me")" = "401" ] && echo "api ok"
[ "$(curl -s -o /dev/null -w '%{http_code}' -X POST "${PUBLIC_URL}/mcp")" = "401" ] && echo "mcp ok"
