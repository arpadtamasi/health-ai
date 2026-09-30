---
id: IF-01m3eb1h8hhcepg1fkb4kk5chw
form: interface
title: "get_profile and list_devices tools"
capability: health-data-tools
provenance:
  level: stated
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Requirement: Profile and devices", "openspec/changes/add-health-mcp-core/proposal.md · What Changes", "openspec/changes/add-health-mcp-core/conversation.md · J1"]
  quote: null
  inferred: null
---
# get_profile and list_devices tools

## Purpose

The `get_profile` tool SHALL return the user's profile settings relevant to interpreting data (time zone, units, and, if available, age, height and weight), and `list_devices` SHALL return the user's connected devices with type, battery level and last sync time where the API provides them.

## Preconditions

An authenticated user.

## Postconditions

`get_profile` SHALL return time zone, units and, where available, age, height and weight; `list_devices` SHALL return connected devices with type, battery level and last sync time where the API provides them.

## Invariants

Only the calling user's profile and devices SHALL be returned.

## Failures

Upstream errors are reported as readable tool errors.
