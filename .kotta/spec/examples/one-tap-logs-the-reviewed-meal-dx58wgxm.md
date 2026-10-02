---
id: EX-01m3rvsr1m8dv503d3dx58wgxm
form: example
title: "One tap logs the reviewed meal"
subjects: [US-01m3rvr6g951cs1s9p1czxvmhp]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/mobile-app-daily-balance/proposal.md · What changes"]
  quote: null
  inferred: "The concrete numbers are sample values chosen for the mockups, not the owner's data."
---
# One tap logs the reviewed meal

## Given

The phone user has checked the proposed meal and the lunch type is set.

## When

The user taps "Log lunch".

## Then

The meal is written to Google Health as one entry, the Today figure drops by the meal's calories, and the meal appears in the list.
