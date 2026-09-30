---
id: EX-01m3ec2kk6cwghqz3ptbc4bp2g
form: example
title: "Agent reports a problem on its own"
capability: service-insight
subjects: [UC-01m3ec2h5aesz6dj5w4c6e5ape]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: ["openspec/changes/add-health-mcp-core/specs/service-insight/spec.md · Scenario: Agent reports a problem on its own", "openspec/changes/add-health-mcp-core/conversation.md · P13"]
  quote: null
  inferred: "Scenario wording and the Given precondition are the agent's; the behavior follows the owner's request and chosen options."
---
# Agent reports a problem on its own

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

The agent calls `send_feedback` with source `agent` and the related tool `read_data` after a confusing error

## Then

The feedback is stored with source `agent` and the related tool name
