---
id: BR-01m6rhz5t5b2p9n35twmgv4bkn
form: business-rule
title: 'A failed message says why, and the owner can read the failure'
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: [".kotta/changes/send-errors/conversation.md · SZ1", ".kotta/changes/send-errors/conversation.md · J1"]
  quote: "Csináld most"
  inferred: "The reasons named, the stages, and keeping the record 90 days like feedback are the assistant's."
---
# A failed message says why, and the owner can read the failure

## Rule

When a message does not go out, the app SHALL say why under it: no connection to the service, it took too long, the service failed, the service refused the message, or the daily limit is used up; it SHALL NOT say the photo could not be read unless the service said so. Each failed send SHALL be recorded for the owner with the time, the step that failed (getting the ticket, sending, the reply), the HTTP status, the error code and whether photos were attached, never the message's text or photos; the record SHALL be kept 90 days, like feedback, and SHALL be readable by the owner with list_feedback.

## Rationale

A photo that did not go out said "Ezt a képet nem tudtam elolvasni" whatever had failed, and the owner could not tell what happened; nothing on the service side could be read from the conversation either (SZ1). Saying the real reason lets the person act, and the record lets the owner find the cause.

## Scope

The app's conversation and the what-now sheet. The record holds no content of the message.
