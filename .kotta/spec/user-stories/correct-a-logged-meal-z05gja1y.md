---
id: US-01m3rvr6vsnzps8jrdz05gja1y
form: user-story
title: "Correct a logged meal"
actor: [A-01m3rvr5z4n6ny0qnm5mm438zp]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/app-one-flow/conversation.md · SZ1"]
  quote: null
  inferred: "The need is read from the owner's logs; the edit sheet is the assistant's design."
---
# Correct a logged meal

## Story

As a phone user, I want to change an entry I already logged (an amount, an ingredient, the time, the meal type), by tapping Edit on its card or by telling the assistant ("more milk", "it was lunch"), so that the entry is changed and no new one is added.

## Value

Corrections were a large part of the owner's messages ("volt lekvár", "ebéd volt", "nincs rántás", "2 volt a 6-ból"). Google Health cannot edit a saved meal, but our own storage can, so the entry changes in place and the Google Health copy is replaced.

## Notes

The assistant changes entries with a tool (update_entry) on the last entry or an entry it was shown by list_entries; nothing is deleted without the person's own tap. The edit sheet shows the ingredients with their amounts, the time and the meal type.
