---
id: EX-01m3eb1nfx704zqappm6tghz6p
form: example
title: "Client connects to the endpoint"
capability: mcp-server
subjects: [UC-01m3eb1m382wdbntqfffats3ds]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Scenario: Client connects to the endpoint"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Client connects to the endpoint

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

An MCP client sends an `initialize` request with a valid access token to the MCP endpoint

## Then

The server responds with its server info, protocol version and the list of supported capabilities including tools
