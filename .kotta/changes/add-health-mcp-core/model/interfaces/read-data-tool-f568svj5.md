---
id: IF-01m3eb1g9r4bt0fvmyf568svj5
form: interface
title: "read_data tool"
capability: health-data-tools
provenance:
  level: stated
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Requirement: Reading raw data", "openspec/changes/add-health-mcp-core/proposal.md · What Changes", "openspec/changes/add-health-mcp-core/conversation.md · J1"]
  quote: null
  inferred: null
---
# read_data tool

## Purpose

The `read_data` tool SHALL return data points of one data type for a time range given as ISO 8601 timestamps or dates, interpreted in the user's time zone when no offset is given, with pagination for large results.

## Preconditions

An authenticated user; a data type and an ISO 8601 time range.

## Postconditions

The tool SHALL return the data points of that type in the range, interpreting times without an offset in the user's time zone, one page at a time with a continuation token when more records exist.

## Invariants

Only the calling user's data SHALL be returned.

## Failures

End before start or unknown data type: an error naming the invalid argument.
