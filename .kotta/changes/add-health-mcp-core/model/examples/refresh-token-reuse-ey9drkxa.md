---
id: EX-01m3eb1wxepg3kcw77ey9drkxa
form: example
title: "Refresh token reuse"
capability: mcp-auth
subjects: [BR-01m3eb1emh9rysqjsxn62b3rsw]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Scenario: Refresh token reuse"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Refresh token reuse

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

An already used MCP refresh token is presented again

## Then

The request is rejected and all tokens of that grant are revoked
