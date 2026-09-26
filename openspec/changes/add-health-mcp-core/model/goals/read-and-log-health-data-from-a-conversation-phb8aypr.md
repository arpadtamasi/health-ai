---
id: G-01m3eb1k0f2ts07bx8phb8aypr
form: goal
title: "Read and log health data from a conversation"
capability: health-data-tools
measured_by: [EX-01m3eb20eeatc1kj35ezbxg3e9]
provenance:
  level: partly-inferred
  decided_by: human
  sources: ["openspec/changes/add-health-mcp-core/conversation.md · SZ1", "openspec/changes/add-health-mcp-core/conversation.md · SZ2", "openspec/changes/add-health-mcp-core/proposal.md · Why"]
  quote: "ai-ból nézném a fitbitet / meg mondjuk fotóznék kaját / rendes távoli mcp"
  inferred: "Outcome wording is the agent's summary of the owner's words; no target was stated."
---
# Read and log health data from a conversation

## Outcome

The user can ask about sleep, heart rate and activity, and log meals and water from a conversation, with the records landing in Google Health.

## Context

The Fitbit Web API shuts down on 2026-09-30; the server is built on the Google Health API v4. Users: the owner and invited testers (at most 100, Google OAuth Testing mode).

## Baseline and target

Baseline: no such tool exists for the owner today.

## Open decisions

- What target shows this goal is reached (for example a number of weekly uses, testers connected, or a time to connect)?
