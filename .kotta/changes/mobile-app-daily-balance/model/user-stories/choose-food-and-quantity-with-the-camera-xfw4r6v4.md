---
id: US-01m3rvr6am99nrrbycxfw4r6v4
form: user-story
title: "Choose food and quantity with the camera"
actor: [A-01m3rvr5z4n6ny0qnm5mm438zp]
provenance:
  level: stated
  decided_by: human
  sources: [".kotta/changes/mobile-app-daily-balance/proposal.md · Why", ".kotta/changes/mobile-app-daily-balance/conversation.md · P15", ".kotta/changes/mobile-app-daily-balance/conversation.md · P16", ".kotta/changes/mobile-app-daily-balance/conversation.md · P18", ".kotta/changes/mobile-app-daily-balance/conversation.md · P36"]
  quote: "segítsen kaját, mennyiséget választani kamerával"
  inferred: null
---
# Choose food and quantity with the camera

## Story

As a phone user, I want to point the camera at my plate and have the app propose the foods and their quantities, so that I only correct what is wrong instead of describing the meal.

## Value

Describing a meal in words is most of what the chat costs today; the camera turns it into checking.

## Notes

Screenshots: ![Camera](screens/chat-11-camera.png) ![Answer in the chat](screens/chat-12-answer.png) ![Earlier sketch: portion review, to redraw](screens/03-review.png)

The camera opens from the button in the chat input bar. There is nothing to choose before the photo: the model reads whether it is a fridge, a menu, a counter or a plate; "Type instead" remains ("11 fotónál minek megadni, hogy mi lesz? a modell leolvassa"). The portion review sketch is from the first round and is to be redrawn.

The photo is shown in its bubble in the chat on the phone. Today the conversation lives only in the phone's memory and is gone when the app is reopened; the photo with it.

## Decided by the owner

- Photos and the chat history live on the phone only, for now: the history is kept on the device so that reopening the app shows the last conversation, the photo as a small thumbnail; we keep no photos and no chat text on our side, and the consent text says photos are not stored by us instead of the 14 days written there today ("fotó most ok").
- The service pays for the photo analysis; the limit is per user and counted in tokens, taken from the model response ("token az is, jön a response-ból").

## Implementation notes

Built: the camera button opens the camera, asks for permission with an explanation, and sends the photo to the model with the question; the answer is the three cards of the story "Ask what to eat to catch up". The model recognised a real plate photo (chicken, couscous, roasted vegetables) on the cheapest model. Not built: reviewing and adjusting portions after the photo, and keeping the photo: **the photo is not stored at all today**, it is only sent to the model.
