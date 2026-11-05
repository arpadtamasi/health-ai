---
id: EX-01m6ph6eh98wgvrjw6gyy2r9tr
form: example
title: A message that did not go out can be sent again
subjects: [BR-01m6ph6dq7aszxhxgzz4kgr8d4, QA-01m3y2sn77z4s7pszem174t194]
provenance:
  level: inferred
  decided_by: agent-decided
  sources: [".kotta/changes/ettem-ennek/conversation.md · J2"]
  quote: null
  inferred: "The dish is made up for the example; that Újra sends exactly once follows the slow-response quality."
---
# A message that did not go out can be sent again

## Given

The connection drops while the person sends "két tojás és egy pirítós".

## When

The request fails.

## Then

Under the message it says "Nem ment el · Újra"; nothing is logged and nothing is sent again by itself. Tapping "Újra" sends the same message, and the eggs and toast are logged once.
