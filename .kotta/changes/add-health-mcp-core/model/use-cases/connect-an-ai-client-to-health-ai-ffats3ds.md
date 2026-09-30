---
id: UC-01m3eb1m382wdbntqfffats3ds
form: use-case
title: "Connect an AI client to Health AI"
capability: mcp-auth
actor: [A-01m3eb1kceqrt9s4dt82k0bs42, A-01m3eb1kqkzfqzy7jwdanwgedx]
goal: [G-01m3eb1jjs0c8ng53y9hk232sh]
interfaces: [IF-01m3eb1dc1ps80f3fbg3ve5dv3, IF-01m3eb1dn2x3v6146zd227h8br, IF-01m3eb1b7edb7e1dh0rft2dq63]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md", "openspec/changes/add-health-mcp-core/design.md · Decisions"]
  quote: null
  inferred: "The use case sequence is assembled by the agent from the requirements and the design."
---
# Connect an AI client to Health AI

## Intent

The user adds the Health AI connector in their AI chat and connects their Google Health data with one sign-in.

## Preconditions

The user's Google account is on the allow list.

## Main success scenario

1. The client discovers the OAuth metadata and registers itself.
2. The user signs in with Google and grants the Google Health scopes.
3. The server shows the Connected screen and returns the user to the client.
4. The client exchanges the code for tokens and initializes the MCP session.

## Alternatives

- The account is not invited: access denied, nothing stored.
- The user denies the Health scopes: no tokens, the missing permissions are listed.
- Only read scopes are granted: read tools work, write tools explain how to grant write.
