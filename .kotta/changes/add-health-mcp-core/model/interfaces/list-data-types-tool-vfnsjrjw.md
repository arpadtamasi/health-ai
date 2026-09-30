---
id: IF-01m3eb1fytpbacz2b3vfnsjrjw
form: interface
title: "list_data_types tool"
capability: health-data-tools
provenance:
  level: stated
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Requirement: Data type discovery", "openspec/changes/add-health-mcp-core/proposal.md · What Changes", "openspec/changes/add-health-mcp-core/conversation.md · J1"]
  quote: null
  inferred: null
---
# list_data_types tool

## Purpose

The `list_data_types` tool SHALL return every data type the server supports, whether each is readable and writable for the current user given granted scopes, and the field schema needed to write it.

## Preconditions

An authenticated user.

## Postconditions

The tool SHALL return every supported data type with name, description, readable and writable flags for this user's granted scopes, and for writable types the required and optional fields with units.

## Invariants

A type whose write scope is not granted SHALL be listed as not writable, with the reason.

## Failures

Upstream errors are reported as readable tool errors.
