# Tasks

## 1. Google Health API spike

- [ ] 1.1 Verify from the official Google Health API v4 docs the data-type catalog, scope names, read/aggregate endpoints, and the nutrition-log and hydration write/update/delete model; record findings in `docs/google-health-api.md` and verify the doc names a concrete endpoint and scope for every tool in `health-data-tools`
- [ ] 1.2 Make authenticated test calls (OAuth playground or script with the owner's account) for sleep, heart rate, steps read, and one nutrition + one hydration write/delete; verify the written entries appear in and disappear from the Google Health app

## 2. Project and cloud setup

- [ ] 2.1 Scaffold the TypeScript service (package.json, tsconfig, lint, test runner, Dockerfile) and verify `npm test` and `docker build` succeed on an empty test suite
- [ ] 2.2 Create the GCP project resources (Cloud Run service account, Firestore in `europe-west1`, KMS key ring/key, Secret Manager secret for the JWT signing key, Firestore TTL policies) via a checked-in script and verify it is idempotent by running it twice
- [ ] 2.3 Create the Google OAuth client and consent screen in Testing mode with the scopes from 1.1 and add the owner as test user; verify the owner can complete Google sign-in in the OAuth playground with those scopes

## 3. MCP OAuth authorization server (`mcp-auth`)

- [ ] 3.1 Implement protected resource metadata and authorization server metadata endpoints; verify with tests that the JSON matches the MCP authorization spec (issuer, endpoints, grants, `S256`)
- [ ] 3.2 Implement dynamic client registration with redirect URI validation; verify tests for accepted HTTPS/loopback and rejected other URIs
- [ ] 3.3 Implement `/authorize` → Google sign-in → callback, allow-list check, scope check and KMS-encrypted refresh token storage; verify tests for granted, denied, partial-scope and non-allow-listed accounts (Google mocked)
- [ ] 3.4 Implement `/token` for authorization code (PKCE) and rotating refresh tokens with reuse detection; verify tests for code exchange, rotation, and grant revocation on reuse
- [ ] 3.5 Implement bearer token validation middleware returning 401 with `WWW-Authenticate` resource metadata; verify tests for missing, expired and revoked tokens
- [ ] 3.6 Implement Google access token refresh with `invalid_grant` handling and signed single-use reconnect links; verify tests that a tool call after `invalid_grant` returns the reconnect error and that reconnecting keeps the user record
- [ ] 3.7 Build the sign-in pages (start, connected, access expired, not invited, permissions missing, error) per `docs/designs/signin-flow-brief.md` in plain Material Design 3; verify the Connected screen continues to the client after 1–2 s and its button returns immediately
- [ ] 3.8 Document the auth flow and operator allow-list management in `docs/auth.md`; verify the documented steps add a tester who can then sign in

## 4. MCP server and health data tools (`mcp-server`, `health-data-tools`)

- [ ] 4.1 Wire the stateless Streamable HTTP MCP endpoint behind the auth middleware; verify an MCP client test can `initialize` and `tools/list` with a valid token
- [ ] 4.2 Implement the data-type registry from the 1.1 findings and `list_data_types` with per-user readable/writable flags from granted scopes; verify unit tests including a type without write scope
- [ ] 4.3 Implement `read_data` with time-zone handling, pagination and argument validation; verify tests with recorded Google Health API responses
- [ ] 4.4 Implement `aggregate_data` (hour/day/week buckets); verify a seven-day daily steps test returns seven buckets
- [ ] 4.5 Implement `write_data`, `update_data`, `delete_data` for writable types (nutrition log, hydration) with pass-through values and returned upstream ids; verify tests including the read-only type rejection
- [ ] 4.6 Implement `get_profile` and `list_devices`; verify tests with recorded responses
- [ ] 4.7 Implement `delete_my_data` (confirmation, Google revoke, record deletion, token invalidation); verify a test that the previous access token then gets 401
- [ ] 4.8 Add tool annotations, upstream error mapping (validation, rate limit) and log redaction; verify tests that error results are readable and logs contain no health values or tokens
- [ ] 4.9 Document the tools with example calls in `docs/tools.md`; verify each example matches the tool's input schema via a schema test

## 4b. Service insight (`service-insight`)

- [ ] 4b.1 Add the `intent` argument to every tool schema and a shared wrapper that records intents (including missing ones) in Firestore; verify tests for a call with intent, without intent, and that the log contains no intent text
- [ ] 4b.2 Implement `send_feedback` with user/agent source and optional related tool; verify tests for both sources and the empty-message refusal
- [ ] 4b.3 Implement owner-only `list_feedback` and `usage_summary`, hidden from `tools/list` for other accounts; verify tests for the owner, a tester listing tools, and a tester calling the tool
- [ ] 4b.4 Include feedback and intents in `delete_my_data` and set 90-day Firestore TTL on both collections; verify a deletion test and the TTL configuration in the setup script

## 5. Deployment

- [ ] 5.1 Add a deploy script/CI job that builds the container and deploys to Cloud Run with the service account and secrets, plus Firebase Hosting with rewrites to Cloud Run; verify the metadata endpoints and sign-in pages are served over HTTPS from one origin
- [ ] 5.2 Document deploy and rollback in `docs/deploy.md`; verify rollback to the previous revision works as documented

## 6. End-to-end verification

- [ ] 6.1 Add the deployed server as a custom connector in Claude, sign in as the owner, and verify: last night's sleep is read, a meal is logged and visible in the Google Health app, then corrected and deleted
- [ ] 6.2 Add a second allow-listed tester account and verify it sees only its own data, and that a non-listed account is denied
