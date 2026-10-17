---
id: US-01m3w51bs6krjxa2rgb86qkft7
form: user-story
title: "Open on a full-screen home that shows the day"
actor: [A-01m3rvr5z4n6ny0qnm5mm438zp]
accepted: ["unimplemented: the full-screen Status and the Chat/Status switch are drawn but not built; the app opens on the chat today"]
provenance:
  level: stated
  decided_by: human
  sources: [".kotta/changes/mobile-app-daily-balance/conversation.md · SZ12", ".kotta/changes/mobile-app-daily-balance/conversation.md · P31", ".kotta/changes/mobile-app-daily-balance/conversation.md · P32"]
  quote: "nagyon kicsi az az állapotjelző a tetején; alapállapotban full screen jó lenne, valami jobb grafikával"
  inferred: null
---
# Open on a full-screen home that shows the day

## Story

As a phone user, I want the app to have two states, Status and Chat: Status is a full-screen picture of my day (calories, carbs, protein and water against the pace of the day, with the biggest gap as the hero), and Chat is a full chat with quick buttons in it, so that I see where I stand at a glance and act on it in one place.

## Value

The strip at the top of the chat is too small to be the main thing. The day's picture is what the owner opens the app for ("ahol állok"); the chat is how they act on it.

## Notes

Screenshots: ![Status](screens/home-20-status.png) ![Chat](screens/home-21-chat.png)

Status: the biggest gap as the hero figure, four rings (calories, carbs, protein, water) each with a tick where the plan for this time of day stands, and the logging buttons (see "Start logging from one button on the home"). Chat: the conversation with the quick buttons (frequent foods, water, the camera) above the composer, and a switch back to Status. There is no mixed state: when the chat comes up it is the chat.

## Decided by the owner

- The drawing of the Status is right ("igen").
- Two states only, Status or Chat: "ha feljön a chat, akkor chat, és abban vannak gyorsgombok; kb 2 állapot: chat vagy státusz". The earlier mockups with the chat over a shrunken strip and with a bottom sheet are dropped.
