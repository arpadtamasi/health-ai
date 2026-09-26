# Authentication and access

Health AI is its own OAuth 2.1 authorization server for MCP clients, and federates sign-in to Google.
One Google sign-in gives both the user's identity and access to their Google Health data
(design D3 in `openspec/changes/add-health-mcp-core/design.md`).

## Endpoints

| Path | Purpose |
|---|---|
| `/.well-known/oauth-protected-resource/mcp` | Protected resource metadata for `/mcp` |
| `/.well-known/oauth-authorization-server` | Authorization server metadata |
| `/register` | Dynamic client registration (HTTPS or loopback redirect URIs only) |
| `/authorize` | Start of sign-in: shows the start page, then sends the user to Google |
| `/oauth/google/callback` | Google returns here; allow-list and scope checks |
| `/token` | Authorization code (PKCE S256) and refresh token grants |
| `/revoke` | Token revocation |
| `/reconnect?t=…` | Signed, single-use link that restarts Google sign-in after access expired |
| `/mcp` | The MCP endpoint; `POST` only, bearer token required |

## The flow

1. The MCP client (Claude) finds the metadata, registers itself at `/register`, and opens
   `/authorize` with a PKCE challenge.
2. The server stores the request for 10 minutes and shows the start page. **Continue with Google**
   asks Google for `openid email`, the Google Health read scopes and the write scopes, with
   offline access and `prompt=select_account consent`.
3. On the callback the server checks, in order:
   - the account is on the allow list. If not, the Google grant is revoked, nothing is stored and
     the user sees *This account isn't invited*;
   - the read scopes were granted. If not, the user sees *Permissions are missing*. The write scopes
     are optional: without them the client gets only `health.read`;
   - Google returned a refresh token.
4. The Google refresh token is sealed (encrypted) and stored with the user record, keyed by the Google
   account id (`sub`). The *You're connected* page returns to the client after 1.5 seconds, or at
   once with its button.
5. The client exchanges the one-time code (valid for 2 minutes) at `/token` with its PKCE verifier.

## Tokens

- **Access token**: an HS256 JWT signed with `JWT_SECRET`, valid for 15 minutes, with the audience
  set to the `/mcp` URL. Every `/mcp` request also checks that the grant is not revoked and the user
  still exists.
- **Refresh token**: opaque and stored only as a SHA-256 hash. Each use rotates it. Reusing an old
  one revokes the whole grant, which signs out that client.
- **Google tokens**: the refresh token is stored sealed. Access tokens are cached in memory per
  instance and never leave the server.

## When Google access expires

While the Google OAuth app is in Testing mode, Google refresh tokens expire after about a week. The
next tool call then gets `invalid_grant` from Google. The user is marked `needs_reconnect`, and the
tool returns an error with a reconnect link that is valid for one hour and works once. The link opens
*Google access expired*, then Google sign-in with the same account hinted. The user record, including
its feedback and intents, is kept.

## Allow list and owner

Only allow-listed Google accounts can sign in. One entry may be marked as the owner: the owner also
gets the `list_feedback` and `usage_summary` tools.

**Now (in-memory store):** the list comes from environment variables, and it is read at start-up.

```bash
ALLOW_LIST="owner@gmail.com,tester@gmail.com"   # comma-separated, case-insensitive
OWNER_EMAIL="owner@gmail.com"
```

To add a tester, append their address to `ALLOW_LIST` and redeploy (a new Cloud Run revision picks it
up). With the in-memory store, a restart also signs everyone out. It is for local development only.

**After task 2.2 (Firestore):** each entry is a document in the `allowList` collection. The document
id is the lower-cased email and the fields are `{ email, owner }`. To add a tester:

1. Add the account as a test user of the Google OAuth consent screen: Google Cloud console →
   *Google Auth Platform* → *Audience* → *Test users*. Testing mode allows at most 100.
2. Create `allowList/<email>` with `{ email: "<email>", owner: false }`, for example in the Firestore
   console. No redeploy is needed.
3. The tester adds the server URL as a custom connector in Claude and signs in.

To remove a tester, delete their `allowList` document. This blocks new sign-ins. Existing sessions end
when the user calls `delete_my_data`, or when their grants are revoked.

## Deleting a user's data

`delete_my_data`, called with `confirm: true`, does three things:

- It revokes the Google grant.
- It deletes the user record, grants, refresh tokens, codes, reconnect nonces, feedback and intents.
- It signs out every client, so the previous access token gets 401.

If Google cannot be reached, the local data is deleted anyway, and the user is told to remove access
at <https://myaccount.google.com/permissions>.

## Configuration

| Variable | Meaning |
|---|---|
| `PUBLIC_URL` | Public origin; also the OAuth issuer |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | The Google OAuth client (task 2.3) |
| `GOOGLE_HEALTH_READ_SCOPES` | Required Google Health scopes, space or comma separated |
| `GOOGLE_HEALTH_WRITE_SCOPES` | Optional scopes for the write tools |
| `JWT_SECRET` | At least 32 bytes; signs access tokens and reconnect links |
| `SEALER_KEY` | 32 bytes, base64; the local sealer until Cloud KMS (task 2.2) |
| `ALLOW_LIST`, `OWNER_EMAIL` | The allow list while the in-memory store is used |
