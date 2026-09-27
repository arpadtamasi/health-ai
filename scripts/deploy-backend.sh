#!/usr/bin/env bash
# Backend: builds the server container and deploys it to Cloud Run. Firebase Hosting rewrites every
# path it has no file for to this service, so the sign-in pages, the OAuth endpoints and /mcp share
# the landing page's HTTPS origin (design D8). Run scripts/gcp-setup.sh first.
#
#   PROJECT_ID=my-project PUBLIC_URL=https://my-project.web.app GOOGLE_CLIENT_ID=... \
#   GOOGLE_HEALTH_READ_SCOPES="..." GOOGLE_HEALTH_WRITE_SCOPES="..." scripts/deploy-backend.sh
#
# Needs: gcloud (signed in).
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/deploy-env.sh"

GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:?set GOOGLE_CLIENT_ID}"
GOOGLE_HEALTH_READ_SCOPES="${GOOGLE_HEALTH_READ_SCOPES:?set GOOGLE_HEALTH_READ_SCOPES}"
REGION="${REGION:-europe-west1}"
SERVICE="${SERVICE:-health-ai}"
SERVICE_ACCOUNT="${SERVICE_ACCOUNT:-health-ai-run@${PROJECT_ID}.iam.gserviceaccount.com}"
KMS_KEY_NAME="${KMS_KEY_NAME:-projects/${PROJECT_ID}/locations/${REGION}/keyRings/health-ai/cryptoKeys/google-tokens}"

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

echo "== Backend smoke check"
curl -fsS "${PUBLIC_URL}/health" && echo
curl -fsS "${PUBLIC_URL}/.well-known/oauth-protected-resource/mcp" >/dev/null && echo "metadata ok"
