---
id: US-01m3rvr64zrzczabckjf6crb2z
form: user-story
title: "See where I am against the day's pace"
actor: [A-01m3rvr5z4n6ny0qnm5mm438zp]
provenance:
  level: stated
  decided_by: human
  sources: [".kotta/changes/mobile-app-daily-balance/proposal.md · Why", ".kotta/changes/mobile-app-daily-balance/conversation.md · P15", ".kotta/changes/mobile-app-daily-balance/conversation.md · P16", ".kotta/changes/mobile-app-daily-balance/conversation.md · K9"]
  quote: "ma épp szénhidráttal vagyok lemaradva"
  inferred: "Which macros to show (calories, carbs, protein) is my reading of the owner's remark; the time window and the storage on our side were answered by the owner."
---
# See where I am against the day's pace

## Story

As a phone user, I want the app to open on a chat with the day's pace always visible on top (calories, carbs and protein against the time of day), so that I know at a glance what I am short of, for example carbs today, and can ask what to do about it in the same place.

## Value

The first screen answers "what am I behind on right now", not only "what is left". The owner's own example: "ma épp szénhidráttal vagyok lemaradva". The largest gap is highlighted; the calories left today and the water so far stay visible beneath.

## Notes

Screenshot: ![Chat with the pace strip](screens/chat-10-home.png)

## Decided by the owner

- The chat is the base of the app, with the pace strip on top and a camera button in the input bar ("inkább chat lenne az alap és ott lenne egy kamera gomb"; "erősen hagyatkoznék a chatre").
- Carbs and protein goals start from a default split of the calorie goal (about half from carbs, a quarter from protein), changeable in the settings or by chat ("8 igen").
- Activity does not raise the day's allowance; the goal is fixed ("9 egyetértek").

## Implementation notes

Built (2026-09-30): the server reads today's nutrition-log in the user's own time zone (taken from the Google Health settings) and the app computes the pace from it: the goal is spread evenly over the eating window, and the macro furthest behind relative to its own goal is highlighted. A test reproduces the owner's example (14:20, 1,900 kcal, 720 eaten: 209 kcal under the pace). Not built: what the pace shows before the window starts or after it ends beyond the plan being 0 or the whole goal.
