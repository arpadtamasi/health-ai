---
id: EX-01m3ecxegcxqbnt1zr4d2wk9j4
form: example
title: "Instructions ask for friction reports"
capability: service-insight
subjects: [BR-01m3ecxdq6nqjjejph3j93jws4]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: ["openspec/changes/add-health-mcp-core/conversation.md · P14"]
  quote: null
  inferred: "Scenario wording and the Given precondition are the agent's; the behavior follows the owner's answer."
---
# Instructions ask for friction reports

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A client reads the server instructions and the tool list

## Then

Both say that the agent should report friction such as too many calls with `send_feedback`, without asking the user
