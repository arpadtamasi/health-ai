---
id: BR-01m3ec2jjaqp80zks6pseeh1xg
form: business-rule
title: "Every tool call states its intent"
capability: service-insight
provenance:
  level: stated
  decided_by: agent-proposed-human-approved
  sources: ["openspec/changes/add-health-mcp-core/conversation.md · P13", "openspec/changes/add-health-mcp-core/specs/service-insight/spec.md"]
  quote: "feedback tool. Itt az agent vagy a user adhat feedbacket […] jó, ha értjük, mit miért hív."
  inferred: "The owner chose these options in chat on 2026-09-26 from the agent's proposals (required intent that never blocks, stored and protected with 90-day retention, owner-only review tools)."
---
# Every tool call states its intent

## Rule

Every tool SHALL accept an `intent` argument, one sentence saying why the call is made, and the system SHALL record the tool name, the intent and the time for the owner. A call without an intent SHALL still be executed, and the missing intent SHALL be recorded.

## Rationale

The owner wants to understand what is called and why, to improve the service (conversation P13). A missing intent never blocks the user.

## Scope

Capability `service-insight`: every tool call from every user.
