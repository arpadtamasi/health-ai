---
id: EX-01m3ec2mkw7xwr505yhqzezkb2
form: example
title: "Call without intent"
capability: service-insight
subjects: [BR-01m3ec2jjaqp80zks6pseeh1xg]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: ["openspec/changes/add-health-mcp-core/specs/service-insight/spec.md · Scenario: Call without intent", "openspec/changes/add-health-mcp-core/conversation.md · P13"]
  quote: null
  inferred: "Scenario wording and the Given precondition are the agent's; the behavior follows the owner's request and chosen options."
---
# Call without intent

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

The agent calls `aggregate_data` without an intent

## Then

The call is executed normally and a record with the tool name and "intent missing" is stored
