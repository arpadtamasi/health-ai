---
id: EX-01m3eb1wkjmhqsbe6w66s0e3h5
form: example
title: "Access token refresh"
capability: mcp-auth
subjects: [BR-01m3eb1emh9rysqjsxn62b3rsw]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Scenario: Access token refresh"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Access token refresh

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A client presents a valid MCP refresh token

## Then

It receives a new access token and a new refresh token, and the old refresh token no longer works
