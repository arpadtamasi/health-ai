---
id: UC-01m3eb1n59mc158c59xxp6ft9j
form: use-case
title: "Delete my data"
capability: mcp-server
actor: [A-01m3eb1kceqrt9s4dt82k0bs42]
goal: [G-01m3eb1j8jfv3wqp0rye2ne6tn]
interfaces: [IF-01m3eb1cqb3yah1ydzbas3hvar]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-server/spec.md", "openspec/changes/add-health-mcp-core/design.md · Decisions"]
  quote: null
  inferred: "The use case sequence is assembled by the agent from the requirements and the design."
---
# Delete my data

## Intent

The user removes everything Health AI stores about them.

## Preconditions

The user is connected.

## Main success scenario

1. The user asks to delete their data and confirms.
2. The server revokes the Google grant, deletes the user's records and invalidates their tokens.

## Alternatives

- No confirmation: nothing is deleted.
