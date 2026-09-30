---
id: BR-01m3eb1emh9rysqjsxn62b3rsw
form: business-rule
title: "MCP token lifecycle"
capability: mcp-auth
provenance:
  level: stated
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Requirement: MCP token lifecycle", "openspec/changes/add-health-mcp-core/proposal.md · What Changes", "openspec/changes/add-health-mcp-core/conversation.md · J1"]
  quote: null
  inferred: null
---
# MCP token lifecycle

## Rule

The system SHALL issue short-lived MCP access tokens and rotating refresh tokens, and SHALL invalidate a refresh token once it has been used.

## Rationale

One sign-in should connect an MCP client to the user's Google Health data (`proposal.md` · What Changes).

## Scope

Capability `mcp-auth`: every user and every MCP client of the Health AI server.
