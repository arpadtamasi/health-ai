---
id: EX-01m3w51dz4w9fapbyyvm1xps3s
form: example
title: "Connecting Google Health later makes new entries show in the Fitbit app"
subjects: [US-01m3w51cs0tvb44382vsx72nsp]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/mobile-app-daily-balance/proposal.md · What changes"]
  quote: null
  inferred: "The numbers and the exact wording are sample values chosen by the assistant."
---
# Connecting Google Health later makes new entries show in the Fitbit app

## Given

The person has used the app for two weeks without Google Health and has 40 entries.

## When

They connect Google Health.

## Then

Entries from then on are written to our storage and to Google Health, and the Fitbit app shows them; the earlier entries stay only in our storage.
