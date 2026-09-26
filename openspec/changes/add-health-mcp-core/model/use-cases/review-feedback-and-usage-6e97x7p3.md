---
id: UC-01m3ec2hg1t08j7m3b6e97x7p3
form: use-case
title: "Review feedback and usage"
capability: service-insight
actor: [A-01m3ec2gg5chbg5jx626bj8mj9]
goal: [G-01m3ec2gtq0nnneh96gv3vcrwq]
interfaces: [IF-01m3ec2j6wkazgfenh95w6mn4b]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/conversation.md · P13", "openspec/changes/add-health-mcp-core/specs/service-insight/spec.md"]
  quote: null
  inferred: "The use case steps are assembled by the agent from the owner's request and the chosen options."
---
# Review feedback and usage

## Intent

The owner learns from feedback and call intents what to improve.

## Preconditions

The caller is the owner.

## Main success scenario

1. The owner asks their agent for recent feedback or a usage summary.
2. The agent calls `list_feedback` or `usage_summary`.
3. The owner reads feedback newest first, and call counts and intents per tool.

## Alternatives

- A tester's client cannot see or call these tools.
