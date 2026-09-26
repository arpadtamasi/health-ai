---
change: add-health-mcp-core
generated_at: 2026-09-26T08:07:34.720Z
delta_hash: sha256:3200b61ea83faa11f20617d60c57e125ebc0494ed6e873795337ef1bcfcc7595
ready_for_approval: false
---

# Planning: add-health-mcp-core

Written by `kotta plan`. Every conflict below is a candidate awaiting a human's judgement, not a verdict; nothing here was decided by the machine except what section (f) lists.

## Delta

Added:
- AI chat client (A-danwgedx) — actor, openspec/changes/add-health-mcp-core/model/actors/ai-chat-client-danwgedx.md
- Health AI user (A-82k0bs42) — actor, openspec/changes/add-health-mcp-core/model/actors/health-ai-user-82k0bs42.md
- Owner (A-26bj8mj9) — actor, openspec/changes/add-health-mcp-core/model/actors/owner-26bj8mj9.md
- Access restricted to allow-listed users (BR-pgqnygxe) — business-rule, openspec/changes/add-health-mcp-core/model/business-rules/access-restricted-to-allow-listed-users-pgqnygxe.md
- Actionable tool errors (BR-ay9ncwhx) — business-rule, openspec/changes/add-health-mcp-core/model/business-rules/actionable-tool-errors-ay9ncwhx.md
- Connected screen before returning to the client (BR-2jcgeae2) — business-rule, openspec/changes/add-health-mcp-core/model/business-rules/connected-screen-before-returning-to-the-client-2jcgeae2.md
- Every MCP request is authenticated (BR-dj01xfc6) — business-rule, openspec/changes/add-health-mcp-core/model/business-rules/every-mcp-request-is-authenticated-dj01xfc6.md
- Every tool call states its intent (BR-pseeh1xg) — business-rule, openspec/changes/add-health-mcp-core/model/business-rules/every-tool-call-states-its-intent-pseeh1xg.md
- Google credentials are protected (BR-yjjjqbhd) — business-rule, openspec/changes/add-health-mcp-core/model/business-rules/google-credentials-are-protected-yjjjqbhd.md
- Insight records are protected (BR-0ttmqgc8) — business-rule, openspec/changes/add-health-mcp-core/model/business-rules/insight-records-are-protected-0ttmqgc8.md
- MCP token lifecycle (BR-n62b3rsw) — business-rule, openspec/changes/add-health-mcp-core/model/business-rules/mcp-token-lifecycle-n62b3rsw.md
- No health data in logs (BR-cm0nnjtm) — business-rule, openspec/changes/add-health-mcp-core/model/business-rules/no-health-data-in-logs-cm0nnjtm.md
- Per-user data isolation (BR-d1c6zyat) — business-rule, openspec/changes/add-health-mcp-core/model/business-rules/per-user-data-isolation-d1c6zyat.md
- Re-authentication when Google access is lost (BR-12rtmjkp) — business-rule, openspec/changes/add-health-mcp-core/model/business-rules/re-authentication-when-google-access-is-lost-12rtmjkp.md
- Resource-oriented tool set (BR-w0ke8k6d) — business-rule, openspec/changes/add-health-mcp-core/model/business-rules/resource-oriented-tool-set-w0ke8k6d.md
- Single sign-in grants identity and Google Health access (BR-1g403fqw) — business-rule, openspec/changes/add-health-mcp-core/model/business-rules/single-sign-in-grants-identity-and-google-health-access-1g403fqw.md
- Thin mapping without domain logic (BR-vjgc34yn) — business-rule, openspec/changes/add-health-mcp-core/model/business-rules/thin-mapping-without-domain-logic-vjgc34yn.md
- Tool annotations (BR-evtqnda8) — business-rule, openspec/changes/add-health-mcp-core/model/business-rules/tool-annotations-evtqnda8.md
- Access token refresh (EX-66s0e3h5) — example, openspec/changes/add-health-mcp-core/model/examples/access-token-refresh-66s0e3h5.md
- Agent reports a problem on its own (EX-tbc4bp2g) — example, openspec/changes/add-health-mcp-core/model/examples/agent-reports-a-problem-on-its-own-tbc4bp2g.md
- Call with intent (EX-j9ar70hk) — example, openspec/changes/add-health-mcp-core/model/examples/call-with-intent-j9ar70hk.md
- Call without intent (EX-hqzezkb2) — example, openspec/changes/add-health-mcp-core/model/examples/call-without-intent-hqzezkb2.md
- Check Fitbit sync (EX-4vadc7s7) — example, openspec/changes/add-health-mcp-core/model/examples/check-fitbit-sync-4vadc7s7.md
- Client connects to the endpoint (EX-m6tghz6p) — example, openspec/changes/add-health-mcp-core/model/examples/client-connects-to-the-endpoint-m6tghz6p.md
- Client discovers authorization server (EX-vd6kb15p) — example, openspec/changes/add-health-mcp-core/model/examples/client-discovers-authorization-server-vd6kb15p.md
- Client fetches authorization server metadata (EX-s59che6k) — example, openspec/changes/add-health-mcp-core/model/examples/client-fetches-authorization-server-metadata-s59che6k.md
- Client inspects annotations (EX-htbk4tkq) — example, openspec/changes/add-health-mcp-core/model/examples/client-inspects-annotations-htbk4tkq.md
- Client registers (EX-z3vffbq1) — example, openspec/changes/add-health-mcp-core/model/examples/client-registers-z3vffbq1.md
- Connected screen after sign-in (EX-dsvrm263) — example, openspec/changes/add-health-mcp-core/model/examples/connected-screen-after-sign-in-dsvrm263.md
- Correct a logged meal (EX-4ft2nh8b) — example, openspec/changes/add-health-mcp-core/model/examples/correct-a-logged-meal-4ft2nh8b.md
- Daily steps for a week (EX-yj0sc8kg) — example, openspec/changes/add-health-mcp-core/model/examples/daily-steps-for-a-week-yj0sc8kg.md
- Delete a record (EX-jmfe8nbe) — example, openspec/changes/add-health-mcp-core/model/examples/delete-a-record-jmfe8nbe.md
- Discover writable types (EX-xp7w76w1) — example, openspec/changes/add-health-mcp-core/model/examples/discover-writable-types-xp7w76w1.md
- Empty feedback (EX-82ncyebs) — example, openspec/changes/add-health-mcp-core/model/examples/empty-feedback-82ncyebs.md
- Expired or revoked token (EX-nkya4ev1) — example, openspec/changes/add-health-mcp-core/model/examples/expired-or-revoked-token-nkya4ev1.md
- Google refresh token expired (EX-ew64hqar) — example, openspec/changes/add-health-mcp-core/model/examples/google-refresh-token-expired-ew64hqar.md
- Insight deleted with the user's data (EX-6kvhr8zc) — example, openspec/changes/add-health-mcp-core/model/examples/insight-deleted-with-the-user-s-data-6kvhr8zc.md
- Insight records expire after 90 days (EX-pfsarqpr) — example, openspec/changes/add-health-mcp-core/model/examples/insight-records-expire-after-90-days-pfsarqpr.md
- Intent and feedback are not in the logs (EX-hkq04hzk) — example, openspec/changes/add-health-mcp-core/model/examples/intent-and-feedback-are-not-in-the-logs-hkq04hzk.md
- Invalid range (EX-bz4afqy6) — example, openspec/changes/add-health-mcp-core/model/examples/invalid-range-bz4afqy6.md
- Invalid redirect URI (EX-yq602afh) — example, openspec/changes/add-health-mcp-core/model/examples/invalid-redirect-uri-yq602afh.md
- Large result (EX-rhjnh6fz) — example, openspec/changes/add-health-mcp-core/model/examples/large-result-rhjnh6fz.md
- Log a meal (EX-ezbxg3e9) — example, openspec/changes/add-health-mcp-core/model/examples/log-a-meal-ezbxg3e9.md
- Missing confirmation (EX-556ffxqm) — example, openspec/changes/add-health-mcp-core/model/examples/missing-confirmation-556ffxqm.md
- Missing token (EX-1bbqkj6h) — example, openspec/changes/add-health-mcp-core/model/examples/missing-token-1bbqkj6h.md
- Non-listed account tries to connect (EX-xr2jw14b) — example, openspec/changes/add-health-mcp-core/model/examples/non-listed-account-tries-to-connect-xr2jw14b.md
- Owner reviews feedback (EX-s4jqk52k) — example, openspec/changes/add-health-mcp-core/model/examples/owner-reviews-feedback-s4jqk52k.md
- Owner reviews usage (EX-89390vr2) — example, openspec/changes/add-health-mcp-core/model/examples/owner-reviews-usage-89390vr2.md
- Partial scope grant (EX-r41be3xy) — example, openspec/changes/add-health-mcp-core/model/examples/partial-scope-grant-r41be3xy.md
- Plain HTTP is rejected (EX-mbb46682) — example, openspec/changes/add-health-mcp-core/model/examples/plain-http-is-rejected-mbb46682.md
- Read last night's sleep (EX-abc1dd52) — example, openspec/changes/add-health-mcp-core/model/examples/read-last-night-s-sleep-abc1dd52.md
- Reconnect keeps the user (EX-g1bed39f) — example, openspec/changes/add-health-mcp-core/model/examples/reconnect-keeps-the-user-g1bed39f.md
- Refresh token reuse (EX-ey9drkxa) — example, openspec/changes/add-health-mcp-core/model/examples/refresh-token-reuse-ey9drkxa.md
- Scope not granted (EX-dgppxrmf) — example, openspec/changes/add-health-mcp-core/model/examples/scope-not-granted-dgppxrmf.md
- Stored token inspection (EX-zc16fdqq) — example, openspec/changes/add-health-mcp-core/model/examples/stored-token-inspection-zc16fdqq.md
- Successful read is logged (EX-tap0n85p) — example, openspec/changes/add-health-mcp-core/model/examples/successful-read-is-logged-tap0n85p.md
- Tester cannot see insight tools (EX-crrsskef) — example, openspec/changes/add-health-mcp-core/model/examples/tester-cannot-see-insight-tools-crrsskef.md
- Token response to client (EX-dxdee89k) — example, openspec/changes/add-health-mcp-core/model/examples/token-response-to-client-dxdee89k.md
- Tool arguments cannot select another user (EX-2r7tkzs3) — example, openspec/changes/add-health-mcp-core/model/examples/tool-arguments-cannot-select-another-user-2r7tkzs3.md
- Tool listing (EX-yn6t78gm) — example, openspec/changes/add-health-mcp-core/model/examples/tool-listing-yn6t78gm.md
- Two users call the same tool (EX-b15xg9sx) — example, openspec/changes/add-health-mcp-core/model/examples/two-users-call-the-same-tool-b15xg9sx.md
- Upstream API rejects a request (EX-d3464p19) — example, openspec/changes/add-health-mcp-core/model/examples/upstream-api-rejects-a-request-d3464p19.md
- Upstream rate limit (EX-zpt0qqtx) — example, openspec/changes/add-health-mcp-core/model/examples/upstream-rate-limit-zpt0qqtx.md
- User asks the agent to pass on feedback (EX-7tvbskh4) — example, openspec/changes/add-health-mcp-core/model/examples/user-asks-the-agent-to-pass-on-feedback-7tvbskh4.md
- User deletes their data (EX-qmt1eeky) — example, openspec/changes/add-health-mcp-core/model/examples/user-deletes-their-data-qmt1eeky.md
- User denies Google Health scopes (EX-y0szshkj) — example, openspec/changes/add-health-mcp-core/model/examples/user-denies-google-health-scopes-y0szshkj.md
- User grants all requested scopes (EX-gb70dbmd) — example, openspec/changes/add-health-mcp-core/model/examples/user-grants-all-requested-scopes-gb70dbmd.md
- Write to read-only type (EX-rkjydekr) — example, openspec/changes/add-health-mcp-core/model/examples/write-to-read-only-type-rkjydekr.md
- Writing a record (EX-4kn854kp) — example, openspec/changes/add-health-mcp-core/model/examples/writing-a-record-4kn854kp.md
- Connect with one sign-in (G-9hk232sh) — goal, openspec/changes/add-health-mcp-core/model/goals/connect-with-one-sign-in-9hk232sh.md
- Improve the service from real use (G-gv3vcrwq) — goal, openspec/changes/add-health-mcp-core/model/goals/improve-the-service-from-real-use-gv3vcrwq.md
- Reach my own health data from any AI chat (G-ye2ne6tn) — goal, openspec/changes/add-health-mcp-core/model/goals/reach-my-own-health-data-from-any-ai-chat-ye2ne6tn.md
- Read and log health data from a conversation (G-phb8aypr) — goal, openspec/changes/add-health-mcp-core/model/goals/read-and-log-health-data-from-a-conversation-phb8aypr.md
- aggregate_data tool (IF-fgzrb0xb) — interface, openspec/changes/add-health-mcp-core/model/interfaces/aggregate-data-tool-fgzrb0xb.md
- Client registration endpoint (IF-d227h8br) — interface, openspec/changes/add-health-mcp-core/model/interfaces/client-registration-endpoint-d227h8br.md
- delete_my_data tool (IF-bas3hvar) — interface, openspec/changes/add-health-mcp-core/model/interfaces/delete-my-data-tool-bas3hvar.md
- get_profile and list_devices tools (IF-b4kk5chw) — interface, openspec/changes/add-health-mcp-core/model/interfaces/get-profile-and-list-devices-tools-b4kk5chw.md
- list_data_types tool (IF-vfnsjrjw) — interface, openspec/changes/add-health-mcp-core/model/interfaces/list-data-types-tool-vfnsjrjw.md
- list_feedback and usage_summary tools (IF-95w6mn4b) — interface, openspec/changes/add-health-mcp-core/model/interfaces/list-feedback-and-usage-summary-tools-95w6mn4b.md
- MCP endpoint (IF-rft2dq63) — interface, openspec/changes/add-health-mcp-core/model/interfaces/mcp-endpoint-rft2dq63.md
- OAuth discovery metadata (IF-g3ve5dv3) — interface, openspec/changes/add-health-mcp-core/model/interfaces/oauth-discovery-metadata-g3ve5dv3.md
- read_data tool (IF-f568svj5) — interface, openspec/changes/add-health-mcp-core/model/interfaces/read-data-tool-f568svj5.md
- send_feedback tool (IF-6n0xrgst) — interface, openspec/changes/add-health-mcp-core/model/interfaces/send-feedback-tool-6n0xrgst.md
- write_data, update_data and delete_data tools (IF-54dgycdd) — interface, openspec/changes/add-health-mcp-core/model/interfaces/write-data-update-data-and-delete-data-tools-54dgycdd.md
- Connect an AI client to Health AI (UC-ffats3ds) — use-case, openspec/changes/add-health-mcp-core/model/use-cases/connect-an-ai-client-to-health-ai-ffats3ds.md
- Delete my data (UC-xxp6ft9j) — use-case, openspec/changes/add-health-mcp-core/model/use-cases/delete-my-data-xxp6ft9j.md
- Give feedback on the service (UC-4c6e5ape) — use-case, openspec/changes/add-health-mcp-core/model/use-cases/give-feedback-on-the-service-4c6e5ape.md
- Read and log health data from chat (UC-nt9tx2qw) — use-case, openspec/changes/add-health-mcp-core/model/use-cases/read-and-log-health-data-from-chat-nt9tx2qw.md
- Reconnect after Google access expires (UC-tqzn6dnn) — use-case, openspec/changes/add-health-mcp-core/model/use-cases/reconnect-after-google-access-expires-tqzn6dnn.md
- Review feedback and usage (UC-6e97x7p3) — use-case, openspec/changes/add-health-mcp-core/model/use-cases/review-feedback-and-usage-6e97x7p3.md

