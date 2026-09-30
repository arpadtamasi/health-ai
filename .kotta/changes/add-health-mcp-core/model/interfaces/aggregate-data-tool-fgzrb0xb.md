---
id: IF-01m3eb1gm40cg5a4wsfgzrb0xb
form: interface
title: "aggregate_data tool"
capability: health-data-tools
provenance:
  level: stated
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Requirement: Aggregated data", "openspec/changes/add-health-mcp-core/proposal.md · What Changes", "openspec/changes/add-health-mcp-core/conversation.md · J1"]
  quote: null
  inferred: null
---
# aggregate_data tool

## Purpose

The `aggregate_data` tool SHALL return values of one data type aggregated into day, week or hour buckets over a time range, using the aggregation the Google Health API provides for that type.

## Preconditions

An authenticated user; a data type, a range and a bucket of hour, day or week.

## Postconditions

The tool SHALL return the type's values aggregated per bucket over the range, using the aggregation the Google Health API provides for that type.

## Invariants

Only the calling user's data SHALL be aggregated.

## Failures

Invalid bucket, range or type: an error naming the invalid argument.
