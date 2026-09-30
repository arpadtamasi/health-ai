---
id: IF-01m3ec2hvdh0e2j8fs6n0xrgst
form: interface
title: "send_feedback tool"
capability: service-insight
provenance:
  level: stated
  decided_by: human
  sources: ["openspec/changes/add-health-mcp-core/conversation.md · P13", "openspec/changes/add-health-mcp-core/specs/service-insight/spec.md", "openspec/changes/add-health-mcp-core/conversation.md · P14"]
  quote: "feedback tool. Itt az agent vagy a user adhat feedbacket […] jó, ha értjük, mit miért hív."
  inferred: null
---
# send_feedback tool

## Purpose

Lets the user, or the user's AI agent on its own, send feedback about Health AI to the owner.

## Preconditions

An authenticated user; a non-empty message; a source of `user` or `agent`; a kind of `bug`, `confusing`, `too_many_calls`, `missing_capability` or `other`; optionally the tools the feedback concerns.

## Postconditions

The tool SHALL store the feedback with its source, kind, the tools involved, the sender's user id and the time, and SHALL confirm that it was received.

## Invariants

Feedback SHALL be readable only by the owner.

## Failures

Empty message: nothing is stored, and the result says a message is required.
