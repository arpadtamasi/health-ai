---
id: US-01m3w51cjntkh2v1r59kx570dr
form: user-story
title: "Use the app without Google Health"
actor: [A-01m3rvr5z4n6ny0qnm5mm438zp]
accepted: ["unimplemented: the app needs Google Health today: no own storage of meals and water, and the sign-in asks for the Health permissions"]
provenance:
  level: stated
  decided_by: human
  sources: [".kotta/changes/mobile-app-daily-balance/conversation.md · SZ12", ".kotta/changes/mobile-app-daily-balance/conversation.md · P31", ".kotta/changes/mobile-app-daily-balance/conversation.md · P32", ".kotta/changes/mobile-app-daily-balance/conversation.md · P34", ".kotta/changes/mobile-app-daily-balance/conversation.md · P36"]
  quote: "elmenne google health nélkül is, azt külön dughatnám rá"
  inferred: null
---
# Use the app without Google Health

## Story

As a phone user, I want to use the app (home, logging, water, suggestions) without a Google Health account connected, so that I can start without a Fitbit.

## Value

The owner's wife has no Fitbit yet; the app should not need one to be useful. Google Health is plugged in separately later.

## Notes

Today the sign-in asks for the Google Health permissions, and meals and water are written to Google Health and read back from it. Without it the app needs a place of its own for the log.

## Decided by the owner

- Our own storage keeps more than Google Health gets: for every entry the name, the ingredients the model recognised, the source (photo, typed or button) and that the values are an estimate; Google Health, when connected, gets only the name and the numbers, which is all it takes ("mindkettő ok", to the proposal about the description of the photo).
- The landing page promise "Health values stored by us: None" is reworded to say plainly what we keep (meals, water, goals, the foods to avoid), that it is kept until the person deletes it, and that deleting everything is one command in the app ("3 jó").
- Meals and water live in our own storage always, and are mirrored to Google Health when it is connected ("igen egyetértek").
- Only invited accounts may sign in, with a plain Google sign-in that asks for no Health permission ("igen").
