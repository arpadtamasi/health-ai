---
id: EX-01m3ec2kxb44y018ty82ncyebs
form: example
title: "Empty feedback"
capability: service-insight
subjects: [UC-01m3ec2h5aesz6dj5w4c6e5ape]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: ["openspec/changes/add-health-mcp-core/specs/service-insight/spec.md · Scenario: Empty feedback", "openspec/changes/add-health-mcp-core/conversation.md · P13"]
  quote: null
  inferred: "Scenario wording and the Given precondition are the agent's; the behavior follows the owner's request and chosen options."
---
# Empty feedback

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

`send_feedback` is called with an empty message

## Then

Nothing is stored and the tool result says a message is required