Changed: none

Removed: none

## (a) Structure of the delta

Every delta node satisfies its form: sections, required edges, id and provenance.

## (b) The merged view

The accepted model with this delta applied validates as a whole.

## (c) Conflict candidates

No accepted node shares an edge with, is named by, or contrasts with the delta.

The machine's candidates are mechanical and narrow. Contradictions the agent found by comparing every claim of the delta with the accepted nodes it touches, each marked `judged`:

<!-- kotta:judged — the agent's own findings; `kotta plan` keeps this block as written -->
- judged: *Connected screen before returning to the client* adds a confirmation screen between the Google callback and the redirect. The narrative (*Single sign-in grants identity and Google Health access*) and `design.md` D3 described a direct redirect; the owner chose to keep the screen (2026-09-26), and the narrative, `design.md` and `tasks.md` were aligned to the rule.
- judged: *Per-user data isolation* says every tool call MUST use only the calling user's own stored records, but *list_feedback and usage_summary tools* let the owner read every user's feedback and intents. One of them needs an explicit exception.
- judged: The accepted model is empty, so no accepted node is contradicted; every comparison above is between this delta and its own narrative.
<!-- /kotta:judged -->

## (d) Silences

- Open: Improve the service from real use (G-gv3vcrwq) G-gv3vcrwq/Q1 — What target shows this goal is reached (for example: every week I read the feedback and the usage summary, or at least one improvement per month comes from them)? (openspec/changes/add-health-mcp-core/model/goals/improve-the-service-from-real-use-gv3vcrwq.md:30)

