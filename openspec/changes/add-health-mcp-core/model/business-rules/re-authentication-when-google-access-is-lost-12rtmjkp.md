---
id: BR-01m3eb1eyq4j8yawgs12rtmjkp
form: business-rule
title: "Re-authentication when Google access is lost"
capability: mcp-auth
provenance:
  level: stated
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Requirement: Re-authentication when Google access is lost", "openspec/changes/add-health-mcp-core/proposal.md · What Changes", "openspec/changes/add-health-mcp-core/conversation.md · J1"]
  quote: null
  inferred: null
---
# Re-authentication when Google access is lost

## Rule

The system SHALL detect when the stored Google credentials can no longer be refreshed (expired, revoked, or expired because the OAuth app is in Testing mode) and SHALL tell the user how to reconnect instead of failing silently.

## Rationale

One sign-in should connect an MCP client to the user's Google Health data (`proposal.md` · What Changes).

## Scope

Capability `mcp-auth`: every user and every MCP client of the Health AI server.
