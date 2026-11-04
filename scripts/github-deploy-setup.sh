#!/usr/bin/env bash
# One-time setup for .github/workflows/deploy.yml: lets GitHub Actions of this repository deploy Health AI without any stored key
# (Workload Identity Federation). Run it once in Cloud Shell (shell.cloud.google.com works from a phone), signed in as a project
# owner. Safe to run again.
#
#   PROJECT_ID=my-project bash github-deploy-setup.sh
#
# It prints the two repository variables to add on GitHub (Settings → Secrets and variables → Actions → Variables).
set -euo pipefail
PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null)}"
[ -n "$PROJECT_ID" ] || { echo "set PROJECT_ID" >&2; exit 1; }
REPO="${REPO:-arpadtamasi/health-ai}"
SA="health-ai-deploy@${PROJECT_ID}.iam.gserviceaccount.com"
RUN_SA="health-ai-run@${PROJECT_ID}.iam.gserviceaccount.com"
NUMBER="$(gcloud projects describe "$PROJECT_ID" --format 'value(projectNumber)')"
gc() { gcloud --project "$PROJECT_ID" --quiet "$@"; }

gc services enable iamcredentials.googleapis.com sts.googleapis.com cloudbuild.googleapis.com run.googleapis.com firebasehosting.googleapis.com >/dev/null

gc iam service-accounts describe "$SA" >/dev/null 2>&1 || gc iam service-accounts create health-ai-deploy --display-name "Health AI deploy (GitHub Actions)"
# What `gcloud run deploy --source` and `firebase deploy --only hosting` need.
for role in roles/run.admin roles/cloudbuild.builds.editor roles/artifactregistry.writer roles/storage.admin \
            roles/firebasehosting.admin roles/serviceusage.serviceUsageConsumer roles/logging.viewer roles/iam.serviceAccountUser; do
  gc projects add-iam-policy-binding "$PROJECT_ID" --member "serviceAccount:$SA" --role "$role" --condition None >/dev/null
done

gc iam workload-identity-pools describe github --location global >/dev/null 2>&1 || \
  gc iam workload-identity-pools create github --location global --display-name "GitHub Actions"
gc iam workload-identity-pools providers describe github --location global --workload-identity-pool github >/dev/null 2>&1 || \
  gc iam workload-identity-pools providers create-oidc github --location global --workload-identity-pool github \
    --issuer-uri https://token.actions.githubusercontent.com \
    --attribute-mapping "google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref" \
    --attribute-condition "assertion.repository == '${REPO}'"
gc iam service-accounts add-iam-policy-binding "$SA" --role roles/iam.workloadIdentityUser \
  --member "principalSet://iam.googleapis.com/projects/${NUMBER}/locations/global/workloadIdentityPools/github/attribute.repository/${REPO}" >/dev/null
gc iam service-accounts describe "$RUN_SA" >/dev/null 2>&1 || echo "warning: $RUN_SA is missing; run scripts/gcp-setup.sh first" >&2

cat <<OUT

Done. Add these two repository variables on GitHub (Settings → Secrets and variables → Actions → Variables):
  GCP_PROJECT_ID   = ${PROJECT_ID}
  GCP_WIF_PROVIDER = projects/${NUMBER}/locations/global/workloadIdentityPools/github/providers/github
Then run the Deploy workflow (Actions → Deploy → Run workflow).
OUT
