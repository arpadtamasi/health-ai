---
id: EX-01m3ec2pdny2reppbc89390vr2
form: example
title: "Owner reviews usage"
capability: service-insight
subjects: [UC-01m3ec2hg1t08j7m3b6e97x7p3]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: ["openspec/changes/add-health-mcp-core/specs/service-insight/spec.md · Scenario: Owner reviews usage", "openspec/changes/add-health-mcp-core/conversation.md · P13"]
  quote: null
  inferred: "Scenario wording and the Given precondition are the agent's; the behavior follows the owner's request and chosen options."
---
# Owner reviews usage

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

The owner calls `usage_summary` for the last 7 days

## Then

Call counts per tool and the recorded intents for that period are returned
