# The conversation starts a new page each day

## Why

"De ráadásul naponta új lap indulhatna a chatben is. Ez persze behozza a history kérdését" (SZ1); the owner chose 1a and 2a (J1):
no earlier days in the app, and the assistant reads only today's conversation. It also keeps a day's history short, which a long
day's conversation had broken ("Nem ment el", fixed on the server separately).

## What changes

- The conversation starts a new page when the diary's day changes in the person's time zone; earlier days are not shown; the
  assistant is given only today's conversation; a page open at the change stays until the app comes back to the front.
  Rule "The conversation keeps what happened in it".
- "Reopening the app shows the conversation again" now reopens the same day's conversation.
- New example "A new day starts a new page in the conversation".
- Storage is unchanged: the rule "The chat is kept during the test" still keeps every message for 90 days.

## Open decisions

None.
