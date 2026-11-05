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
# BR-01m6p2r4vmgte1n2wkwjx0q28w: the build is stamped into the bundle and into /version.json next to the page; the app compares the two
# when it comes back to the front and loads the newer one. The page, version.json and the manifest are served uncached (firebase.json).
BUILD="$(git -C "$ROOT" rev-parse --short=12 HEAD 2>/dev/null || date +%s)-$(date +%s)"
# BR-01m6pmf9avbbgd373z1jcvvaqw: Firebase Hosting holds a streamed response back until it ends, so the app streams the chat straight
# from the Cloud Run service's own address. Without it (no gcloud) the app asks for the whole reply through Hosting, as before.
STREAM_BASE="${STREAM_BASE:-$(gcloud run services describe "${SERVICE:-health-ai}" --project "$PROJECT_ID" --region "${REGION:-europe-west1}" --format 'value(status.url)' 2>/dev/null || true)}"
echo "Stream base: ${STREAM_BASE:-none}"
APP_OUT="$(mktemp -d)"
(cd "$ROOT/app" && npm ci && CI=1 EXPO_PUBLIC_MOCK= EXPO_PUBLIC_BUILD="$BUILD" EXPO_PUBLIC_STREAM_BASE="$STREAM_BASE" npx expo export --clear --platform web --output-dir "$APP_OUT")
printf '{"build":"%s"}\n' "$BUILD" > "$APP_OUT/version.json"
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
[ "$(curl -fsS "${PUBLIC_URL}/version.json")" = "{\"build\":\"$BUILD\"}" ] && echo "version ok"
[ "$(curl -s -o /dev/null -w '%{http_code}' "${PUBLIC_URL}/api/app/me")" = "401" ] && echo "api ok"
[ "$(curl -s -o /dev/null -w '%{http_code}' -X POST "${PUBLIC_URL}/mcp")" = "401" ] && echo "mcp ok"
# BR-01m6pmf9avbbgd373z1jcvvaqw: the streamed chat answers the app's own origin at the service's address.
if [ -n "$STREAM_BASE" ]; then
  [ "$(curl -s -o /dev/null -w '%{http_code}' -X OPTIONS -H "origin: ${PUBLIC_URL%/}" -H 'access-control-request-method: POST' "${STREAM_BASE}/api/stream/chat")" = "204" ] && echo "stream ok"
fi
