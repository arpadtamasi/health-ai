---
id: IF-01m3ec2j6wkazgfenh95w6mn4b
form: interface
title: "list_feedback and usage_summary tools"
capability: service-insight
provenance:
  level: stated
  decided_by: agent-proposed-human-approved
  sources: ["openspec/changes/add-health-mcp-core/conversation.md · P13", "openspec/changes/add-health-mcp-core/specs/service-insight/spec.md"]
  quote: "feedback tool. Itt az agent vagy a user adhat feedbacket […] jó, ha értjük, mit miért hív."
  inferred: "The owner chose these options in chat on 2026-09-26 from the agent's proposals (required intent that never blocks, stored and protected with 90-day retention, owner-only review tools)."
---
# list_feedback and usage_summary tools

## Purpose

Lets the owner review feedback and call intents from the chat.

## Preconditions

The caller is the owner's account (allow-list entry marked as owner).

## Postconditions

`list_feedback` SHALL return feedback newest first with source, related tool and time; `usage_summary` SHALL return call counts per tool and the recorded intents for a time range.

## Invariants

Other accounts SHALL neither see these tools in `tools/list` nor be able to call them.

## Failures

Called by a non-owner: refused. Invalid time range: an error naming the invalid argument.
