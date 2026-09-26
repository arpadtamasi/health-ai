---
id: EX-01m3eb1xgetmpadw5jg1bed39f
form: example
title: "Reconnect keeps the user"
capability: mcp-auth
subjects: [BR-01m3eb1eyq4j8yawgs12rtmjkp, UC-01m3eb1mg1k3kcp56xtqzn6dnn]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Scenario: Reconnect keeps the user"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Reconnect keeps the user

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

The user completes the reconnect flow with the same Google account

## Then

The stored Google refresh token is replaced and the user's existing server-side records are kept
