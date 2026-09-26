---
id: EX-01m3ecxe2df2x94481ea0t1rz0
form: example
title: "Agent reports too many calls"
capability: service-insight
subjects: [UC-01m3ec2h5aesz6dj5w4c6e5ape, BR-01m3ecxdq6nqjjejph3j93jws4]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: ["openspec/changes/add-health-mcp-core/conversation.md · P14"]
  quote: null
  inferred: "Scenario wording and the Given precondition are the agent's; the behavior follows the owner's answer."
---
# Agent reports too many calls

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

The agent needed `list_data_types`, `read_data` three times and `aggregate_data` to answer one question, and calls `send_feedback` with source `agent`, kind `too_many_calls` and those tools

## Then

The feedback is stored with kind `too_many_calls` and the tools involved, so the owner can see which calls could be merged
