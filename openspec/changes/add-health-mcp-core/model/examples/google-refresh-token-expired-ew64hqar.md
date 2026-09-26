---
id: EX-01m3eb1x7bh01r43ymew64hqar
form: example
title: "Google refresh token expired"
capability: mcp-auth
subjects: [BR-01m3eb1eyq4j8yawgs12rtmjkp, UC-01m3eb1mg1k3kcp56xtqzn6dnn]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Scenario: Google refresh token expired"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Google refresh token expired

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A tool is called and refreshing the user's Google access token fails with an invalid-grant error

## Then

The tool result is marked as an error explaining that Google access expired and containing a link that restarts Google sign-in for that user
