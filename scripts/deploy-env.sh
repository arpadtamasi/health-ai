# Sourced by the deploy scripts: loads the settings scripts/bootstrap.sh saved and checks the ones
# every deploy needs. Variables set in the environment win over the saved ones.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_SAVED="$ROOT/.health-ai.env"
if [[ -f "$ENV_SAVED" ]]; then
  while IFS='=' read -r key value; do
    [[ -z "$key" || "$key" == \#* || -n "${!key:-}" ]] && continue
    export "$key=$value"
  done < "$ENV_SAVED"
fi

PROJECT_ID="${PROJECT_ID:?set PROJECT_ID}"
PUBLIC_URL="${PUBLIC_URL:?set PUBLIC_URL, the Firebase Hosting origin, e.g. https://${PROJECT_ID}.web.app}"
PUBLIC_URL="${PUBLIC_URL%/}"
GOOGLE_HEALTH_WRITE_SCOPES="${GOOGLE_HEALTH_WRITE_SCOPES:-}"
