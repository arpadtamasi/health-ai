---
id: EX-01m3y1psv757h8gqc5wmmky3rj
form: example
title: "A lunch logged as a snack is moved with the meal type and time chips"
subjects: [US-01m3rvr6vsnzps8jrdz05gja1y]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/app-one-flow/conversation.md · SZ1"]
  quote: null
  inferred: "The numbers and the wording are sample values chosen by the assistant."
---
# A lunch logged as a snack is moved with the meal type and time chips

## Given

A lunch entry of 13:00 is logged as a snack.

## When

The person taps Edit and chooses Lunch.

## Then

The entry keeps its id in our storage, its type is lunch, and the Google Health copy, when connected, is replaced.
