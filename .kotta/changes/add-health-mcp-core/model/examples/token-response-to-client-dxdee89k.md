---
id: EX-01m3eb1w9tcfmhw9gndxdee89k
form: example
title: "Token response to client"
capability: mcp-auth
subjects: [BR-01m3eb1e9vvvzkdcxwyjjjqbhd]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Scenario: Token response to client"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Token response to client

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

An MCP client exchanges an authorization code or refresh token

## Then

The response contains only tokens issued by the server itself
