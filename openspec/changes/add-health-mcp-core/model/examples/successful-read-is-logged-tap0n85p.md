---
id: EX-01m3eb1sbk8namvgk4tap0n85p
form: example
title: "Successful read is logged"
capability: mcp-server
subjects: [BR-01m3eb1d1eddbp6nd8cm0nnjtm]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Scenario: Successful read is logged"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Successful read is logged

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A `read_data` call succeeds

## Then

Logs contain at most the tool name, data type, time range, duration, outcome and a pseudonymous user id, but no returned values
