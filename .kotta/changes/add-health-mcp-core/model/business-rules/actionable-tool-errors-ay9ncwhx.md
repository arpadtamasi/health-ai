---
id: BR-01m3eb1c4j4hc489jbay9ncwhx
form: business-rule
title: "Actionable tool errors"
capability: mcp-server
provenance:
  level: stated
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Requirement: Actionable tool errors", "openspec/changes/add-health-mcp-core/proposal.md · What Changes", "openspec/changes/add-health-mcp-core/conversation.md · J1"]
  quote: null
  inferred: null
---
# Actionable tool errors

## Rule

The system SHALL report failures of tool calls as MCP tool results marked as errors with a human-readable message that tells the user or the AI what to do next, rather than as transport-level failures.

## Rationale

See `openspec/changes/add-health-mcp-core/proposal.md` · Why: a standard remote MCP server so the owner can reach their own health data from an AI chat.

## Scope

Capability `mcp-server`: every user and every MCP client of the Health AI server.
