---
id: EX-01m6rhz632532q600eazqvxsfe
form: example
title: A photo that did not reach the service is not blamed on the photo
subjects: [BR-01m6rhz5t5b2p9n35twmgv4bkn]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: [".kotta/changes/send-errors/conversation.md · SZ1", ".kotta/changes/send-errors/conversation.md · J1"]
  quote: "Csináld most"
  inferred: "The times are the assistant's."
---
# A photo that did not reach the service is not blamed on the photo

## Given

It is 11:20; the person sends a photo of their lunch and the connection to the service drops before the reply.

## When

The message does not go out.

## Then

Under it the app says "Nem ment el", that the service could not be reached, and offers "Újra"; it does not say the photo could not be read. The owner's list_feedback shows a record from the app at 11:20: the step "sending", status 0, code "network", with a photo, and no text or photo of the message.
