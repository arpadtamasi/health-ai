#!/usr/bin/env bash
# Builds the server container, deploys it to Cloud Run, then deploys Firebase Hosting, which
# rewrites every path to the Cloud Run service so the sign-in pages, the OAuth endpoints and /mcp
# share one HTTPS origin (design D8). Run scripts/gcp-setup.sh first.
#
#   PROJECT_ID=my-project PUBLIC_URL=https://my-project.web.app GOOGLE_CLIENT_ID=... \
#   GOOGLE_HEALTH_READ_SCOPES="..." GOOGLE_HEALTH_WRITE_SCOPES="..." scripts/deploy.sh
#
# Needs: gcloud (signed in) and npx (for firebase-tools, signed in with `npx firebase-tools login`).
set -euo pipefail

PROJECT_ID="${PROJECT_ID:?set PROJECT_ID}"
PUBLIC_URL="${PUBLIC_URL:?set PUBLIC_URL, the Firebase Hosting origin, e.g. https://${PROJECT_ID}.web.app}"
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:?set GOOGLE_CLIENT_ID}"
GOOGLE_HEALTH_READ_SCOPES="${GOOGLE_HEALTH_READ_SCOPES:?set GOOGLE_HEALTH_READ_SCOPES}"
GOOGLE_HEALTH_WRITE_SCOPES="${GOOGLE_HEALTH_WRITE_SCOPES:-}"
REGION="${REGION:-europe-west1}"
SERVICE="${SERVICE:-health-ai}"
SERVICE_ACCOUNT="${SERVICE_ACCOUNT:-health-ai-run@${PROJECT_ID}.iam.gserviceaccount.com}"
KMS_KEY_NAME="${KMS_KEY_NAME:-projects/${PROJECT_ID}/locations/${REGION}/keyRings/health-ai/cryptoKeys/google-tokens}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$(mktemp)"
trap 'rm -f "$ENV_FILE"' EXIT
# A YAML env file keeps the space-separated scope lists intact.
cat > "$ENV_FILE" <<ENV
PUBLIC_URL: "${PUBLIC_URL}"
GOOGLE_CLIENT_ID: "${GOOGLE_CLIENT_ID}"
GOOGLE_HEALTH_READ_SCOPES: "${GOOGLE_HEALTH_READ_SCOPES}"
GOOGLE_HEALTH_WRITE_SCOPES: "${GOOGLE_HEALTH_WRITE_SCOPES}"
KMS_KEY_NAME: "${KMS_KEY_NAME}"
ENV

echo "== Cloud Run: ${SERVICE} (${REGION})"
gcloud run deploy "$SERVICE" --project "$PROJECT_ID" --region "$REGION" --quiet \
  --source "$ROOT/server" \
  --service-account "$SERVICE_ACCOUNT" \
  --env-vars-file "$ENV_FILE" \
  --set-secrets "JWT_SECRET=health-ai-jwt-secret:latest,GOOGLE_CLIENT_SECRET=health-ai-google-client-secret:latest" \
  --allow-unauthenticated \
  --min-instances 0 --max-instances 3 --memory 512Mi --timeout 60

echo "== Firebase Hosting"
(cd "$ROOT" && npx --yes firebase-tools@latest deploy --only hosting --project "$PROJECT_ID" --non-interactive)

echo "== Smoke check"
curl -fsS "${PUBLIC_URL}/health" && echo
curl -fsS "${PUBLIC_URL}/.well-known/oauth-protected-resource/mcp" >/dev/null && echo "metadata ok"
echo "MCP URL for Claude: ${PUBLIC_URL}/mcp"
