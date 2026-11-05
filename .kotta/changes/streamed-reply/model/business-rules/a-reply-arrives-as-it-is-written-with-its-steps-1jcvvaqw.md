---
id: BR-01m6pmf9avbbgd373z1jcvvaqw
form: business-rule
title: 'A reply arrives as it is written, with its steps'
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/streamed-reply/conversation.md · SZ1", ".kotta/changes/streamed-reply/conversation.md · SZ2", ".kotta/changes/streamed-reply/conversation.md · J1"]
  quote: "A folyó válasz, a látható lépések és a Leállítás gomb."
  inferred: "The step wording, what happens to the steps afterwards and the Stop semantics are the assistant's proposal, modelled on the oktat-ai chat (status, growing text, a list of steps)."
---
# A reply arrives as it is written, with its steps

## Rule

While the assistant answers, its reply SHALL appear as it is written, and each step it takes (looking at the photo, reading today, logging an entry, finding options) SHALL appear as a line when it starts and be marked done when it ends, above the reply's text. While a reply is being written, a Stop button SHALL stand in place of Send; Stop SHALL end the reply where it is, keep what was written, keep every entry already logged (with its card) and log nothing after it. A logged entry's card SHALL appear as soon as that step is done, not at the end of the reply.

## Rationale

The owner wants the conversation to feel like Claude or ChatGPT (SZ1), and named the oktat-ai chat, where the steps show while the answer is made (SZ2). An answer that appears only after several model steps feels stuck; a visible step says what is happening.

## Scope

The conversation sheet and the "What should I eat now?" sheet. The way the reply reaches the phone (one streamed request, or the app asking for progress) is chosen by a probe of Firebase Hosting (J1); either way the person sees the same.

## Open decisions

- After the reply is done, should its steps disappear (as in the oktat-ai chat) or stay folded into one quiet line that opens on a tap?
