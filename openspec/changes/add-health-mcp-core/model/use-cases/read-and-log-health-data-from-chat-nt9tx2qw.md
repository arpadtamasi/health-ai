---
id: UC-01m3eb1mtkgbt7bzs7nt9tx2qw
form: use-case
title: "Read and log health data from chat"
capability: health-data-tools
actor: [A-01m3eb1kceqrt9s4dt82k0bs42, A-01m3eb1kqkzfqzy7jwdanwgedx]
goal: [G-01m3eb1k0f2ts07bx8phb8aypr]
interfaces: [IF-01m3eb1fytpbacz2b3vfnsjrjw, IF-01m3eb1g9r4bt0fvmyf568svj5, IF-01m3eb1gm40cg5a4wsfgzrb0xb, IF-01m3eb1gy6aa3z553154dgycdd, IF-01m3eb1h8hhcepg1fkb4kk5chw, IF-01m3eb1b7edb7e1dh0rft2dq63]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md", "openspec/changes/add-health-mcp-core/design.md · Decisions"]
  quote: null
  inferred: "The use case sequence is assembled by the agent from the requirements and the design."
---
# Read and log health data from chat

## Intent

The user asks about their health data and logs what they ate or drank, in conversation.

## Preconditions

The user is connected.

## Main success scenario

1. The client lists the available data types.
2. The client reads or aggregates data for the user's question.
3. The client writes a nutrition or hydration record the user confirmed, and can later update or delete it.

## Alternatives

- A write to a read-only type is refused.
- Upstream rate limit: a readable error to retry later.
