---
id: EX-01m3ec2m8ejx5wh3rxj9ar70hk
form: example
title: "Call with intent"
capability: service-insight
subjects: [BR-01m3ec2jjaqp80zks6pseeh1xg]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: ["openspec/changes/add-health-mcp-core/specs/service-insight/spec.md · Scenario: Call with intent", "openspec/changes/add-health-mcp-core/conversation.md · P13"]
  quote: null
  inferred: "Scenario wording and the Given precondition are the agent's; the behavior follows the owner's request and chosen options."
---
# Call with intent

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

The agent calls `read_data` with intent "the user asked how they slept last night"

## Then

The call is executed and the tool name, intent and time are recorded
