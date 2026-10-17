---
id: EX-01m3ssfx5e99rb6mfjgz4z1j4d
form: example
title: "The first chat sets constraints, goal and window before any suggestion"
subjects: [US-01m3rw2bqxkqp6v1hg9g02t1zr]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/mobile-app-daily-balance/conversation.md · P18"]
  quote: "13 egy chat onboard inkább"
  inferred: "The sample answers and numbers are mine, for the mockup."
---
# The first chat sets constraints, goal and window before any suggestion

## Given

A new user has signed in and has not set anything yet.

## When

The user opens the app and answers the chat: "Nuts, and I don't like fish", then "1900, from 7 to 22", then taps "Agree and continue".

## Then

The chat confirms no nuts, no fish, 1,900 kcal and 7:00 to 22:00 with a default split of carbs and protein, shows the not-medical-advice notice and the consent, and only after the tap does "What should I eat now?" give suggestions, none of which contains nuts or fish.
