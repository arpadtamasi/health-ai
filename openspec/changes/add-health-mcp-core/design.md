# Design

## Context

The repo is empty; this is the first service. See proposal.md (Why) for motivation and the specs for behavior (`mcp-server`, `mcp-auth`, `health-data-tools`).

Constraints that shape the approach:
- The Google Health API v4 (`health.googleapis.com/v4`) replaces the Fitbit Web API, which shuts down on 2026-09-30. Its data-type catalog, scopes and nutrition/hydration write model must be verified against the official documentation before tool schemas are fixed.
- Health scopes are sensitive; without Google verification the OAuth app stays in Testing mode: at most 100 named test users, and refresh tokens expire after about 7 days.
- Clients are remote MCP clients (Claude first) that expect MCP-spec OAuth: protected resource metadata, authorization server metadata, dynamic client registration, PKCE.
- Owner plus a small tester group; cost should stay near zero when idle.

## Goals / Non-Goals

**Goals:**
- One sign-in connects an MCP client to a user's Google Health data.
- A tool surface small enough for a model to use reliably, yet complete relative to the API.
- Health data passes through; the server stores only what it needs to operate (identity, encrypted Google token, OAuth state, allow list).

**Non-Goals:**
- No caching or mirroring of health data in Firestore.
- No server-side AI (food recognition, nutrient estimation, coaching).
- No web UI beyond the minimal pages the OAuth flow needs (consent result, error, reconnect).

## Decisions

### D1. TypeScript on Node.js with the official MCP TypeScript SDK
The TypeScript SDK has first-class Streamable HTTP server support and OAuth helpers for the authorization server role.
- Alternative: Python (FastMCP). Also viable; rejected to keep one language with the OAuth/auth libraries we rely on and because the TS SDK tracks the MCP auth spec most closely.

### D2. Stateless Streamable HTTP on Cloud Run
Run the MCP endpoint in stateless mode (no server-side session affinity; each request carries the bearer token). Cloud Run scales to zero and needs no sticky sessions. Region: `europe-west1`, next to Firestore.
- Alternative: stateful sessions with SSE streams. Rejected: requires session affinity and min instances, and no tool needs server-initiated messages.
- Alternative: Cloud Functions for Firebase. Rejected: less control over HTTP routing and long requests; Cloud Run is the same underlying platform.

### D3. The server is its own OAuth authorization server, federating to Google
The MCP server implements `/authorize`, `/token`, `/register` and the metadata endpoints. `/authorize` stores the client's PKCE request, redirects to Google with `openid email` plus Google Health scopes, `access_type=offline` and `prompt=consent`; the Google callback stores the encrypted Google refresh token, shows a short Connected screen (1–2 s, with a button to continue at once), and then completes the MCP authorization code flow by redirecting to the client. The sign-in pages follow `docs/designs/signin-flow-brief.md` (plain Material Design 3). MCP tokens are the server's own.
- Alternative: pass Google access tokens straight through to the client (Google as the MCP authorization server). Rejected: Google does not support dynamic client registration, and it would expose Google tokens to clients.
- Alternative: Firebase Auth as identity provider. Rejected for now: adds a second identity layer; Google sign-in already yields a stable user id (`sub`).

### D4. Token formats
- MCP access token: signed JWT (15 min), key in Secret Manager, audience = the MCP resource URL. Validated without a database read.
- MCP refresh token: opaque random value, stored hashed in Firestore, rotated on every use; reuse revokes the whole grant.
- Google refresh token: encrypted with a Cloud KMS key (envelope encryption) before being written to Firestore. Google access tokens are cached in memory per instance only.

### D5. Firestore data model
```
users/{googleSub}            email, createdAt, grantedScopes, googleRefreshTokenEnc, status
oauthClients/{clientId}      registered client metadata
authRequests/{id}            pending /authorize state (TTL 10 min)
authCodes/{hash}             one-time codes (TTL 2 min)
refreshTokens/{hash}         userId, clientId, grantId, usedAt (TTL)
allowList/{email}            operator-managed
```
Firestore TTL policies clean up transient collections. All documents are keyed so that per-user deletion is a query on `userId`/`googleSub`.

### D6. Resource-oriented tools (thin mapping)
Eight generic tools plus `delete_my_data` (see `health-data-tools`). A small data-type registry maps each supported type to its API resource path, scopes, and write schema; `list_data_types` is generated from it. Adding a type means one registry entry, not a new tool.
- Alternative: one tool per type and operation (~60–100 tools). Rejected: too many tools degrade model tool selection and consume context.
- Alternative: a single `call_api(method, path, body)` tool. Rejected: no schema guidance for the model and no safe scope checks.

### D7. Errors and reconnect
Upstream errors are mapped to MCP tool errors with readable messages. `invalid_grant` on Google refresh marks the user `needs_reconnect` and returns a signed, single-use reconnect link that restarts Google sign-in for that user.

### D8. Deployment and configuration
Container built from the repo, deployed with a script/CI to Cloud Run. Firebase Hosting serves the static sign-in pages and rewrites `/authorize`, `/callback`, `/token`, `/register`, `/.well-known/*` and `/mcp` to the Cloud Run service, so pages and authorization server share one origin; secrets from Secret Manager; a dedicated service account with only Firestore, KMS decrypt/encrypt and Secret Manager access. Allow list managed as Firestore documents.

## Risks / Trade-offs

- [Google Health API differs from assumptions (data types, nutrition write model, aggregation)] → First task is an API spike that fixes the registry before tool code; specs stay type-agnostic.
- [Testing-mode refresh tokens expire weekly] → Reconnect flow (D7) makes this a single click; revisit verification when opening beyond testers.
- [Storing testers' health-access tokens] → KMS encryption, no health data persisted, no health values in logs, `delete_my_data`, allow list.
- [MCP auth spec and client support keep evolving] → Keep auth endpoints isolated in one module; test against Claude first, then other clients.
- [Cold starts on scale-to-zero] → Acceptable for personal use; set min instances to 1 only if latency becomes a problem.
- [Stateless JWT access tokens cannot be revoked instantly] → Short 15-minute lifetime; `delete_my_data` also deletes the user record, which every tool call loads.

## Migration Plan

Greenfield. Deploy to a single Cloud Run service; rollback = redeploy previous revision. No data migration.

## Open Questions

- Exact Google Health API scope names and which of them are needed for the initial data types (resolved by the spike; does not change the approach).
- Custom domain for the MCP URL vs. the default `run.app` URL.
