---
id: EX-01m3ec2mz952zx1s69hkq04hzk
form: example
title: "Intent and feedback are not in the logs"
capability: service-insight
subjects: [BR-01m3ec2jxj4979r5rs0ttmqgc8]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: ["openspec/changes/add-health-mcp-core/specs/service-insight/spec.md · Scenario: Intent and feedback are not in the logs", "openspec/changes/add-health-mcp-core/conversation.md · P13"]
  quote: null
  inferred: "Scenario wording and the Given precondition are the agent's; the behavior follows the owner's request and chosen options."
---
# Intent and feedback are not in the logs

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A tool call with an intent is executed

## Then

The application log contains no intent text and no feedback text
