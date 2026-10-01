---
id: US-01m3rvr6am99nrrbycxfw4r6v4
form: user-story
title: "Choose food and quantity with the camera"
actor: [A-01m3rvr5z4n6ny0qnm5mm438zp]
provenance:
  level: stated
  decided_by: human
  sources: [".kotta/changes/mobile-app-daily-balance/proposal.md · Why", ".kotta/changes/mobile-app-daily-balance/conversation.md · P15", ".kotta/changes/mobile-app-daily-balance/conversation.md · P16", ".kotta/changes/mobile-app-daily-balance/conversation.md · P18"]
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

## Decided by the owner

- (Decided, not yet built) Photos are kept for 14 days during the test period, so the estimates can be checked, and are never stored after the test; the consent screen says so ("ok a 14", after "valószínűleg nem sokáig de a teszt alatt igen").
- The service pays for the photo analysis; the limit is per user and counted in tokens, taken from the model response ("token az is, jön a response-ból").

## Implementation notes

Built: the camera button opens the camera, asks for permission with an explanation, and sends the photo to the model with the question; the answer is the three cards of the story "Ask what to eat to catch up". The model recognised a real plate photo (chicken, couscous, roasted vegetables) on the cheapest model. Not built: reviewing and adjusting portions after the photo, and keeping the photo: **the photo is not stored at all today**, it is only sent to the model.

## Open decisions

1. The consent text in the onboarding says photos are kept for 14 days during the test, but nothing stores them. Options: build the storage (a private bucket with a 14-day expiry, deleted by *delete_my_data*), or change the text to say photos are not stored. Suggestion (mine): change the text now and add storage only if checking estimates against photos turns out to be needed.
