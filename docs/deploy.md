# Deploy and rollback

Health AI runs as one Cloud Run service (`health-ai`, `europe-west1`) behind Firebase Hosting.
Hosting rewrites every path to the service, so the sign-in pages, the OAuth endpoints and `/mcp`
share one HTTPS origin (design D8). Plain HTTP is never served: Hosting redirects it to HTTPS.

## Once per project

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
GOOGLE_HEALTH_READ_SCOPES="…" \
GOOGLE_HEALTH_WRITE_SCOPES="…" \
scripts/deploy.sh
```

The script:

1. Builds `server/` with its Dockerfile through Cloud Build and deploys a new Cloud Run revision
   with the `health-ai-run` service account. Secrets come from Secret Manager.
2. Deploys Firebase Hosting from `firebase.json`.
3. Checks `/health` and the protected resource metadata through the Hosting origin.

In Claude, add a custom connector with the URL `https://<hosting domain>/mcp`.

## Rollback

Every deploy creates a new Cloud Run revision, and the old ones stay available. To roll back:

```bash
gcloud run revisions list --service health-ai --region europe-west1 --project my-project
gcloud run services update-traffic health-ai --region europe-west1 --project my-project \
  --to-revisions <previous-revision>=100
```

Firebase Hosting only holds the rewrite rules, so a Cloud Run rollback is enough. To roll back
Hosting itself: Firebase console → *Hosting* → *Release history* → *Roll back*.

The next `scripts/deploy.sh` sends all traffic to the new revision again.

## Notes

- The service scales to zero, so the first request after idle has a cold start of a few seconds.
- Cloud Run reserves paths that end in `z`. Use `/health`, not `/healthz`, against the deployed service.
