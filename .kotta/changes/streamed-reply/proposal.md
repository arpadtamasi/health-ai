# Streamed reply

## Why

"A folyó válasz, a látható lépések és a Leállítás gomb" (SZ1): the reply arrives in one block after several model
steps, with only "Gondolkodom…" meanwhile, and cannot be stopped. In the oktat-ai chat the steps show while the answer is
made (SZ2).

## What changes

- The reply grows as it is written; each step (the photo, today, a log, options) shows as a line and is ticked when done;
  a logged entry's card shows as soon as it is logged; Stop replaces Send while writing and keeps what was done: rule
  "A reply arrives as it is written, with its steps".
- The start of an answer becomes a measured quality: "The answer starts to show at once" (its measure is open).
- "The conversation keeps what happened in it" points to the new rule instead of "the next change".
- The message model follows the oktat-ai chat (assistant-core): a status, the growing text, a list of steps, an error
  with Újra. Transport: one streamed request if Firebase Hosting passes it through, else the app asks for progress
  twice a second while the request is open (J1). No warm instance (J1). The temporary Hosting probe is removed.

## Open decisions

- After a reply is done, do its steps disappear or stay folded into one line?
- How soon must the first step or word show after Send, on a warm service and after a quiet hour?
