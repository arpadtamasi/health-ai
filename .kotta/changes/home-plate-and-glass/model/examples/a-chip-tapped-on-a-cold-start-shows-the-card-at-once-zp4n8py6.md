---
id: EX-01m3y2sndaek9kpja0zp4n8py6
form: example
title: "A chip tapped on a cold start shows the entry at once"
subjects: [QA-01m3y2sn77z4s7pszem174t194]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/home-plate-and-glass/conversation.md · J2", ".kotta/changes/archive/2026-10-02-app-one-flow/proposal.md · What changes"]
  quote: "nem kell meleg példány, azt elfogadom, de számítson a frontend lassú reakcióra"
  inferred: "The numbers are sample values chosen by the assistant; reworked for the plate."
---
# A chip tapped on a cold start shows the entry at once

## Given

The service has been idle for an hour and the first answer takes eight seconds.

## When

The person taps the chip for their usual coffee.

## Then

The coffee appears among today's entries at once, dimmed and marked as saving, its layer is already on the plate, the notice that the connection is slow appears after 2.5 seconds, and when the server answers the entry is confirmed without a second one appearing.
