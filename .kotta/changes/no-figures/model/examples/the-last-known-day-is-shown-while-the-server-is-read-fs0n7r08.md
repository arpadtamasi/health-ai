---
id: EX-01m3y2snsqw3e3th7rfs0n7r08
form: example
title: "The last known day is shown while the server is read"
subjects: [QA-01m3y2sn77z4s7pszem174t194]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: [".kotta/changes/no-figures/conversation.md · J1"]
  quote: "számsor A"
  inferred: "Only the row of figures is taken out; the rest of the node is as accepted."
---
# The last known day is shown while the server is read

## Given

The person used the app this morning and opens it again at noon on a slow connection.

## When

The app starts.

## Then

The plate, the glass with its litres and today's entries of the morning are drawn at once from the device, moved to the time of day now, and are replaced by the server's answer when it arrives; on another day the stored day is not shown.
