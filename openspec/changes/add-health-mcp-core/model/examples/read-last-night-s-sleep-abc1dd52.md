---
id: EX-01m3eb1z65zkeecg0gabc1dd52
form: example
title: "Read last night's sleep"
capability: health-data-tools
subjects: [UC-01m3eb1mtkgbt7bzs7nt9tx2qw]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Scenario: Read last night's sleep"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Read last night's sleep

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A client calls `read_data` with type `sleep` and a range covering last night

## Then

The sleep sessions in that range are returned with start, end, stages and source device
