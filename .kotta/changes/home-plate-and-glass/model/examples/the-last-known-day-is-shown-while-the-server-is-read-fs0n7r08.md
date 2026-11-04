---
id: EX-01m3y2snsqw3e3th7rfs0n7r08
form: example
title: "The last known day is shown while the server is read"
subjects: [QA-01m3y2sn77z4s7pszem174t194]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/home-plate-and-glass/conversation.md · J2", ".kotta/changes/archive/2026-10-02-app-one-flow/proposal.md · What changes"]
  quote: "nem kell meleg példány, azt elfogadom, de számítson a frontend lassú reakcióra"
  inferred: "The wording is the assistant's; reworked for the plate."
---
# The last known day is shown while the server is read

## Given

The person used the app this morning and opens it again at noon on a slow connection.

## When

The app starts.

## Then

The plate, the glass, the figures and today's entries of the morning are drawn at once from the device, moved to the time of day now, and are replaced by the server's answer when it arrives; on another day the stored day is not shown.
