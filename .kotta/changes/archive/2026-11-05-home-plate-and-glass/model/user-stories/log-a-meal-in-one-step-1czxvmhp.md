---
id: US-01m3rvr6g951cs1s9p1czxvmhp
form: user-story
title: "Log a meal in one step"
actor: [A-01m3rvr5z4n6ny0qnm5mm438zp]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: [".kotta/changes/home-plate-and-glass/conversation.md · J3", ".kotta/changes/archive/2026-10-02-mobile-app-daily-balance/proposal.md · Why", ".kotta/changes/archive/2026-10-02-mobile-app-daily-balance/conversation.md · P36"]
  quote: "és a naplózást"
  inferred: "The second tap is the owner's choice of option (b); the first tap's preview on the plate is the assistant's design."
---
# Log a meal in one step

## Story

As a phone user, I want to log a meal with a second tap on a suggestion I previewed on the plate, or with one message, so that the meal is in Google Health and the pace updates without any form.

## Value

Logging is what the balance depends on; if it is slower than the chat it will not be used.

## Notes

The first tap on a suggestion previews it on the plate and the second logs it ("Ok a b"); a usual item in the dock logs with one tap.

Uses the same Google Health write the chat tools use today (nutrition-log).

## Implementation notes

Built: tapping an option card writes one nutrition-log entry (after this change: the second tap on an option) to Google Health (the name, calories, carbs and protein of the option, now, in the user's UTC offset, with the meal type from the time of day) and the Undo removes it. Note: the id changes if the entry is ever corrected, because Google does not allow editing a logged meal.

## Decided by the owner

- Our own storage keeps more than Google Health gets: for every entry the name, the ingredients the model recognised, the source (photo, typed or button) and that the values are an estimate; Google Health, when connected, gets only the name and the numbers, which is all it takes ("mindkettő ok", to the proposal about the description of the photo).
