---
id: US-01m3rvr6p4vj42j4atck7vyw08
form: user-story
title: "Log water and repeat items in one tap"
actor: [A-01m3rvr5z4n6ny0qnm5mm438zp]
accepted: ["unimplemented: the real quick-add list is not built; the chips are shown only in the sample mode, with sample foods"]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/mobile-app-daily-balance/proposal.md · Why", ".kotta/changes/mobile-app-daily-balance/conversation.md · P15", ".kotta/changes/mobile-app-daily-balance/conversation.md · P16"]
  quote: null
  inferred: "Chosen from the owner's usage summary (many repeated coffees, waters, oat bran) and the wish for a simpler use; the owner did not ask for favourites in these words."
---
# Log water and repeat items in one tap

## Story

As a phone user, I want one-tap buttons for a glass of water and for the things I eat again and again, so that the most frequent logging takes a second.

## Value

Most of the logging in the owner's first week was the same few items and glasses of water.

## Notes

Screenshots: ![Quick add chips in the chat](screens/chat-10-home.png) ![Limit reached: usuals still work](screens/chat-14-limit.png)

The chips sit above the input bar; each food gets its icon from a category the model picks when the food is created (16 categories, mapped in the design tokens).

## Decided by the owner

- The model, not a fixed rule, decides which items count as "usual", from the last 30 days of the log ("a modell majd megmondja, nem? az chates modellhívás"). That is a model call and counts in the token limit. When the model is unavailable, the most frequently logged items are shown instead. The user can add and remove items.
