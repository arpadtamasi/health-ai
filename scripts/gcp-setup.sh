#!/usr/bin/env bash
# Creates the Google Cloud resources Health AI runs on (task 2.2). Safe to run again:
# every step checks what exists and only creates what is missing.
#
#   PROJECT_ID=my-project scripts/gcp-setup.sh
#
# Needs: gcloud, signed in as a project owner (gcloud auth login), openssl and GNU date
# (Cloud Shell has all of them).
set -euo pipefail

PROJECT_ID="${PROJECT_ID:?set PROJECT_ID}"
REGION="${REGION:-europe-west1}"
SERVICE_ACCOUNT_NAME="${SERVICE_ACCOUNT_NAME:-health-ai-run}"
KEY_RING="${KEY_RING:-health-ai}"
KEY_NAME="${KEY_NAME:-google-tokens}"
# Collections with an `expireAt` field (server/src/store/firestore.ts, TTL_COLLECTIONS).
TTL_COLLECTIONS="authRequests authCodes refreshTokens reconnectNonces feedback intents"
SECRETS="health-ai-jwt-secret health-ai-google-client-secret"

SA_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
KEY_PATH="projects/${PROJECT_ID}/locations/${REGION}/keyRings/${KEY_RING}/cryptoKeys/${KEY_NAME}"
gc() { gcloud --project "$PROJECT_ID" --quiet "$@"; }
step() { printf '\n== %s\n' "$*"; }

step "APIs"
gc services enable run.googleapis.com firestore.googleapis.com cloudkms.googleapis.com \
  secretmanager.googleapis.com artifactregistry.googleapis.com iamcredentials.googleapis.com

step "Service account ${SA_EMAIL}"
if ! gc iam service-accounts describe "$SA_EMAIL" >/dev/null 2>&1; then
  gc iam service-accounts create "$SERVICE_ACCOUNT_NAME" --display-name "Health AI (Cloud Run)"
fi
gc projects add-iam-policy-binding "$PROJECT_ID" --member "serviceAccount:${SA_EMAIL}" \
  --role roles/datastore.user --condition None >/dev/null

step "Firestore (native mode, ${REGION})"
if ! gc firestore databases describe --database "(default)" >/dev/null 2>&1; then
  gc firestore databases create --database "(default)" --location "$REGION" --type firestore-native
fi

step "Firestore TTL on expireAt"
for collection in $TTL_COLLECTIONS; do
  if gc firestore fields ttls list --collection-group "$collection" --format 'value(name)' | grep -q '/fields/expireAt$'; then
    echo "$collection: TTL already set"
  else
    gc firestore fields ttls update expireAt --collection-group "$collection" --enable-ttl --async
  fi
done

step "Cloud KMS key ${KEY_PATH}"
if ! gc kms keyrings describe "$KEY_RING" --location "$REGION" >/dev/null 2>&1; then
  gc kms keyrings create "$KEY_RING" --location "$REGION"
fi
if ! gc kms keys describe "$KEY_NAME" --keyring "$KEY_RING" --location "$REGION" >/dev/null 2>&1; then
  gc kms keys create "$KEY_NAME" --keyring "$KEY_RING" --location "$REGION" --purpose encryption \
    --rotation-period 90d --next-rotation-time "$(date -u -d '+90 days' +%Y-%m-%dT%H:%M:%SZ)"
fi
gc kms keys add-iam-policy-binding "$KEY_NAME" --keyring "$KEY_RING" --location "$REGION" \
  --member "serviceAccount:${SA_EMAIL}" --role roles/cloudkms.cryptoKeyEncrypterDecrypter >/dev/null

step "Secret Manager"
for secret in $SECRETS; do
  if ! gc secrets describe "$secret" >/dev/null 2>&1; then
    gc secrets create "$secret" --replication-policy user-managed --locations "$REGION"
  fi
  gc secrets add-iam-policy-binding "$secret" --member "serviceAccount:${SA_EMAIL}" \
    --role roles/secretmanager.secretAccessor >/dev/null
done
if [[ -z "$(gc secrets versions list health-ai-jwt-secret --filter 'state=ENABLED' --format 'value(name)' --limit 1)" ]]; then
  openssl rand -base64 48 | tr -d '\n' | gc secrets versions add health-ai-jwt-secret --data-file -
fi

step "Done"
cat <<SUMMARY
Service account:  ${SA_EMAIL}
KMS_KEY_NAME:     ${KEY_PATH}
JWT_SECRET:       secret health-ai-jwt-secret
Client secret:    secret health-ai-google-client-secret
SUMMARY
if [[ -z "$(gc secrets versions list health-ai-google-client-secret --filter 'state=ENABLED' --format 'value(name)' --limit 1)" ]]; then
  echo
  echo "Next: create the Google OAuth client (task 2.3), then store its secret:"
  echo "  printf %s 'CLIENT_SECRET' | gcloud --project ${PROJECT_ID} secrets versions add health-ai-google-client-secret --data-file -"
fi
echo "Allow list: add Firestore documents allowList/<email> = { email, owner } (see docs/auth.md)."
