---
id: US-01m3w51bzh8h6t8npn6k80r782
form: user-story
title: "Start logging from one button on the home"
actor: [A-01m3rvr5z4n6ny0qnm5mm438zp]
provenance:
  level: stated
  decided_by: human
  sources: [".kotta/changes/ettem-ennek/conversation.md · J1", ".kotta/changes/ettem-ennek/conversation.md · J2", ".kotta/changes/archive/2026-10-02-app-one-flow/conversation.md · SZ1"]
  quote: "nem megy a fotó meg az egész kicsit clunky; tervezd át az appot; a beszélgetéseimből akarom megtakarítani, amit lehet"
  inferred: null
---
# Start logging from one button on the home

## Story

As a phone user, I want a dock at the bottom of the home with my usual items as chips (the first is often "the same as yesterday's breakfast"), a water chip, the camera button (taking a photo now or choosing one from the gallery) and the text field, with a switch above them that says whether I log what I ate ("Ettem") or ask what to eat ("Ennék"), so that what I do five times a day is one tap and nothing else has to be opened first.

## Value

Logging is the most frequent action. The owner's own week was mostly the same few items (breakfast with bran, a cappuccino, a glass of water, a pogácsa) with small changes.

## Notes

The chips come from the history, as before: the most frequent items of the last 30 days, and the water chip only once water was logged. A chip logs at once: its layer grows on the plate, it joins today's entries, and a short bar above the dock offers Undo (this change replaces the card in the thread). Chips are at least 44 px tall.

The Log button of the earlier Status screen is gone: the text field and the camera are always there. The switch is the rule "The dock's switch says whether a message is what was eaten or what to eat"; the gallery lets a meal be logged afterwards from the photo taken at the table (J2).
