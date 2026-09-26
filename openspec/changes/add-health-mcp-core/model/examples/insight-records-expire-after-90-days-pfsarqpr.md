---
id: EX-01m3ec2nq6neht0r8jpfsarqpr
form: example
title: "Insight records expire after 90 days"
capability: service-insight
subjects: [BR-01m3ec2jxj4979r5rs0ttmqgc8]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: ["openspec/changes/add-health-mcp-core/specs/service-insight/spec.md · Scenario: Insight records expire after 90 days", "openspec/changes/add-health-mcp-core/conversation.md · P13"]
  quote: null
  inferred: "Scenario wording and the Given precondition are the agent's; the behavior follows the owner's request and chosen options."
---
# Insight records expire after 90 days

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A feedback or intent record is older than 90 days

## Then

It is deleted automatically
