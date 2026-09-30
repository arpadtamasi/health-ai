---
id: EX-01m3eb22dbzdy5e977dsvrm263
form: example
title: "Connected screen after sign-in"
capability: mcp-auth
subjects: [BR-01m3eb1hxc1z2rfzkd2jcgeae2, UC-01m3eb1m382wdbntqfffats3ds]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: ["openspec/changes/add-health-mcp-core/conversation.md · J2"]
  quote: null
  inferred: "Given states the usual precondition (an allow-listed, connected user) that the scenario leaves implicit."
---
# Connected screen after sign-in

## Given

An allow-listed Health AI user whose AI chat client is connected, unless the step below says otherwise.

## When

The Google callback succeeds for an allow-listed user

## Then

The Connected screen is shown, continues to the client's redirect URI after one to two seconds, and a button returns immediately
