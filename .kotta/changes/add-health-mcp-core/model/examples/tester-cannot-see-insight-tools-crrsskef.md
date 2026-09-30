---
id: EX-01m3ec2pr5c61v9fcjcrrsskef
form: example
title: "Tester cannot see insight tools"
capability: service-insight
subjects: [UC-01m3ec2hg1t08j7m3b6e97x7p3]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: ["openspec/changes/add-health-mcp-core/specs/service-insight/spec.md · Scenario: Tester cannot see insight tools", "openspec/changes/add-health-mcp-core/conversation.md · P13"]
  quote: null
  inferred: "Scenario wording and the Given precondition are the agent's; the behavior follows the owner's request and chosen options."
---
# Tester cannot see insight tools

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A tester's client calls `tools/list` or calls `list_feedback`

## Then

The insight tools are not listed, and the call is refused
