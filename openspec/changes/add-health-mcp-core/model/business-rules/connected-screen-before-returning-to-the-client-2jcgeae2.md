---
id: BR-01m3eb1hxc1z2rfzkd2jcgeae2
form: business-rule
title: "Connected screen before returning to the client"
capability: mcp-auth
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: ["openspec/changes/add-health-mcp-core/conversation.md · J2", "docs/designs/signin-flow-brief.md · 5. States"]
  quote: "Legyen-e köztes „Connected” képernyő […]? Én a köztes képernyőt javaslom. — Legyen. Igen"
  inferred: "The 1–2 second delay and the immediate-return button come from the agent's proposal and the design brief."
---
# Connected screen before returning to the client

## Rule

After a successful Google callback the server SHALL show a Connected screen before redirecting to the MCP client's redirect URI, SHALL continue automatically after a short delay of one to two seconds, and SHALL let the user continue immediately.

## Rationale

The OAuth redirect otherwise returns to the client with no confirmation; the owner chose a short confirmation screen (conversation J2).

## Scope

Capability `mcp-auth`: every successful sign-in and reconnect.
