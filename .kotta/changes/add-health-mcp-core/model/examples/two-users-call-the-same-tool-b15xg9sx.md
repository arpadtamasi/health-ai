---
id: EX-01m3eb1pv34f4axfc3b15xg9sx
form: example
title: "Two users call the same tool"
capability: mcp-server
subjects: [BR-01m3eb1btydhctabx4d1c6zyat]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Scenario: Two users call the same tool"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Two users call the same tool

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

User A and user B each call `read_data` for the same data type and time range

## Then

Each receives only data from their own Google Health account
