# Deploy and rollback

Health AI runs as one Cloud Run service (`health-ai`, `europe-west1`) behind Firebase Hosting.
Hosting rewrites every path to the service, so the sign-in pages, the OAuth endpoints and `/mcp`
share one HTTPS origin (design D8). Plain HTTP is never served: Hosting redirects it to HTTPS.

## Once per project

The quickest way is `scripts/bootstrap.sh`. It walks through every step below, stops where the
console is needed, and saves the settings in `.health-ai.env` (no secrets). The steps it runs:

1. Create or pick a Google Cloud project, and add Firebase to it (Firebase console → *Add project* →
   choose the existing Cloud project).
2. Run the resource setup. It is idempotent, so running it again only reports what exists:

   ```bash
   PROJECT_ID=my-project scripts/gcp-setup.sh
   ```

3. Create the Google OAuth client (task 2.3), with the redirect URI
   `https://<hosting domain>/oauth/google/callback`. Store its secret with the command the setup
   script prints.
4. Add the owner to the allow list: the Firestore document `allowList/<email>` with
   `{ email: "<email>", owner: true }` (see `docs/auth.md`).

## Deploy

```bash
PROJECT_ID=my-project \
PUBLIC_URL=https://my-project.web.app \
GOOGLE_CLIENT_ID=….apps.googleusercontent.com \
GOOGLE_HEALTH_READ_SCOPES="$(printf 'https://www.googleapis.com/auth/googlehealth.%s ' sleep.readonly activity_and_fitness.readonly health_metrics_and_measurements.readonly profile.readonly settings.readonly)" \
GOOGLE_HEALTH_WRITE_SCOPES="https://www.googleapis.com/auth/googlehealth.nutrition.writeonly" \
scripts/deploy.sh
```

The scopes follow `docs/google-health-api.md`. Nutrition (meals and water) has only a write scope, so
Health AI can read back only the entries it logged itself.

`scripts/deploy.sh` runs the two halves, which can also run on their own with the same variables
(or the ones `scripts/bootstrap.sh` saved in `.health-ai.env`):

1. **Backend**, `scripts/deploy-backend.sh`: builds `server/` with its Dockerfile through Cloud
   Build and deploys a new Cloud Run revision with the `health-ai-run` service account. Secrets come
   from Secret Manager. Checks `/health` and the protected resource metadata through the Hosting
   origin.
2. **Frontend**, `scripts/deploy-frontend.sh`: builds the landing page (`site/`, Astro) with
   `PUBLIC_URL` and `GOOGLE_HEALTH_WRITE_SCOPES`, deploys Firebase Hosting from `firebase.json`,
   and checks that `/` shows the MCP URL. Needs only `PROJECT_ID`, `PUBLIC_URL` and the write
   scopes.

In Claude, add a custom connector with the URL `https://<hosting domain>/mcp`.

## Rollback

Every deploy creates a new Cloud Run revision, and the old ones stay available. To roll back:

```bash
gcloud run revisions list --service health-ai --region europe-west1 --project my-project
gcloud run services update-traffic health-ai --region europe-west1 --project my-project \
  --to-revisions <previous-revision>=100
```

A Cloud Run rollback does not touch the landing page, and a Hosting rollback does not touch the
server. To roll back Hosting (the landing page and the rewrite rules): Firebase console → *Hosting* → *Release history* → *Roll back*.

The next `scripts/deploy.sh` sends all traffic to the new revision again.

## Notes

- The service scales to zero, so the first request after idle has a cold start of a few seconds.
- Cloud Run reserves paths that end in `z`. Use `/health`, not `/healthz`, against the deployed service.
