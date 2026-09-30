---
id: EX-01m3eb1p5j70avfs5q1bbqkj6h
form: example
title: "Missing token"
capability: mcp-server
subjects: [BR-01m3eb1bh5h0gad7vmdj01xfc6]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Scenario: Missing token"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Missing token

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A client calls the MCP endpoint without an `Authorization: Bearer` header

## Then

The server responds with HTTP 401 and a `WWW-Authenticate` header referencing the protected resource metadata URL
