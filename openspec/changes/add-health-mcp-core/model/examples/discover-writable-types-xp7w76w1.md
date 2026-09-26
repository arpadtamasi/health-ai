---
id: EX-01m3eb1yghvbss4975xp7w76w1
form: example
title: "Discover writable types"
capability: health-data-tools
subjects: [UC-01m3eb1mtkgbt7bzs7nt9tx2qw]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Scenario: Discover writable types"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Discover writable types

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A client calls `list_data_types`

## Then

Each entry states its name, description, readable, writable, and for writable types the required and optional fields with units
