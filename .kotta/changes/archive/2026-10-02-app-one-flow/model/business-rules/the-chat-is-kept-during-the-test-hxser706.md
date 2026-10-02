---
id: BR-01m3y2d5dkmsvqxp9ahxser706
form: business-rule
title: "The chat is kept during the test"
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/app-one-flow/proposal.md · What changes"]
  quote: "és a teszt alatt teljes chat history kell firestore-ba"
  inferred: "The owner said this in the session (not yet in the distilled conversation). The retention of 90 days, leaving the photos out, and deleting the chat with the whole history are the assistant's choices, listed as open decisions."
---
# The chat is kept during the test

## Rule

During the test the service SHALL keep every message of a person's chat with the assistant (their text and the assistant's answer as the events it produced) in its own storage, SHALL NOT keep the photos, SHALL delete these messages 90 days after they were written, and SHALL delete them at once when the person deletes their whole history or all their data. The consent text SHALL say that the conversation is kept.

## Rationale

The owner wants the full conversation of the test to be available ("és a teszt alatt teljes chat history kell firestore-ba"), so that the app can be improved from real use and so that reopening the app shows the conversation again. This replaces the earlier decision that the chat lives only on the phone. Photos are not kept, as decided before: they go to the AI provider for the answer only.

## Scope

Testers of the app, for the length of the test. The decision to keep the chat after the test is not made here.
