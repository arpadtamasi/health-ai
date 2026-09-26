---
id: BR-01m3eb1f9dyg49jbzkw0ke8k6d
form: business-rule
title: "Resource-oriented tool set"
capability: health-data-tools
provenance:
  level: stated
  decided_by: human
  sources: ["openspec/changes/add-health-mcp-core/conversation.md · SZ2", "openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Requirement: Resource-oriented tool set", "openspec/changes/add-health-mcp-core/proposal.md · What Changes"]
  quote: "mcp butea. - igen, az api-t képezné le"
  inferred: null
---
# Resource-oriented tool set

## Rule

The system SHALL expose a fixed, small set of generic tools that correspond to Google Health API operations: `list_data_types`, `read_data`, `aggregate_data`, `write_data`, `update_data`, `delete_data`, `get_profile` and `list_devices`, rather than one tool per data type.

## Rationale

A thin, resource-oriented mapping keeps the server free of domain logic; packaging by use comes later (`proposal.md` · What Changes).

## Scope

Capability `health-data-tools`: every user and every MCP client of the Health AI server.
