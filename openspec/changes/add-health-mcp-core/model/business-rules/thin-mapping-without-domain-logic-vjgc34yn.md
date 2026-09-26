---
id: BR-01m3eb1fm9kjbng60zvjgc34yn
form: business-rule
title: "Thin mapping without domain logic"
capability: health-data-tools
provenance:
  level: stated
  decided_by: human
  sources: ["openspec/changes/add-health-mcp-core/conversation.md · SZ2", "openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Requirement: Thin mapping without domain logic", "openspec/changes/add-health-mcp-core/proposal.md · What Changes"]
  quote: "mcp butea. - igen, az api-t képezné le - aztán csomaolnék használat szerint"
  inferred: null
---
# Thin mapping without domain logic

## Rule

The tools MUST pass data between the client and the Google Health API without estimating, inferring, or altering health values, apart from format conversion between the MCP input schema and the API's request and response formats.

## Rationale

A thin, resource-oriented mapping keeps the server free of domain logic; packaging by use comes later (`proposal.md` · What Changes).

## Scope

Capability `health-data-tools`: every user and every MCP client of the Health AI server.
