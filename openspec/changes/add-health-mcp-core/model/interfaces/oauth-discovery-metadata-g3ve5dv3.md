---
id: IF-01m3eb1dc1ps80f3fbg3ve5dv3
form: interface
title: "OAuth discovery metadata"
capability: mcp-auth
provenance:
  level: stated
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md · Requirement: MCP-compliant OAuth discovery", "openspec/changes/add-health-mcp-core/proposal.md · What Changes", "openspec/changes/add-health-mcp-core/conversation.md · J1"]
  quote: null
  inferred: null
---
# OAuth discovery metadata

## Purpose

The system SHALL publish OAuth 2.0 Protected Resource Metadata and Authorization Server Metadata as required by the MCP authorization specification, so that MCP clients can discover how to authorize without manual configuration.

## Preconditions

None; the metadata endpoints are public.

## Postconditions

The server SHALL publish OAuth 2.0 Protected Resource Metadata and Authorization Server Metadata listing the authorization, token and registration endpoints, the `authorization_code` and `refresh_token` grants, and PKCE `S256` as required.

## Invariants

The metadata SHALL match the endpoints the server actually serves.

## Failures

None expected; unavailable metadata makes clients unable to connect.
