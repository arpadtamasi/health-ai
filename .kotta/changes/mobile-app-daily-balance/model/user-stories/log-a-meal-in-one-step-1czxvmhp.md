---
id: US-01m3rvr6g951cs1s9p1czxvmhp
form: user-story
title: "Log a meal in one step"
actor: [A-01m3rvr5z4n6ny0qnm5mm438zp]
provenance:
  level: stated
  decided_by: human
  sources: [".kotta/changes/mobile-app-daily-balance/proposal.md · Why"]
  quote: "és a naplózást"
  inferred: null
---
# Log a meal in one step

## Story

As a phone user, I want to log a meal with one tap on an option card in the chat, or with one message, so that the meal is in Google Health and the pace updates without any form.

## Value

Logging is what the balance depends on; if it is slower than the chat it will not be used.

## Notes

Screenshot: ![Answer in the chat](screens/chat-12-answer.png)

Uses the same Google Health write the chat tools use today (nutrition-log).

## Implementation notes

Built: tapping an option card writes one nutrition-log entry to Google Health (the name, calories, carbs and protein of the option, now, in the user's UTC offset, with the meal type from the time of day) and the Undo removes it. Note: the id changes if the entry is ever corrected, because Google does not allow editing a logged meal.
