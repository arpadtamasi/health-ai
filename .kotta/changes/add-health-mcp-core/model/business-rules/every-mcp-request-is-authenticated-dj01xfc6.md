---
id: BR-01m3eb1bh5h0gad7vmdj01xfc6
form: business-rule
title: "Every MCP request is authenticated"
capability: mcp-server
provenance:
  level: stated
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Requirement: Every MCP request is authenticated", "openspec/changes/add-health-mcp-core/proposal.md · What Changes", "openspec/changes/add-health-mcp-core/conversation.md · J1"]
  quote: null
  inferred: null
---
# Every MCP request is authenticated

## Rule

The system MUST reject any MCP request that does not carry a valid, unexpired access token issued by the server's own authorization server, and MUST point the client to its OAuth metadata.

## Rationale

See `openspec/changes/add-health-mcp-core/proposal.md` · Why: a standard remote MCP server so the owner can reach their own health data from an AI chat.

## Scope

Capability `mcp-server`: every user and every MCP client of the Health AI server.
