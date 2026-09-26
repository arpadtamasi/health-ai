---
id: EX-01m3eb1vptckdx1n9wr41be3xy
form: example
title: "Partial scope grant"
capability: mcp-auth
subjects: [BR-01m3eb1dz1bqrx534g1g403fqw, UC-01m3eb1m382wdbntqfffats3ds]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Scenario: Partial scope grant"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Partial scope grant

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

The user grants read scopes but not write scopes

## Then

MCP tokens are issued, read tools work, and write tools return an error stating that write permission was not granted and how to grant it
