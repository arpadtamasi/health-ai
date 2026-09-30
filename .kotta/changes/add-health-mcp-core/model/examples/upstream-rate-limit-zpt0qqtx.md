---
id: EX-01m3eb1qy1h6g9wcsrzpt0qqtx
form: example
title: "Upstream rate limit"
capability: mcp-server
subjects: [BR-01m3eb1c4j4hc489jbay9ncwhx]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Scenario: Upstream rate limit"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Upstream rate limit

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

The Google Health API responds with a rate-limit error

## Then

The tool result is marked as an error stating that the request was rate limited and can be retried later
