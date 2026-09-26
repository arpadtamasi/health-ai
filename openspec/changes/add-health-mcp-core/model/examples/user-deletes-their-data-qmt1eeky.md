---
id: EX-01m3eb1rp3f9tjjr6gqmt1eeky
form: example
title: "User deletes their data"
capability: mcp-server
subjects: [UC-01m3eb1n59mc158c59xxp6ft9j]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Scenario: User deletes their data"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# User deletes their data

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

An authenticated user calls `delete_my_data` with explicit confirmation

## Then

The Google refresh token is revoked, the user's stored records are deleted, and subsequent calls with the user's previous access token receive HTTP 401
