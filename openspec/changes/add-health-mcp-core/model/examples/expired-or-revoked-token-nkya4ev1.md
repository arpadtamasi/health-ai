---
id: EX-01m3eb1pfz22y9ty9enkya4ev1
form: example
title: "Expired or revoked token"
capability: mcp-server
subjects: [BR-01m3eb1bh5h0gad7vmdj01xfc6]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Scenario: Expired or revoked token"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Expired or revoked token

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A client calls the MCP endpoint with an expired or revoked access token

## Then

The server responds with HTTP 401 and does not execute any tool
