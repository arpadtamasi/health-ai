---
id: IF-01m3eb1cqb3yah1ydzbas3hvar
form: interface
title: "delete_my_data tool"
capability: mcp-server
provenance:
  level: stated
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md · Requirement: User can delete their data", "openspec/changes/add-health-mcp-core/proposal.md · What Changes", "openspec/changes/add-health-mcp-core/conversation.md · J1"]
  quote: null
  inferred: null
---
# delete_my_data tool

## Purpose

The system SHALL provide a `delete_my_data` tool that revokes the user's Google grant, deletes all data the server stores for that user, and invalidates the user's MCP tokens.

## Preconditions

An authenticated user calls the tool with explicit confirmation.

## Postconditions

The tool SHALL revoke the user's Google grant, delete every record the server stores for the user, and invalidate the user's MCP tokens.

## Invariants

Without the confirmation argument nothing SHALL be deleted.

## Failures

Missing confirmation: a tool result explaining that confirmation is required.
