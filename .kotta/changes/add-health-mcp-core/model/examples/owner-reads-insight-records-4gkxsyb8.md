---
id: EX-01m3ecxewd4jc3wbpa4gkxsyb8
form: example
title: "Owner reads insight records"
capability: mcp-server
subjects: [BR-01m3eb1btydhctabx4d1c6zyat]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: ["openspec/changes/add-health-mcp-core/conversation.md · P14"]
  quote: null
  inferred: "Scenario wording and the Given precondition are the agent's; the behavior follows the owner's answer."
---
# Owner reads insight records

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

The owner calls `list_feedback`

## Then

Feedback records of all users are returned, but no other user's health data, tokens or other records are read
