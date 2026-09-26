---
id: EX-01m3eb1zgsfk0q8mgmrhjnh6fz
form: example
title: "Large result"
capability: health-data-tools
subjects: [UC-01m3eb1mtkgbt7bzs7nt9tx2qw]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Scenario: Large result"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Large result

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

The requested range contains more records than one page

## Then

The result contains one page of records and a continuation token that returns the next page when passed back
