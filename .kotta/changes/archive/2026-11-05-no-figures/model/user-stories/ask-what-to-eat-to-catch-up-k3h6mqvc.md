---
id: US-01m3rwa0cvrtcapqk0k3h6mqvc
form: user-story
title: "Ask what to eat to catch up"
actor: [A-01m3rvr5z4n6ny0qnm5mm438zp]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: [".kotta/changes/ettem-ennek/conversation.md · J1", ".kotta/changes/home-plate-and-glass/conversation.md · J2", ".kotta/changes/home-plate-and-glass/conversation.md · J3", ".kotta/changes/archive/2026-10-02-mobile-app-daily-balance/proposal.md · Why", ".kotta/changes/archive/2026-10-02-mobile-app-daily-balance/conversation.md · P15", ".kotta/changes/archive/2026-10-02-mobile-app-daily-balance/conversation.md · P16", ".kotta/changes/archive/2026-10-02-mobile-app-daily-balance/conversation.md · P18"]
  quote: "olyan kérdés lenne, hogy mit egyek (chatben amúgy)"
  inferred: "The reading that the answer should use the biggest macro gap is mine; the owner named carbs as today's gap and the question 'what should I eat'. The sheet under the plate and the preview on the plate were proposed by the assistant and answered 'igen' (J2)."
---
# Ask what to eat to catch up

## Story

As a phone user, I want the "Ennék" side of the dock's switch (with a photo of the fridge, a menu or anything) that gives me three ranked options on a sheet, and the one I pick drawn on the plate as a dashed layer before I eat it, so that I do not have to work out the macros myself and I see where it would take me.

## Value

It turns the pace screen into a next step: the answer names the gap, and proposes foods with their quantities that fit it, which can be logged in one tap.

## Notes

The "What should I eat now?" button under the plate is replaced by the "Ennék" side of the dock's switch (J1); a message or photo sent on that side opens the same sheet. 
Preview: the "Terített asztal" artifact of this change. The sheet starts under the line and the legend, so the plate stays visible above it. Each option shows the food, its calories and one line of reason. Asking "what should I eat?" on the "Ettem" side opens the same sheet too. "Something else" is written or said in the text field.


## Decided by the owner

- A tap on an option previews it on the plate, and a second tap on the same option logs it, with an Undo; there is no separate button ("Ok a b", which keeps the earlier "minek a choose 1, ha rá is klikkelhetek az 1-re?").
- Suggestions are not limited to foods logged before: the user can show what is in front of them with a photo of the fridge, of a menu, or of anything ("fotó a hűtőről, étlapról, bármi"); logged usuals are one more source.
- A constraints list (allergies, dislikes) exists, is respected by every suggestion, and can be set in the chat ("4 igen az szuper beállítás chatben").

## Implementation notes

Built: "What should I eat now?" first asks "What can you choose from?"; the person types the options or takes a photo (a fridge, a menu, a counter or a plate). The model, on the cheapest model, proposes foods with estimated calories, carbs, protein and ingredients; a rule check drops options above the calories left, options containing an avoided food (or whose ingredients are unknown) and options whose calories cannot match their carbs and protein; the rest are ranked by how much of the largest macro gap they close and the top three are shown. One retry if everything was dropped; below a 1,200 kcal daily goal the app refuses to plan. When the model returns separate items, it may combine them into simple meals (a prompt choice made after a real fridge test).
