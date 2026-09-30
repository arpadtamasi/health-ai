---
id: EX-01m3ec2nbbdf6wsk926kvhr8zc
form: example
title: "Insight deleted with the user's data"
capability: service-insight
subjects: [BR-01m3ec2jxj4979r5rs0ttmqgc8]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: ["openspec/changes/add-health-mcp-core/specs/service-insight/spec.md · Scenario: Insight deleted with the user's data", "openspec/changes/add-health-mcp-core/conversation.md · P13"]
  quote: null
  inferred: "Scenario wording and the Given precondition are the agent's; the behavior follows the owner's request and chosen options."
---
# Insight deleted with the user's data

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A user calls `delete_my_data` with confirmation

## Then

That user's feedback and intent records are deleted
