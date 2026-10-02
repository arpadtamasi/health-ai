---
id: EX-01m3y2d5jng87ap6mmb7shz36n
form: example
title: "Reopening the app shows the conversation again"
subjects: [BR-01m3y2d5dkmsvqxp9ahxser706]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/app-one-flow/proposal.md · What changes"]
  quote: "és a teszt alatt teljes chat history kell firestore-ba"
  inferred: "The owner said this in the session (not yet in the distilled conversation). The retention of 90 days, leaving the photos out, and deleting the chat with the whole history are the assistant's choices, listed as open decisions."
---
# Reopening the app shows the conversation again

## Given

The person wrote with the assistant yesterday and a photo was part of it.

## When

They open the app on another phone.

## Then

The conversation is back (their messages and the answers), the photo is shown as a note that a photo was sent, and no photo is kept on our side.
