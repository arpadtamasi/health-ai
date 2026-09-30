---
id: UC-01m3ec2h5aesz6dj5w4c6e5ape
form: use-case
title: "Give feedback on the service"
capability: service-insight
actor: [A-01m3eb1kceqrt9s4dt82k0bs42, A-01m3eb1kqkzfqzy7jwdanwgedx]
goal: [G-01m3ec2gtq0nnneh96gv3vcrwq]
interfaces: [IF-01m3ec2hvdh0e2j8fs6n0xrgst]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/conversation.md · P13", "openspec/changes/add-health-mcp-core/specs/service-insight/spec.md"]
  quote: null
  inferred: "The use case steps are assembled by the agent from the owner's request and the chosen options."
---
# Give feedback on the service

## Intent

The user, or the agent on its own, tells the owner what worked or did not.

## Preconditions

The user is connected.

## Main success scenario

1. The user asks the agent to pass on feedback, or the agent notices a problem.
2. The agent calls `send_feedback` with the message, the source and optionally the related tool.
3. The tool confirms that the feedback was received.

## Alternatives

- Empty message: nothing is stored.
