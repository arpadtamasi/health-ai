---
id: EX-01m3eb1v17e7rjqvbqgb70dbmd
form: example
title: "User grants all requested scopes"
capability: mcp-auth
subjects: [BR-01m3eb1dz1bqrx534g1g403fqw, UC-01m3eb1m382wdbntqfffats3ds]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Scenario: User grants all requested scopes"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# User grants all requested scopes

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

The user signs in with an allow-listed Google account and grants the requested scopes

## Then

The server stores the Google refresh token for that user, redirects back to the MCP client with an authorization code, and the client can exchange it for an MCP access token
