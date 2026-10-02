---
id: EX-01m3y2d5qsdtn4859z4ntbvm0t
form: example
title: "Deleting the whole history also deletes the conversation"
subjects: [BR-01m3y2d5dkmsvqxp9ahxser706]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/app-one-flow/proposal.md · What changes"]
  quote: "és a teszt alatt teljes chat history kell firestore-ba"
  inferred: "The owner said this in the session (not yet in the distilled conversation). The retention of 90 days, leaving the photos out, and deleting the chat with the whole history are the assistant's choices, listed as open decisions."
---
# Deleting the whole history also deletes the conversation

## Given

The person has meals, water and a conversation stored.

## When

They confirm the deletion of their whole history.

## Then

The entries and every stored message of the conversation are deleted, and nobody else's are touched.
