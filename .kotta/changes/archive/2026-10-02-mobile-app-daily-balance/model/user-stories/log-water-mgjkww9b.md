---
id: US-01m3w51c5vf6n7yr5pmgjkww9b
form: user-story
title: "Log water"
actor: [A-01m3rvr5z4n6ny0qnm5mm438zp]
accepted: ["unimplemented: water is not built: no hydration logging, goal or buttons yet"]
provenance:
  level: stated
  decided_by: human
  sources: [".kotta/changes/mobile-app-daily-balance/conversation.md · SZ12", ".kotta/changes/mobile-app-daily-balance/conversation.md · P31", ".kotta/changes/mobile-app-daily-balance/conversation.md · P32", ".kotta/changes/mobile-app-daily-balance/conversation.md · P34", ".kotta/changes/mobile-app-daily-balance/conversation.md · P35"]
  quote: "vizet nem kezel"
  inferred: null
---
# Log water

## Story

As a phone user, I want to log water (a glass, a large glass, a bottle, or an amount I say) and see my water against a daily goal, so that drinking enough is part of my day.

## Value

The app tracks food but not water, although the Fitbit side has a hydration log and the owner drinks water through the day.

## Notes

The quick buttons already sketched water at 250, 400 and 500 ml. The chat can log water by text too ("két pohár víz").

## Decided by the owner

- There is no water button at the start: the buttons come only from the history of use ("és ha kezdetben nincs vízgomb? a historyból jönnek a gombok"). The first glass is logged by chat (or by saying the amount); once it has been logged, it becomes a button, like the usual foods.
- The daily water goal is a setting like the food goals ("cél ugyanúgy mint a kaja"): the chat proposes a default and the person changes it by chat. Today the calorie goal is saved (from what the person says, or estimated in code from age, height, weight and aim); carbs and protein follow from it by a default split (about half of the calories from carbs, a quarter from protein, at 4 kcal per gram); fat is not tracked.
- The amounts are not fixed: they come from the chat ("két pohár víz", "fél liter") and the frequent ones become buttons ("nem fixálnám - ez is chatből jöhet és a gyakoriak gombra").
- Coffee, tea and other drinks do not count as water; only plain water and what the person says is water ("ok").
- The default of the water goal is the assistant's choice ("rád bízom"): about 30 ml per kilogram of body weight when the person told their weight (as in the calorie estimate), otherwise 2.0 litres.
