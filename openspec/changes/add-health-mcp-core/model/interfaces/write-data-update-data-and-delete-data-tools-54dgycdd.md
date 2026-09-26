---
id: IF-01m3eb1gy6aa3z553154dgycdd
form: interface
title: "write_data, update_data and delete_data tools"
capability: health-data-tools
provenance:
  level: stated
  decided_by: human
  sources: ["openspec/changes/add-health-mcp-core/conversation.md · P2", "openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Requirement: Writing, updating and deleting records", "openspec/changes/add-health-mcp-core/proposal.md · What Changes"]
  quote: "chatben átbeszélni, hogy mit ettem, esetleg fotózni és rendesen regisztrálni a healthben"
  inferred: null
---
# write_data, update_data and delete_data tools

## Purpose

The system SHALL allow creating, updating and deleting records of writable data types, including nutrition log entries and hydration entries, and SHALL return the upstream record id for every created record so it can later be updated or deleted.

## Preconditions

An authenticated user with write scope for the data type.

## Postconditions

`write_data` SHALL create the record in the user's Google Health account and return its upstream id; `update_data` and `delete_data` SHALL change or remove a record the user owns by that id.

## Invariants

Values SHALL pass through unchanged apart from format conversion.

## Failures

Read-only data type: an error, and nothing is sent upstream.
