---
change: mobile-app-daily-balance
generated_at: 2026-10-01T13:46:00.505Z
delta_hash: sha256:2e0802e89fb7f14c41f448cb3407d4d3255e6b3bd1c2eb7bf0f567034ecda621
ready_for_approval: false
---

# Planning: mobile-app-daily-balance

Written by `kotta plan`. Every conflict below is a candidate awaiting a human's judgement, not a verdict; nothing here was decided by the machine except what section (f) lists.

## Delta

Added:
- Phone user (A-5mm438zp) — actor, .kotta/changes/mobile-app-daily-balance/model/actors/phone-user-5mm438zp.md
- A repeated coffee is logged with one tap (EX-etmp605f) — example, .kotta/changes/mobile-app-daily-balance/model/examples/a-repeated-coffee-is-logged-with-one-tap-etmp605f.md
- Camera proposes items and the user adjusts a portion (EX-c066ev2b) — example, .kotta/changes/mobile-app-daily-balance/model/examples/camera-proposes-items-and-the-user-adjusts-a-portion-c066ev2b.md
- Choosing a suggestion is recorded next to what was shown (EX-p30newfx) — example, .kotta/changes/mobile-app-daily-balance/model/examples/choosing-a-suggestion-is-recorded-next-to-what-was-shown-p30newfx.md
- Halving a logged burrito replaces the entry (EX-t48tx2zs) — example, .kotta/changes/mobile-app-daily-balance/model/examples/halving-a-logged-burrito-replaces-the-entry-t48tx2zs.md
- One tap logs the reviewed meal (EX-dx58wgxm) — example, .kotta/changes/mobile-app-daily-balance/model/examples/one-tap-logs-the-reviewed-meal-dx58wgxm.md
- Pace figure compares eaten calories with the plan for the time of day (EX-h390z7z9) — example, .kotta/changes/mobile-app-daily-balance/model/examples/pace-figure-compares-eaten-calories-with-the-plan-for-the-time-of-day-h390z7z9.md
- The chat changes the goal and the quick-add buttons (EX-t9g5wenr) — example, .kotta/changes/mobile-app-daily-balance/model/examples/the-chat-changes-the-goal-and-the-quick-add-buttons-t9g5wenr.md
- The chat proposes carb-rich snacks when carbs are behind (EX-1f496wnr) — example, .kotta/changes/mobile-app-daily-balance/model/examples/the-chat-proposes-carb-rich-snacks-when-carbs-are-behind-1f496wnr.md
- The first chat sets constraints, goal and window before any suggestion (EX-gz4z1j4d) — example, .kotta/changes/mobile-app-daily-balance/model/examples/the-first-chat-sets-constraints-goal-and-window-before-any-s-gz4z1j4d.md
- Typing what was eaten logs it and updates the pace (EX-wv503fy3) — example, .kotta/changes/mobile-app-daily-balance/model/examples/typing-what-was-eaten-logs-it-and-updates-the-pace-wv503fy3.md
- Ask and log through a small chat (US-9g02t1zr) — user-story, .kotta/changes/mobile-app-daily-balance/model/user-stories/ask-and-log-through-a-small-chat-9g02t1zr.md
- Ask what to eat to catch up (US-k3h6mqvc) — user-story, .kotta/changes/mobile-app-daily-balance/model/user-stories/ask-what-to-eat-to-catch-up-k3h6mqvc.md
- Choose food and quantity with the camera (US-xfw4r6v4) — user-story, .kotta/changes/mobile-app-daily-balance/model/user-stories/choose-food-and-quantity-with-the-camera-xfw4r6v4.md
- Correct a logged meal (US-z05gja1y) — user-story, .kotta/changes/mobile-app-daily-balance/model/user-stories/correct-a-logged-meal-z05gja1y.md
- Log a meal in one step (US-1czxvmhp) — user-story, .kotta/changes/mobile-app-daily-balance/model/user-stories/log-a-meal-in-one-step-1czxvmhp.md
- Log water and repeat items in one tap (US-ck7vyw08) — user-story, .kotta/changes/mobile-app-daily-balance/model/user-stories/log-water-and-repeat-items-in-one-tap-ck7vyw08.md
- Record what was suggested and what was chosen (US-3nb2j61n) — user-story, .kotta/changes/mobile-app-daily-balance/model/user-stories/record-what-was-suggested-and-what-was-chosen-3nb2j61n.md
- See where I am against the day's pace (US-jf6crb2z) — user-story, .kotta/changes/mobile-app-daily-balance/model/user-stories/see-where-i-am-against-the-days-pace-jf6crb2z.md

Changed: none

