---
id: EX-01m6pmf9zhdr5wntczz8ncfdrj
form: example
title: Stop keeps what was already logged
subjects: [BR-01m6pmf9avbbgd373z1jcvvaqw]
provenance:
  level: inferred
  decided_by: agent-decided
  sources: [".kotta/changes/streamed-reply/conversation.md · SZ1"]
  quote: null
  inferred: "The dish is made up for the example."
---
# Stop keeps what was already logged

## Given

The assistant has logged two boiled eggs, their card is shown, and it is writing a long suggestion for dinner.

## When

The person taps Stop.

## Then

The reply stops where it is and keeps what was written; the eggs stay logged with their card; nothing else is logged; Send comes back in place of Stop.
