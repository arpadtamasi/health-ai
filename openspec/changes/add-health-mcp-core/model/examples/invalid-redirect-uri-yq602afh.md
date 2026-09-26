---
id: EX-01m3eb1tnzz8f6zqqbyq602afh
form: example
title: "Invalid redirect URI"
capability: mcp-auth
subjects: [UC-01m3eb1m382wdbntqfffats3ds]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Scenario: Invalid redirect URI"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Invalid redirect URI

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A registration request contains a redirect URI that is neither HTTPS nor a loopback address

## Then

Registration is rejected
