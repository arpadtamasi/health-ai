---
id: EX-01m3eb1s0h17mbcekh556ffxqm
form: example
title: "Missing confirmation"
capability: mcp-server
subjects: [UC-01m3eb1n59mc158c59xxp6ft9j]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Scenario: Missing confirmation"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Missing confirmation

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A user calls `delete_my_data` without the confirmation argument

## Then

Nothing is deleted and the tool result explains that confirmation is required
