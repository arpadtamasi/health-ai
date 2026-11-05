---
id: EX-01m3y2snkn5ckbaackcpjvzysf
form: example
title: "An action that failed is offered again and is never repeated by itself"
subjects: [QA-01m3y2sn77z4s7pszem174t194]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/home-plate-and-glass/conversation.md · J2", ".kotta/changes/archive/2026-10-02-app-one-flow/proposal.md · What changes"]
  quote: "nem kell meleg példány, azt elfogadom, de számítson a frontend lassú reakcióra"
  inferred: "The wording is the assistant's; reworked for the plate."
---
# An action that failed is offered again and is never repeated by itself

## Given

The person logged a meal and the server did not answer in time.

## When

The request is given up after the limit.

## Then

The entry under the plate and the bar above the dock say it could not be saved and offer Try again and Drop it; nothing was sent a second time without the person's tap, so the meal cannot be logged twice.
