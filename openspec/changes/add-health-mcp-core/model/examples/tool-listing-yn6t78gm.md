---
id: EX-01m3eb1xv1bzrb9hezyn6t78gm
form: example
title: "Tool listing"
capability: health-data-tools
subjects: [BR-01m3eb1f9dyg49jbzkw0ke8k6d]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Scenario: Tool listing"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Tool listing

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A client calls `tools/list`

## Then

The response contains the core tools of this capability, `delete_my_data` and `send_feedback`, plus `list_feedback` and `usage_summary` for the owner only, each with an input schema that includes `intent`
