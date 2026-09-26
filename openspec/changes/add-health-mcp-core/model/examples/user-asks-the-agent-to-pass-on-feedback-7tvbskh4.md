---
id: EX-01m3ec2k8pvjmha9dy7tvbskh4
form: example
title: "User asks the agent to pass on feedback"
capability: service-insight
subjects: [UC-01m3ec2h5aesz6dj5w4c6e5ape]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: ["openspec/changes/add-health-mcp-core/specs/service-insight/spec.md · Scenario: User asks the agent to pass on feedback", "openspec/changes/add-health-mcp-core/conversation.md · P13"]
  quote: null
  inferred: "Scenario wording and the Given precondition are the agent's; the behavior follows the owner's request and chosen options."
---
# User asks the agent to pass on feedback

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

The user tells the agent "tell the developer the sleep answer was confusing" and the agent calls `send_feedback` with source `user`

## Then

The feedback is stored with source `user`, the user's id and the time, and the tool confirms it was received
