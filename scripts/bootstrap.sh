#!/usr/bin/env bash
# Sets up Health AI end to end on your own Google Cloud project, from your machine:
# project and Firebase, cloud resources, the Google OAuth client (with console steps it
# guides you through), the allow list, and the first deploy. Safe to run again: finished
# steps are skipped or repeated harmlessly.
#
#   scripts/bootstrap.sh
#
# Needs: gcloud (signed in: gcloud auth login), node/npx, curl, openssl.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SAVED="$ROOT/.health-ai.env"
GH="https://www.googleapis.com/auth/googlehealth."
READ_SCOPES="${GH}sleep.readonly ${GH}activity_and_fitness.readonly ${GH}health_metrics_and_measurements.readonly ${GH}profile.readonly ${GH}settings.readonly"
WRITE_SCOPES="${GH}nutrition.writeonly"

say() { printf '\n\033[1m== %s\033[0m\n' "$*"; }
ask() { local prompt="$1" default="${2:-}" answer; read -r -p "$prompt${default:+ [$default]}: " answer; echo "${answer:-$default}"; }
pause() { read -r -p "Kész? Nyomj Entert a folytatáshoz… " _; }
saved() { [[ -f "$SAVED" ]] && grep -E "^$1=" "$SAVED" | tail -1 | cut -d= -f2- || true; }
save() { touch "$SAVED"; grep -v -E "^$1=" "$SAVED" > "$SAVED.tmp" || true; echo "$1=$2" >> "$SAVED.tmp"; mv "$SAVED.tmp" "$SAVED"; }

for tool in gcloud npx curl openssl; do
  command -v "$tool" >/dev/null || { echo "Hiányzik: $tool"; exit 1; }
done
ACCOUNT="$(gcloud config get-value account 2>/dev/null)"
[[ -n "$ACCOUNT" ]] || { echo "Előbb: gcloud auth login"; exit 1; }

say "1/7 Projekt"
PROJECT_ID="$(ask "Google Cloud projekt azonosító (új vagy meglévő)" "$(saved PROJECT_ID)")"
if ! gcloud projects describe "$PROJECT_ID" >/dev/null 2>&1; then
  echo "A projekt nem létezik, létrehozom: $PROJECT_ID"
  gcloud projects create "$PROJECT_ID" --name "Health AI"
fi
save PROJECT_ID "$PROJECT_ID"
if [[ "$(gcloud billing projects describe "$PROJECT_ID" --format 'value(billingEnabled)' 2>/dev/null)" != "True" ]]; then
  echo "A projekthez nincs számlázás kapcsolva. Számlázási fiókjaid:"
  gcloud billing accounts list --filter open=true --format 'table(name.basename(), displayName)'
  BILLING="$(ask "Melyiket kapcsoljam (ACCOUNT_ID)")"
  gcloud billing projects link "$PROJECT_ID" --billing-account "$BILLING"
fi
gcloud config set project "$PROJECT_ID" >/dev/null

say "2/7 Firebase"
if npx --yes firebase-tools@latest projects:list --json 2>/dev/null | grep -q "\"$PROJECT_ID\""; then
  echo "A Firebase már hozzá van adva."
else
  npx --yes firebase-tools@latest login || true
  npx --yes firebase-tools@latest projects:addfirebase "$PROJECT_ID" || {
    echo "Nem sikerült parancssorból. Add hozzá itt: https://console.firebase.google.com/ → Add project → válaszd: $PROJECT_ID"
    pause
  }
fi

say "3/7 Felhő-erőforrások (Firestore, KMS, titkok, szolgáltatásfiók)"
PROJECT_ID="$PROJECT_ID" "$ROOT/scripts/gcp-setup.sh"

PUBLIC_URL="https://${PROJECT_ID}.web.app"
save PUBLIC_URL "$PUBLIC_URL"
save GOOGLE_HEALTH_READ_SCOPES "$READ_SCOPES"
save GOOGLE_HEALTH_WRITE_SCOPES "$WRITE_SCOPES"

