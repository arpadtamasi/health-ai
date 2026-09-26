---
id: BR-01m3ecxdq6nqjjejph3j93jws4
form: business-rule
title: "Agents are asked to report friction"
capability: service-insight
provenance:
  level: stated
  decided_by: human
  sources: ["openspec/changes/add-health-mcp-core/conversation.md · P14", "openspec/changes/add-health-mcp-core/specs/service-insight/spec.md · Requirement: Agents are asked to report friction"]
  quote: "Olyan is, amit a modell jelez, hogy mondjuk túl sok hívás kellett valamihez, vonjuk össze."
  inferred: null
---
# Agents are asked to report friction

## Rule

The server instructions and the `send_feedback` tool description SHALL ask the agent to send feedback on its own when using the service took more calls than the task needed, when a result was confusing, or when a capability was missing, without asking the user first.

## Rationale

The owner wants feedback from real use, including the model's own view of friction, so that tools can be merged or improved (conversation P14).

## Scope

Capability `service-insight`: every connected AI agent.
