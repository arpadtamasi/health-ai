---
id: EX-01m3eb222yw71v5nmdhtbk4tkq
form: example
title: "Client inspects annotations"
capability: health-data-tools
subjects: [BR-01m3eb1hj8n8qg0q5kevtqnda8]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Scenario: Client inspects annotations"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Client inspects annotations

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A client lists the tools

## Then

`read_data`, `aggregate_data`, `list_data_types`, `get_profile` and `list_devices` are marked read-only, and `delete_data` and `delete_my_data` are marked destructive
