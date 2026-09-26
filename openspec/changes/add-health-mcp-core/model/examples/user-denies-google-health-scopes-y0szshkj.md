---
id: EX-01m3eb1vc36ywe6vgsy0szshkj
form: example
title: "User denies Google Health scopes"
capability: mcp-auth
subjects: [BR-01m3eb1dz1bqrx534g1g403fqw, UC-01m3eb1m382wdbntqfffats3ds]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Scenario: User denies Google Health scopes"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# User denies Google Health scopes

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

The user signs in but does not grant the Google Health scopes

## Then

No MCP tokens are issued and the user sees which permissions are required
