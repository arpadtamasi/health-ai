---
id: US-01m3s789qmvs4jx8e93nb2j61n
form: user-story
title: "Record what was suggested and what was chosen"
actor: [A-01m3rvr5z4n6ny0qnm5mm438zp]
accepted: ["unimplemented: the record of suggestions and choices is not built yet"]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/mobile-app-daily-balance/proposal.md · What changes", "docs/designs/mobile-app-what-now.md · Recommended Approach"]
  quote: null
  inferred: "Proposed by an independent cold read of the office-hours session and accepted into the design document; the owner has not asked for it in these words."
---
# Record what was suggested and what was chosen

## Story

As the owner, I want the app to record every "What should I eat now?" answer together with what I then chose, so that I can see whether the suggestion changes what I eat.

## Value

The whole idea rests on the answer changing a real choice; without this record there is no way to tell, and the later layers (chat, camera) have no evidence to wait for.

## Notes

The answer is shown as option cards in the chat; tapping a card is the choice, and "Something else" is written or said in the chat. The record holds the options shown, the suggestions in order, the choice and the time. It holds no photo. The design document sets the retention (90 days) and the gate that reads it.