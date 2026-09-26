---
id: BR-01m3eb1cehbhtykqpwpgqnygxe
form: business-rule
title: "Access restricted to allow-listed users"
capability: mcp-server
provenance:
  level: stated
  decided_by: human
  sources: ["openspec/changes/add-health-mcp-core/conversation.md · P3", "openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Requirement: Access restricted to allow-listed users", "openspec/changes/add-health-mcp-core/proposal.md · What Changes"]
  quote: "először magamnak meg tesztelőknek"
  inferred: null
---
# Access restricted to allow-listed users

## Rule

The system SHALL only allow sign-in for Google accounts that are on the operator-managed allow list (owner and testers).

## Rationale

See `openspec/changes/add-health-mcp-core/proposal.md` · Why: a standard remote MCP server so the owner can reach their own health data from an AI chat.

## Scope

Capability `mcp-server`: every user and every MCP client of the Health AI server.
