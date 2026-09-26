---
id: EX-01m3eb2056zah2kf04yj0sc8kg
form: example
title: "Daily steps for a week"
capability: health-data-tools
subjects: [UC-01m3eb1mtkgbt7bzs7nt9tx2qw]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Scenario: Daily steps for a week"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Daily steps for a week

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A client calls `aggregate_data` with type `steps`, bucket `day`, and a seven-day range

## Then

Seven buckets are returned, each with its date and total step count
