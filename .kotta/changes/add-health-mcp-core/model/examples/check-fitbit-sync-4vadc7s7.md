---
id: EX-01m3eb21re0wn1zfqb4vadc7s7
form: example
title: "Check Fitbit sync"
capability: health-data-tools
subjects: [UC-01m3eb1mtkgbt7bzs7nt9tx2qw]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Scenario: Check Fitbit sync"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Check Fitbit sync

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A client calls `list_devices`

## Then

The Fitbit Air is listed with its last sync time
