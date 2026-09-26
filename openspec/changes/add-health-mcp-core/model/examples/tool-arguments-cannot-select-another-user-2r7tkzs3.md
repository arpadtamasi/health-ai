---
id: EX-01m3eb1q5hyq4nncya2r7tkzs3
form: example
title: "Tool arguments cannot select another user"
capability: mcp-server
subjects: [BR-01m3eb1btydhctabx4d1c6zyat]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Scenario: Tool arguments cannot select another user"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Tool arguments cannot select another user

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A tool call includes an argument that names a different user identifier

## Then

The argument is ignored or rejected and no other user's data is accessed
