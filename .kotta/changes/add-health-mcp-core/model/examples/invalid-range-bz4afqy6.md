---
id: EX-01m3eb1zv0re7jx490bz4afqy6
form: example
title: "Invalid range"
capability: health-data-tools
subjects: [UC-01m3eb1mtkgbt7bzs7nt9tx2qw]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Scenario: Invalid range"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Invalid range

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

The range end is before its start or the data type is unknown

## Then

The tool returns an error naming the invalid argument
