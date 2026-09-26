---
id: BR-01m3eb1d1eddbp6nd8cm0nnjtm
form: business-rule
title: "No health data in logs"
capability: mcp-server
provenance:
  level: stated
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Requirement: No health data in logs", "openspec/changes/add-health-mcp-core/proposal.md · What Changes", "openspec/changes/add-health-mcp-core/conversation.md · J1"]
  quote: null
  inferred: null
---
# No health data in logs

## Rule

The system MUST NOT write health data values, meal contents, or tokens to application logs.

## Rationale

See `openspec/changes/add-health-mcp-core/proposal.md` · Why: a standard remote MCP server so the owner can reach their own health data from an AI chat.

## Scope

Capability `mcp-server`: every user and every MCP client of the Health AI server.
