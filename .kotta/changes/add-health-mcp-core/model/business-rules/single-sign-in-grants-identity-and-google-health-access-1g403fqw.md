---
id: BR-01m3eb1dz1bqrx534g1g403fqw
form: business-rule
title: "Single sign-in grants identity and Google Health access"
capability: mcp-auth
provenance:
  level: stated
  decided_by: human
  sources: ["openspec/changes/add-health-mcp-core/conversation.md · SZ2", "openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Requirement: Single sign-in grants identity and Google Health access", "openspec/changes/add-health-mcp-core/proposal.md · What Changes"]
  quote: "auth igen"
  inferred: null
---
# Single sign-in grants identity and Google Health access

## Rule

The system SHALL, during the MCP authorization flow, redirect the user to Google sign-in requesting the user's identity and the Google Health API scopes needed by the tools, and SHALL issue MCP tokens only after the user has granted them.

## Rationale

One sign-in should connect an MCP client to the user's Google Health data (`proposal.md` · What Changes).

## Scope

Capability `mcp-auth`: every user and every MCP client of the Health AI server.
