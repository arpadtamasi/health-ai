---
id: IF-01m3eb1dn2x3v6146zd227h8br
form: interface
title: "Client registration endpoint"
capability: mcp-auth
provenance:
  level: stated
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Requirement: Dynamic client registration", "openspec/changes/add-health-mcp-core/proposal.md · What Changes", "openspec/changes/add-health-mcp-core/conversation.md · J1"]
  quote: null
  inferred: null
---
# Client registration endpoint

## Purpose

The system SHALL support OAuth 2.0 Dynamic Client Registration so that MCP clients can register themselves without the operator creating client credentials by hand.

## Preconditions

The client posts OAuth client metadata.

## Postconditions

A registration with only HTTPS or loopback redirect URIs SHALL return a client id usable in an authorization request.

## Invariants

Redirect URIs that are neither HTTPS nor loopback SHALL never be registered.

## Failures

Invalid redirect URI: registration rejected.
