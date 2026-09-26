---
id: BR-01m3eb1hj8n8qg0q5kevtqnda8
form: business-rule
title: "Tool annotations"
capability: health-data-tools
provenance:
  level: stated
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Requirement: Tool annotations", "openspec/changes/add-health-mcp-core/proposal.md · What Changes", "openspec/changes/add-health-mcp-core/conversation.md · J1"]
  quote: null
  inferred: null
---
# Tool annotations

## Rule

Every tool SHALL declare MCP tool annotations: read-only tools as `readOnlyHint: true`, and `delete_data` and `delete_my_data` as `destructiveHint: true`.

## Rationale

A thin, resource-oriented mapping keeps the server free of domain logic; packaging by use comes later (`proposal.md` · What Changes).

## Scope

Capability `health-data-tools`: every user and every MCP client of the Health AI server.
