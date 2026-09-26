---
id: EX-01m3eb20safrq94nny4ft2nh8b
form: example
title: "Correct a logged meal"
capability: health-data-tools
subjects: [UC-01m3eb1mtkgbt7bzs7nt9tx2qw]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Scenario: Correct a logged meal"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Correct a logged meal

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A client calls `update_data` with the id of a previously created nutrition entry and changed amounts

## Then

The entry in Google Health reflects the new values
