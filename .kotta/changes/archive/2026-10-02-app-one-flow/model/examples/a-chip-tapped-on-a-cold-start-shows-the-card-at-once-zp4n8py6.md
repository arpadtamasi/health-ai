---
id: EX-01m3y2sndaek9kpja0zp4n8py6
form: example
title: "A chip tapped on a cold start shows the card at once"
subjects: [QA-01m3y2sn77z4s7pszem174t194]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/app-one-flow/proposal.md · What changes"]
  quote: "nem kell meleg példány, azt elfogadom, de számítson a frontend lassú reakcióra"
  inferred: "The numbers are sample values chosen by the assistant."
---
# A chip tapped on a cold start shows the card at once

## Given

The service has been idle for an hour and the first answer takes eight seconds.

## When

The person taps the chip for their usual coffee.

## Then

A card for the coffee appears at once, dimmed and marked as saving, the hero and the chart already count it, the notice that the connection is slow appears after 2.5 seconds, and when the server answers the card is confirmed without a second one appearing.
