---
id: BR-01m3eb1btydhctabx4d1c6zyat
form: business-rule
title: "Per-user data isolation"
capability: mcp-server
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Requirement: Per-user data isolation", "openspec/changes/add-health-mcp-core/proposal.md · What Changes", "openspec/changes/add-health-mcp-core/conversation.md · J1", "openspec/changes/add-health-mcp-core/conversation.md · P14"]
  quote: null
  inferred: "The base rule is the agent's; the owner-tool exception was decided by the owner on 2026-09-26 (\"kell kivétel nyilván\")."
---
# Per-user data isolation

## Rule

The system MUST execute every tool call strictly on behalf of the authenticated user, using only that user's Google Health credentials and stored records. The one exception: the owner's `list_feedback` and `usage_summary` tools MAY read the feedback and intent records of all users, and nothing else of theirs.

## Rationale

See `openspec/changes/add-health-mcp-core/proposal.md` · Why: a standard remote MCP server so the owner can reach their own health data from an AI chat.

## Scope

Capability `mcp-server`: every user and every MCP client of the Health AI server.
