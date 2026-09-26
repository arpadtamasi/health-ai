---
id: EX-01m3eb1qjz1162wf2qd3464p19
form: example
title: "Upstream API rejects a request"
capability: mcp-server
subjects: [BR-01m3eb1c4j4hc489jbay9ncwhx]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Scenario: Upstream API rejects a request"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Upstream API rejects a request

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

The Google Health API returns a validation error for a tool call

## Then

The tool result is marked as an error and includes the upstream reason in readable form
