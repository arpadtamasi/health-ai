---
id: EX-01m3eb1t0k64serv3rs59che6k
form: example
title: "Client fetches authorization server metadata"
capability: mcp-auth
subjects: [UC-01m3eb1m382wdbntqfffats3ds]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Scenario: Client fetches authorization server metadata"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Client fetches authorization server metadata

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A client fetches `/.well-known/oauth-authorization-server`

## Then

The response lists the authorization, token and registration endpoints, supports the `authorization_code` and `refresh_token` grants, and requires PKCE with `S256`
