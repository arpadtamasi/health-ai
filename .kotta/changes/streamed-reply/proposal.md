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
  with Újra. Transport: the reply streams straight from the Cloud Run service's own address, past Firebase Hosting,
  which holds a streamed response back until it ends (the probe: five lines written one a second all arrived together
  after 5.2 s). The app first gets a short-lived ticket through Hosting (where the sign-in cookie lives) and opens the
  stream with it; the service allows the app's origin (CORS). Polling was turned down (J2). The address can later move to
  an own domain by a Cloud Run domain mapping. No warm instance (J1). The temporary probe is removed.

## Open decisions

None: steps fold into one line when done; first sign within 1.5 s warm, 6 s after a quiet hour (J3).
