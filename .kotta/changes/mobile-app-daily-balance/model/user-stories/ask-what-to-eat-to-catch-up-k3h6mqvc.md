---
id: US-01m3rwa0cvrtcapqk0k3h6mqvc
form: user-story
title: "Ask what to eat to catch up"
actor: [A-01m3rvr5z4n6ny0qnm5mm438zp]
provenance:
  level: stated
  decided_by: human
  sources: [".kotta/changes/mobile-app-daily-balance/proposal.md · Why", ".kotta/changes/mobile-app-daily-balance/conversation.md · P15", ".kotta/changes/mobile-app-daily-balance/conversation.md · P16", ".kotta/changes/mobile-app-daily-balance/conversation.md · P18"]
  quote: "olyan kérdés lenne, hogy mit egyek (chatben amúgy)"
  inferred: "The reading that the answer should use the biggest macro gap is mine; the owner named carbs as today's gap and the question 'what should I eat'."
---
# Ask what to eat to catch up

## Story

As a phone user, I want to ask the chat "what should I eat?" (with a photo of the fridge, a menu or anything) and get three ranked options as cards in the chat that I tap to choose, so that I do not have to work out the macros myself.

## Value

It turns the pace screen into a next step: the answer names the gap, and proposes foods with their quantities that fit it, which can be logged in one tap.

## Notes

Screenshot: ![Answer in the chat](screens/chat-12-answer.png)

Each card shows the food, its calories, carbs and protein and, for the first, the reason. Tapping a card chooses it and logs it, with an Undo; "Something else" is written or said in the chat. There is no separate "I chose" button ("minek a choose 1, ha rá is klikkelhetek az 1-re?").

## Decided by the owner

- Tapping a card is the choice; it also logs the meal with an Undo (my reading of the owner's request, to confirm).
- Suggestions are not limited to foods logged before: the user can show what is in front of them with a photo of the fridge, of a menu, or of anything ("fotó a hűtőről, étlapról, bármi"); logged usuals are one more source.
- A constraints list (allergies, dislikes) exists, is respected by every suggestion, and can be set in the chat ("4 igen az szuper beállítás chatben").

## Implementation notes

Built: "What should I eat now?" first asks "What can you choose from?"; the person types the options or takes a photo (a fridge, a menu, a counter or a plate). The model, on the cheapest model, proposes foods with estimated calories, carbs, protein and ingredients; a rule check drops options above the calories left, options containing an avoided food (or whose ingredients are unknown) and options whose calories cannot match their carbs and protein; the rest are ranked by how much of the largest macro gap they close and the top three are shown. One retry if everything was dropped; below a 1,200 kcal daily goal the app refuses to plan. When the model returns separate items, it may combine them into simple meals (a prompt choice made after a real fridge test).
