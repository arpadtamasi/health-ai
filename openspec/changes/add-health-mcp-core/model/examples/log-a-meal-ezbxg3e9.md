---
id: EX-01m3eb20eeatc1kj35ezbxg3e9
form: example
title: "Log a meal"
capability: health-data-tools
subjects: [UC-01m3eb1mtkgbt7bzs7nt9tx2qw]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Scenario: Log a meal"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Log a meal

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A client calls `write_data` with a nutrition entry containing meal type, time, food name, amount and nutrient values

## Then

The entry is created in the user's Google Health account and appears in the Google Health app, and the tool returns its id
