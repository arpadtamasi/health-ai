---
id: IF-01m3eb1b7edb7e1dh0rft2dq63
form: interface
title: "MCP endpoint"
capability: mcp-server
provenance:
  level: stated
  decided_by: human
  sources: ["openspec/changes/add-health-mcp-core/conversation.md · SZ2", "openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Requirement: Remote MCP endpoint", "openspec/changes/add-health-mcp-core/proposal.md · What Changes"]
  quote: "rendes távoli mcp"
  inferred: null
---
# MCP endpoint

## Purpose

The system SHALL expose a single MCP endpoint over HTTPS using the MCP Streamable HTTP transport, reachable from the public internet, so that any MCP client supporting remote servers can connect without local installation.

## Preconditions

The request reaches the service over HTTPS and carries an `Authorization: Bearer` access token.

## Postconditions

The server SHALL answer MCP requests over the Streamable HTTP transport at a single public HTTPS endpoint, and an `initialize` with a valid token SHALL return server info, protocol version and capabilities including tools.

## Invariants

Every request SHALL be executed on behalf of the authenticated user only.

## Failures

Missing, expired or revoked token: HTTP 401 with a `WWW-Authenticate` header naming the protected resource metadata. Plain HTTP: not served as MCP.
