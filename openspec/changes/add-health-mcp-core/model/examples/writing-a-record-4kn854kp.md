---
id: EX-01m3eb1y60zk5vagdr4kn854kp
form: example
title: "Writing a record"
capability: health-data-tools
subjects: [BR-01m3eb1fm9kjbng60zvjgc34yn]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/health-data-tools/spec.md · Scenario: Writing a record"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Writing a record

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

A client calls `write_data` with a record whose values are valid for the data type

## Then

The same values are sent to the Google Health API and the created record, including its upstream id, is returned
