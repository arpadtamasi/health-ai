---
id: BR-01m3eb1e9vvvzkdcxwyjjjqbhd
form: business-rule
title: "Google credentials are protected"
capability: mcp-auth
provenance:
  level: stated
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Requirement: Google credentials are protected", "openspec/changes/add-health-mcp-core/proposal.md · What Changes", "openspec/changes/add-health-mcp-core/conversation.md · J1"]
  quote: null
  inferred: null
---
# Google credentials are protected

## Rule

The system MUST store Google refresh tokens encrypted at rest with a key managed outside the database, and MUST NOT return Google tokens to the MCP client.

## Rationale

One sign-in should connect an MCP client to the user's Google Health data (`proposal.md` · What Changes).

## Scope

Capability `mcp-auth`: every user and every MCP client of the Health AI server.
