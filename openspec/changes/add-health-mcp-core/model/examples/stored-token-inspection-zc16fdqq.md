---
id: EX-01m3eb1w00xbvxe1kvzc16fdqq
form: example
title: "Stored token inspection"
capability: mcp-auth
subjects: [BR-01m3eb1e9vvvzkdcxwyjjjqbhd]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Scenario: Stored token inspection"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Stored token inspection

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

An operator reads a user record directly from the database

## Then

The Google refresh token is only present in encrypted form
