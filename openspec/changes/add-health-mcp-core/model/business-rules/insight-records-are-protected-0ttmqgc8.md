---
id: BR-01m3ec2jxj4979r5rs0ttmqgc8
form: business-rule
title: "Insight records are protected"
capability: service-insight
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: ["openspec/changes/add-health-mcp-core/conversation.md · P13", "openspec/changes/add-health-mcp-core/specs/service-insight/spec.md"]
  quote: "feedback tool. Itt az agent vagy a user adhat feedbacket […] jó, ha értjük, mit miért hív."
  inferred: "The owner chose these options in chat on 2026-09-26 from the agent's proposals (required intent that never blocks, stored and protected with 90-day retention, owner-only review tools). Keeping the text out of application logs follows the existing rule No health data in logs."
---
# Insight records are protected

## Rule

Feedback and intent records SHALL be stored outside the application logs, SHALL be readable only by the owner, SHALL be deleted by `delete_my_data` for that user, and SHALL be deleted automatically 90 days after they were written.

## Rationale

Intents and feedback can contain health information about testers; access, deletion and retention protect it while keeping free text useful.

## Scope

Capability `service-insight`: all feedback and intent records.