say "4/7 Google bejelentkezés (OAuth) – ezt a konzolban kell kattintani"
if [[ -n "$(saved GOOGLE_CLIENT_ID)" ]] && [[ "$(ask "Már van OAuth kliens ($(saved GOOGLE_CLIENT_ID)). Új kell? (i/n)" n)" != "i" ]]; then
  CLIENT_ID="$(saved GOOGLE_CLIENT_ID)"
else
  C="https://console.cloud.google.com/auth"
  cat <<STEPS

  a) Branding:   $C/branding?project=$PROJECT_ID
     App name: Health AI · User support email és Developer contact: $ACCOUNT → Save
  b) Audience:   $C/audience?project=$PROJECT_ID
     User type: External, Publishing status: Testing
     Test users → Add users: $ACCOUNT
  c) Data access: $C/scopes?project=$PROJECT_ID
     Add or remove scopes → "Manually add scopes" mezőbe másold be egyben:
       openid, email, $(echo "$READ_SCOPES $WRITE_SCOPES" | tr ' ' ',' | sed 's/,/, /g')
     → Add to table → Update → Save
  d) Clients:    $C/clients?project=$PROJECT_ID
     Create client → Application type: Web application · Name: Health AI
     Authorized redirect URIs → Add URI: ${PUBLIC_URL}/oauth/google/callback
     → Create, és másold ki a Client ID-t és a Client secretet.

STEPS
  CLIENT_ID="$(ask "Client ID")"
  read -r -s -p "Client secret (nem látszik gépelés közben): " CLIENT_SECRET; echo
  printf %s "$CLIENT_SECRET" | gcloud secrets versions add health-ai-google-client-secret --data-file - >/dev/null
  unset CLIENT_SECRET
  save GOOGLE_CLIENT_ID "$CLIENT_ID"
  echo "A secret a Secret Managerbe került (health-ai-google-client-secret)."
fi

say "5/7 Engedélyezett felhasználók"
OWNER="$(ask "A te (tulajdonos) Google-címed" "$ACCOUNT" | tr '[:upper:]' '[:lower:]')"
TOKEN="$(gcloud auth print-access-token)"
curl -fsS -X PATCH -H "authorization: Bearer $TOKEN" -H "x-goog-user-project: $PROJECT_ID" -H "content-type: application/json" \
  "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/allowList/$OWNER" \
  -d "{\"fields\":{\"email\":{\"stringValue\":\"$OWNER\"},\"owner\":{\"booleanValue\":true}}}" >/dev/null
echo "Hozzáadva tulajdonosként: $OWNER"
while true; do
  TESTER="$(ask "Tesztelő Google-címe (üres = nincs több)" "" | tr '[:upper:]' '[:lower:]')"
  [[ -z "$TESTER" ]] && break
  curl -fsS -X PATCH -H "authorization: Bearer $TOKEN" -H "x-goog-user-project: $PROJECT_ID" -H "content-type: application/json" \
    "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/allowList/$TESTER" \
    -d "{\"fields\":{\"email\":{\"stringValue\":\"$TESTER\"},\"owner\":{\"booleanValue\":false}}}" >/dev/null
  echo "Hozzáadva: $TESTER – vedd fel a konzolban is Test userként (Audience oldal)."
done

say "6/7 Telepítés (Cloud Run + Firebase Hosting)"
"$ROOT/scripts/deploy.sh"

say "7/7 Claude"
cat <<DONE
Claude → Settings → Connectors → Add custom connector
  Name: Health AI
  URL:  ${PUBLIC_URL}/mcp
Utána jelentkezz be a Google-fiókoddal ($OWNER), és engedélyezz minden jogot.

A beállítások itt vannak: $SAVED (nincs benne titok). Újratelepítés: scripts/deploy.sh
DONE
