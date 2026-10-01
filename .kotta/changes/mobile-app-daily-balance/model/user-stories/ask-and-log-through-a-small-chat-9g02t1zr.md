---
id: US-01m3rw2bqxkqp6v1hg9g02t1zr
form: user-story
title: "Ask and log through a small chat"
actor: [A-01m3rvr5z4n6ny0qnm5mm438zp]
accepted: ["unimplemented: typing a meal and changing goals, buttons and constraints by chat are not built yet; only the onboarding and the food suggestions are"]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/mobile-app-daily-balance/proposal.md · Why", ".kotta/changes/mobile-app-daily-balance/conversation.md · P15", ".kotta/changes/mobile-app-daily-balance/conversation.md · P16", ".kotta/changes/mobile-app-daily-balance/conversation.md · K9", ".kotta/changes/mobile-app-daily-balance/conversation.md · P18"]
  quote: "a célokat is módosíthassam chatből"
  inferred: "The owner said 'a small chat', that buttons and goals can be changed from it, and asked what to eat; the logging by typing is my reading of the chat use that filled the first week."
---
# Ask and log through a small chat

## Story

As a phone user, I want the chat to be the base of the app, with a camera button in its input bar, where I write or say what I ate, ask what to eat, add or remove quick-add buttons and change my goals, and where a short first conversation sets up my constraints, goal and eating window, so that everything takes one message.

## Value

Buttons and camera cover the frequent cases; a chat covers the rest (a described meal, a setting) and saves hunting through settings screens: "add cappuccino to my buttons", "set the goal to 1,800".

## Notes

Screenshots: ![Chat home](screens/chat-10-home.png) ![Chat onboarding](screens/chat-13-onboarding.png)

The first time, the chat asks about allergies and foods to avoid, then the calorie goal and the eating window, then shows the not-medical-advice notice and the consent (chat and photos go to the AI provider; photos are kept 14 days during the test) with an "Agree and continue" button. Suggestions stay blocked until this is done ("13 egy chat onboard inkább").

## Decided by the owner

- Constraints, goal and eating window are set in a chat onboarding, not a settings form.
- The chat covers today's food and the settings only; questions about sleep or heart rate are left out for now ("1 igen").
- Every message is a model call and counts against one daily limit per user, shared with the camera and "What now", measured in tokens taken from the model response's usage figure, not in calls ("2 igen, nem hívás hanem token").
- Constraints (allergies, dislikes) can be set and changed in the chat ("4 igen az szuper beállítás chatben").

## Implementation notes

Built: the chat is the base screen with the pace strip and the camera button, a first onboarding chat sets the foods to avoid, the daily calories and the eating window, and asks for consent. Defaults chosen while building, to confirm: every model call counts against a daily limit of 150,000 tokens per user (input plus output, taken from the response's usage figure); the cheapest model (Claude Haiku 4.5) is the default and can be changed per task by a setting. Not built yet: logging a described meal by typing, and changing goals, quick buttons or constraints by chat after the onboarding; for now the chat suggests food after "What should I eat now?" only.
