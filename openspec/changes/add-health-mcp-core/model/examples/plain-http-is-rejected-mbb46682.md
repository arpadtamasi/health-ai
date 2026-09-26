---
id: EX-01m3eb1ntvnh3526fdmbb46682
form: example
title: "Plain HTTP is rejected"
capability: mcp-server
subjects: [UC-01m3eb1m382wdbntqfffats3ds]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Scenario: Plain HTTP is rejected"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Plain HTTP is rejected

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A request reaches the service over unencrypted HTTP

## Then

The request is not served as an MCP request