Removed: none

## (a) Structure of the delta

Every delta node satisfies its form: sections, required edges, id and provenance.

## (b) The merged view

The accepted model with this delta applied validates as a whole.

## (c) Conflict candidates

No accepted node shares an edge with, is named by, or contrasts with the delta.

The machine's candidates are mechanical and narrow. Contradictions the agent found by comparing every claim of the delta with the accepted nodes it touches, each marked `judged`:

<!-- kotta:judged — the agent's own findings; `kotta plan` keeps this block as written -->
- judged: the accepted model is still empty, so nothing accepted is contradicted; the comparison was made against the still-open change add-health-mcp-core instead.
- judged: *No health data in logs* (open change) says health values stay out of the application logs. The suggestion record of this change holds foods and choices, so it must be stored like the feedback records (outside the application logs, deleted by *delete_my_data*, 90 days), which the design already says; the app's code must not write it to the logs.
- judged: the landing page still promises "Health values stored by us: None"; this change stores goals, buttons, constraints and the suggestion record, so the wording has to change with it (the design document has the new sentence).
- judged: the owner said photos may be kept for a short time during the test; the design document still says photos are not stored by us. One of the two must change, and the consent screen must say which.
<!-- /kotta:judged -->

## (d) Silences

- Open: Choose food and quantity with the camera (US-xfw4r6v4) US-xfw4r6v4/Q1 — The consent text in the onboarding says photos are kept for 14 days during the test, but nothing stores them. Options: build the storage (a private bucket with a 14-day expiry, deleted by *delete_my_data*), or change the text to say photos are not stored. Suggestion (mine): change the text now and add storage only if checking estimates against photos turns out to be needed. (.kotta/changes/mobile-app-daily-balance/model/user-stories/choose-food-and-quantity-with-the-camera-xfw4r6v4.md:40)

## (e) Narrative drift

No narrative requirement bound to a node says something else than the node.

## (f) Provenance

19 delta nodes: 4 stated, 14 partly-inferred, 1 inferred.
Decided by: 4 human, 0 agent-proposed-human-approved, 15 agent-decided.

What the machine decided alone:

- Phone user (A-5mm438zp) — That the person in the app is the same owner or invited tester who uses Health AI from a chat today; the conversation names only the owner.
- A repeated coffee is logged with one tap (EX-etmp605f) — The concrete numbers are sample values chosen for the mockups, not the owner's data.
- Camera proposes items and the user adjusts a portion (EX-c066ev2b) — The concrete numbers are sample values chosen for the mockups, not the owner's data.
- Choosing a suggestion is recorded next to what was shown (EX-p30newfx) — Sample options and numbers are mine.
- Halving a logged burrito replaces the entry (EX-t48tx2zs) — The concrete numbers are sample values chosen for the mockups, not the owner's data.
- One tap logs the reviewed meal (EX-dx58wgxm) — The concrete numbers are sample values chosen for the mockups, not the owner's data.
- Pace figure compares eaten calories with the plan for the time of day (EX-h390z7z9) — The concrete numbers are sample values chosen for the mockups, not the owner's data.
- The chat changes the goal and the quick-add buttons (EX-t9g5wenr) — The wording of the request and the sample numbers are mine; the owner asked only that buttons and goals be changeable from the chat.
- The chat proposes carb-rich snacks when carbs are behind (EX-1f496wnr) — Sample foods and numbers are mine, for the mockup.
- The first chat sets constraints, goal and window before any suggestion (EX-gz4z1j4d) — The sample answers and numbers are mine, for the mockup.
- Typing what was eaten logs it and updates the pace (EX-wv503fy3) — Sample numbers chosen for the mockups, not the owner's data.
- Ask and log through a small chat (US-9g02t1zr) — The owner said 'a small chat', that buttons and goals can be changed from it, and asked what to eat; the logging by typing is my reading of the chat use that filled the first week.
- Correct a logged meal (US-z05gja1y) — The need comes from the owner's feedback about corrections (a meal reclassified, an ingredient fixed) and from Google's answer that logged meals cannot be edited; the owner did not ask for this story yet.
- Log water and repeat items in one tap (US-ck7vyw08) — Chosen from the owner's usage summary (many repeated coffees, waters, oat bran) and the wish for a simpler use; the owner did not ask for favourites in these words.
- Record what was suggested and what was chosen (US-3nb2j61n) — Proposed by an independent cold read of the office-hours session and accepted into the design document; the owner has not asked for it in these words.

Conversation: .kotta/changes/mobile-app-daily-balance/conversation.md, cited 16 times. Read it for the why before calling anything inferred.
