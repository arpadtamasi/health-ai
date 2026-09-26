---
id: EX-01m3eb21ed63bedndprkjydekr
form: example
title: "Write to read-only type"
capability: health-data-tools
subjects: [UC-01m3eb1mtkgbt7bzs7nt9tx2qw]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Scenario: Write to read-only type"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Write to read-only type

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A client calls `write_data` for a data type that is not writable

## Then

The tool returns an error and nothing is sent upstream