## (e) Narrative drift

No narrative requirement bound to a node says something else than the node.

## (f) Provenance

90 delta nodes: 27 stated, 63 partly-inferred, 0 inferred.
Decided by: 14 human, 16 agent-proposed-human-approved, 60 agent-decided.

What the machine decided alone:

- Actionable tool errors (BR-ay9ncwhx) — from openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Requirement: Actionable tool errors
- Every MCP request is authenticated (BR-dj01xfc6) — from openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Requirement: Every MCP request is authenticated
- Google credentials are protected (BR-yjjjqbhd) — from openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Requirement: Google credentials are protected
- MCP token lifecycle (BR-n62b3rsw) — from openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Requirement: MCP token lifecycle
- No health data in logs (BR-cm0nnjtm) — from openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Requirement: No health data in logs
- Per-user data isolation (BR-d1c6zyat) — from openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Requirement: Per-user data isolation
- Re-authentication when Google access is lost (BR-12rtmjkp) — from openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Requirement: Re-authentication when Google access is lost
- Tool annotations (BR-evtqnda8) — from openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Requirement: Tool annotations
- Access token refresh (EX-66s0e3h5) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Check Fitbit sync (EX-4vadc7s7) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Client connects to the endpoint (EX-m6tghz6p) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Client discovers authorization server (EX-vd6kb15p) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Client fetches authorization server metadata (EX-s59che6k) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Client inspects annotations (EX-htbk4tkq) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Client registers (EX-z3vffbq1) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Correct a logged meal (EX-4ft2nh8b) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Daily steps for a week (EX-yj0sc8kg) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Delete a record (EX-jmfe8nbe) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Discover writable types (EX-xp7w76w1) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Expired or revoked token (EX-nkya4ev1) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Google refresh token expired (EX-ew64hqar) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Invalid range (EX-bz4afqy6) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Invalid redirect URI (EX-yq602afh) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Large result (EX-rhjnh6fz) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Log a meal (EX-ezbxg3e9) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Missing confirmation (EX-556ffxqm) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Missing token (EX-1bbqkj6h) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Non-listed account tries to connect (EX-xr2jw14b) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Partial scope grant (EX-r41be3xy) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Plain HTTP is rejected (EX-mbb46682) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Read last night's sleep (EX-abc1dd52) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Reconnect keeps the user (EX-g1bed39f) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Refresh token reuse (EX-ey9drkxa) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Scope not granted (EX-dgppxrmf) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Stored token inspection (EX-zc16fdqq) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Successful read is logged (EX-tap0n85p) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Token response to client (EX-dxdee89k) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Tool arguments cannot select another user (EX-2r7tkzs3) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Tool listing (EX-yn6t78gm) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Two users call the same tool (EX-b15xg9sx) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Upstream API rejects a request (EX-d3464p19) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Upstream rate limit (EX-zpt0qqtx) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- User deletes their data (EX-qmt1eeky) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- User denies Google Health scopes (EX-y0szshkj) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- User grants all requested scopes (EX-gb70dbmd) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Write to read-only type (EX-rkjydekr) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- Writing a record (EX-4kn854kp) — Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit.
- aggregate_data tool (IF-fgzrb0xb) — from openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Requirement: Aggregated data
- Client registration endpoint (IF-d227h8br) — from openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Requirement: Dynamic client registration
- delete_my_data tool (IF-bas3hvar) — from openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Requirement: User can delete their data
- get_profile and list_devices tools (IF-b4kk5chw) — from openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Requirement: Profile and devices
- list_data_types tool (IF-vfnsjrjw) — from openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Requirement: Data type discovery
- OAuth discovery metadata (IF-g3ve5dv3) — from openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Requirement: MCP-compliant OAuth discovery
- read_data tool (IF-f568svj5) — from openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Requirement: Reading raw data
- Connect an AI client to Health AI (UC-ffats3ds) — The use case sequence is assembled by the agent from the requirements and the design.
- Delete my data (UC-xxp6ft9j) — The use case sequence is assembled by the agent from the requirements and the design.
- Give feedback on the service (UC-4c6e5ape) — The use case steps are assembled by the agent from the owner's request and the chosen options.
- Read and log health data from chat (UC-nt9tx2qw) — The use case sequence is assembled by the agent from the requirements and the design.
- Reconnect after Google access expires (UC-tqzn6dnn) — The use case sequence is assembled by the agent from the requirements and the design.
- Review feedback and usage (UC-6e97x7p3) — The use case steps are assembled by the agent from the owner's request and the chosen options.

Conversation: openspec/changes/add-health-mcp-core/conversation.md, cited 52 times. Read it for the why before calling anything inferred.
