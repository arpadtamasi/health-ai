---
id: EX-01m3eb1tbjbvwancpdz3vffbq1
form: example
title: "Client registers"
capability: mcp-auth
subjects: [UC-01m3eb1m382wdbntqfffats3ds]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Scenario: Client registers"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Client registers

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

An MCP client posts valid client metadata with HTTPS or loopback redirect URIs to the registration endpoint

## Then

The server returns a client id and the client can start an authorization request
