---
id: EX-01m3eb1r96cb5rgarvxr2jw14b
form: example
title: "Non-listed account tries to connect"
capability: mcp-server
subjects: [BR-01m3eb1cehbhtykqpwpgqnygxe, UC-01m3eb1m382wdbntqfffats3ds]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Scenario: Non-listed account tries to connect"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Non-listed account tries to connect

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A Google account that is not on the allow list completes Google sign-in

## Then

The authorization flow ends with an access-denied error and no user record or token is stored
