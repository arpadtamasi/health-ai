---
id: EX-01m3eb1ytk8gqp58eedgppxrmf
form: example
title: "Scope not granted"
capability: health-data-tools
subjects: [UC-01m3eb1mtkgbt7bzs7nt9tx2qw]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Scenario: Scope not granted"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Scope not granted

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

The user has not granted the write scope for a data type

## Then

That data type is listed with `writable: false` and the reason
