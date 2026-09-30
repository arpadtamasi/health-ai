---
id: EX-01m3eb1sp9sne6j5h0vd6kb15p
form: example
title: "Client discovers authorization server"
capability: mcp-auth
subjects: [UC-01m3eb1m382wdbntqfffats3ds]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Scenario: Client discovers authorization server"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Client discovers authorization server

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A client fetches the protected resource metadata URL

## Then

The response names the server's authorization server and supported scopes
