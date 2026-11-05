---
id: EX-01m6p2r597gw7850rrrcnnfhvx
form: example
title: While a message is being typed the new version waits
subjects: [BR-01m6p2r4vmgte1n2wkwjx0q28w]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/app-update/conversation.md · J2"]
  quote: null
  inferred: "The wording of the half-written message is made up for the example."
---
# While a message is being typed the new version waits

## Given

A new version was published. The person has typed "két tojás és egy" in the message field and switched to another app.

## When

The person comes back to the app.

## Then

The app does not load the new version: the text is still in the field, and the day is loaded again. After the message is sent, the next time the app comes back it loads the new version.
