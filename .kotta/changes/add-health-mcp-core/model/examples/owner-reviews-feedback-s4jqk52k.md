---
id: EX-01m3ec2p2pq6yxcnqys4jqk52k
form: example
title: "Owner reviews feedback"
capability: service-insight
subjects: [UC-01m3ec2hg1t08j7m3b6e97x7p3]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: ["openspec/changes/add-health-mcp-core/specs/service-insight/spec.md · Scenario: Owner reviews feedback", "openspec/changes/add-health-mcp-core/conversation.md · P13"]
  quote: null
  inferred: "Scenario wording and the Given precondition are the agent's; the behavior follows the owner's request and chosen options."
---
# Owner reviews feedback

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

The owner calls `list_feedback`

## Then

Feedback from all users is returned newest first, with source, related tool and time
