---
change: grains-on-the-plate
generated_at: 2026-11-05T13:48:59.505Z
delta_hash: sha256:e1cf7b475cd526dab2b26e75f739b87cd9722adb567266892eb0b4f4b83a8e06
ready_for_approval: false
---

# Planning: grains-on-the-plate

Written by `kotta plan`. Every conflict below is a candidate awaiting a human's judgement, not a verdict; nothing here was decided by the machine except what section (f) lists.

## Delta

Added:
- Going over a goal is shown, never praised (BR-9ffze1v5) — business-rule, .kotta/changes/grains-on-the-plate/model/business-rules/going-over-a-goal-is-shown-never-praised-9ffze1v5.md
- In the evening the line says what still fits (BR-gg85aytx) — business-rule, .kotta/changes/grains-on-the-plate/model/business-rules/in-the-evening-the-line-says-what-still-fits-gg85aytx.md
- After the eating window What should I eat now is gone (EX-c4s68a98) — example, .kotta/changes/grains-on-the-plate/model/examples/after-the-eating-window-what-should-i-eat-now-is-gone-c4s68a98.md
- At 21:40 the line says what still fits (EX-pjhjvnaj) — example, .kotta/changes/grains-on-the-plate/model/examples/at-21-40-the-line-says-what-still-fits-pjhjvnaj.md
- Calories over the goal say how far over, not done (EX-f8rpdk03) — example, .kotta/changes/grains-on-the-plate/model/examples/calories-over-the-goal-say-how-far-over-not-done-f8rpdk03.md
- Each third holds its own food (EX-179esg8j) — example, .kotta/changes/grains-on-the-plate/model/examples/each-third-holds-its-own-food-179esg8j.md
- Rice over the carb goal spills onto the rim and the table (EX-99vznk9w) — example, .kotta/changes/grains-on-the-plate/model/examples/rice-over-the-carb-goal-spills-onto-the-rim-and-the-table-99vznk9w.md

Changed:
- Each macro has its own colour, and words state the situation (BR-6j5a0yxa) — business-rule, .kotta/changes/grains-on-the-plate/model/business-rules/each-macro-has-its-own-colour-and-words-state-the-situation-6j5a0yxa.md
- Each third of the plate fills with its own food, one portion per entry (BR-hg8a6720) — business-rule, .kotta/changes/grains-on-the-plate/model/business-rules/the-plate-fills-each-third-by-area-one-layer-per-entry-hg8a6720.md
- Fat over the cap spills onto the rim of the plate (EX-nb3ga68e) — example, .kotta/changes/grains-on-the-plate/model/examples/fat-over-the-cap-spills-onto-the-rim-of-the-plate-nb3ga68e.md
- Half of the protein goal fills half of the protein third (EX-jyz1at22) — example, .kotta/changes/grains-on-the-plate/model/examples/half-of-the-protein-goal-fills-half-of-the-protein-third-jyz1at22.md
- The fat third shows the cap (EX-bcjm3w2z) — example, .kotta/changes/grains-on-the-plate/model/examples/the-fat-bar-shows-the-cap-and-not-a-pace-bcjm3w2z.md
- When the day is closed the line says the day is done (EX-fsqz9p9v) — example, .kotta/changes/grains-on-the-plate/model/examples/the-hero-is-dark-when-the-day-is-closed-fsqz9p9v.md
- See where I am against the day's pace (US-jf6crb2z) — user-story, .kotta/changes/grains-on-the-plate/model/user-stories/see-where-i-am-against-the-days-pace-jf6crb2z.md

Removed: none

## (a) Structure of the delta

Every delta node satisfies its form: sections, required edges, id and provenance.

## (b) The merged view

The accepted model with this delta applied validates as a whole.

## (c) Conflict candidates

1. **Pace figure compares eaten calories with the plan for the time of day (EX-h390z7z9)** — names the changed node in 'subjects' (references-changed; because of See where I am against the day's pace (US-jf6crb2z)). Awaits judgement.
2. **The home shows the day as a plate and a glass (EX-a79pbphx)** — names the changed node in 'subjects' (references-changed; because of See where I am against the day's pace (US-jf6crb2z)). Awaits judgement.
3. **The line says how far under the plan, and nothing turns red (EX-9km40rqw)** — names the changed node in 'subjects' (references-changed; because of Each macro has its own colour, and words state the situation (BR-6j5a0yxa)). Awaits judgement.
4. **Within 120 kcal of the plan the line says on the plan (EX-pe89stx5)** — names the changed node in 'subjects' (references-changed; because of Each macro has its own colour, and words state the situation (BR-6j5a0yxa)). Awaits judgement.
5. **Water fills the glass in blue, hatched where it lags (EX-d670w4h9)** — names the changed node in 'subjects' (references-changed; because of Each macro has its own colour, and words state the situation (BR-6j5a0yxa)). Awaits judgement.
6. **Water fills the glass in blue, hatched where it lags (EX-d670w4h9)** — names the changed node in 'subjects' (references-changed; because of Each third of the plate fills with its own food, one portion per entry (BR-hg8a6720)). Awaits judgement.
7. **Phone user (A-5mm438zp)** — is named by the changed node (referenced-by-changed; because of See where I am against the day's pace (US-jf6crb2z)). Awaits judgement.
8. **Choose what the home shows (US-vmmk9nm7)** — is named by the changed node (referenced-by-changed; because of The fat third shows the cap (EX-bcjm3w2z)). Awaits judgement.
9. **Track fat as the fourth macro (US-pcqctbhj)** — is named by the changed node (referenced-by-changed; because of The fat third shows the cap (EX-bcjm3w2z)). Awaits judgement.
10. **Track fat as the fourth macro (US-pcqctbhj)** — is named by the changed node (referenced-by-changed; because of Fat over the cap spills onto the rim of the plate (EX-nb3ga68e)). Awaits judgement.

23 lower-ranked candidates are not listed; the 10 above rank highest.

The machine's candidates are mechanical and narrow. Contradictions the agent found by comparing every claim of the delta with the accepted nodes it touches, each marked `judged`:

<!-- kotta:judged — the agent's own findings; `kotta plan` keeps this block as written -->
- judged: "See where I am against the day's pace" named the plate rule by its old title and spoke of filling by area; reworked in this delta.
- judged: "When the day is closed the line says the day is done" would have praised a day over the goal; narrowed in this delta to a day that reached the goal without going over it.
- judged: "Water fills the glass in blue, hatched where it lags" keeps its hatching; the changed colour rule no longer requires hatching for the thirds but does not forbid it for the glass, so the example still holds.
<!-- /kotta:judged -->

## (d) Silences

- Open: Going over a goal is shown, never praised (BR-9ffze1v5) BR-9ffze1v5/Q1 — How far over the calorie goal counts as over? (a) any amount over; (b) more than 50 kcal; (c) more than 5 percent, about 105 kcal. Within the tolerance the day is done as before. The assistant suggests (b). (.kotta/changes/grains-on-the-plate/model/business-rules/going-over-a-goal-is-shown-never-praised-9ffze1v5.md:28)
- Open: In the evening the line says what still fits (BR-gg85aytx) BR-gg85aytx/Q1 — From what hour should the evening wording start? (The assistant suggests 19:00, three hours before the end of a 7:00 to 22:00 window; it could also be relative to the window's end.) (.kotta/changes/grains-on-the-plate/model/business-rules/in-the-evening-the-line-says-what-still-fits-gg85aytx.md:28)
- Open: Each third of the plate fills with its own food, one portion per entry (BR-hg8a6720) BR-hg8a6720/Q1 — Which plate should the grains sit on: the dark speckled stoneware, where all three natural colours stand out and look the same in light and dark mode, or the light ceramic of today, where the rice needs a thin brown edge? (The assistant suggests the dark stoneware.) (.kotta/changes/grains-on-the-plate/model/business-rules/the-plate-fills-each-third-by-area-one-layer-per-entry-hg8a6720.md:28)

## (e) Narrative drift

No narrative requirement bound to a node says something else than the node.

## (f) Provenance

14 delta nodes: 0 stated, 14 partly-inferred, 0 inferred.
Decided by: 0 human, 4 agent-proposed-human-approved, 10 agent-decided.

What the machine decided alone:

- Going over a goal is shown, never praised (BR-9ffze1v5) — The critique found 2,735 of 2,100 kcal shown as 'Mára kész.' with a tick; the owner liked overflow as the sign of it. The tolerance is an open decision.
- In the evening the line says what still fits (BR-gg85aytx) — The critique found 'X kcal under the plan' at 21:40 with the button still pushing late eating; the switch hour and the wording are the assistant's proposal, put to the owner as open decisions.
- After the eating window What should I eat now is gone (EX-c4s68a98) — The window is the sample 7:00 to 22:00.
- At 21:40 the line says what still fits (EX-pjhjvnaj) — The numbers are sample values.
- Calories over the goal say how far over, not done (EX-f8rpdk03) — The numbers are those of the critique.
- Fat over the cap spills onto the rim of the plate (EX-nb3ga68e) — The numbers and the wording are sample values chosen by the assistant; reworked for the grains.
- Half of the protein goal fills half of the protein third (EX-jyz1at22) — The numbers are sample values chosen by the assistant; reworked for the grains.
- Rice over the carb goal spills onto the rim and the table (EX-99vznk9w) — The numbers are sample values.
- The fat third shows the cap (EX-bcjm3w2z) — The numbers and the wording are sample values chosen by the assistant; reworked for the plate; reworked for the grains.
- When the day is closed the line says the day is done (EX-fsqz9p9v) — Reworked from the dark hero; the numbers and the wording are sample values chosen by the assistant; narrowed by 'Going over a goal is shown, never praised'.

Conversation: .kotta/changes/grains-on-the-plate/conversation.md, cited 27 times. Read it for the why before calling anything inferred.
- Unresolved: Each macro has its own colour, and words state the situation (BR-6j5a0yxa) cites “.kotta/changes/archive/2026-11-05-home-plate-and-glass/conversation.md · J2” — name the conversation as .kotta/changes/grains-on-the-plate/conversation.md, the repository-relative path the board opens.
- Unresolved: Fat over the cap spills onto the rim of the plate (EX-nb3ga68e) cites “.kotta/changes/home-plate-and-glass/conversation.md · J2” — name the conversation as .kotta/changes/grains-on-the-plate/conversation.md, the repository-relative path the board opens.
- Unresolved: Half of the protein goal fills half of the protein third (EX-jyz1at22) cites “.kotta/changes/home-plate-and-glass/conversation.md · SZ1” — name the conversation as .kotta/changes/grains-on-the-plate/conversation.md, the repository-relative path the board opens.
- Unresolved: The fat third shows the cap (EX-bcjm3w2z) cites “.kotta/changes/home-plate-and-glass/conversation.md · J2” — name the conversation as .kotta/changes/grains-on-the-plate/conversation.md, the repository-relative path the board opens.
- Unresolved: When the day is closed the line says the day is done (EX-fsqz9p9v) cites “.kotta/changes/home-plate-and-glass/conversation.md · J2” — name the conversation as .kotta/changes/grains-on-the-plate/conversation.md, the repository-relative path the board opens.
- Unresolved: See where I am against the day's pace (US-jf6crb2z) cites “.kotta/changes/home-plate-and-glass/conversation.md · SZ1” — name the conversation as .kotta/changes/grains-on-the-plate/conversation.md, the repository-relative path the board opens.
- Unresolved: See where I am against the day's pace (US-jf6crb2z) cites “.kotta/changes/home-plate-and-glass/conversation.md · J1” — name the conversation as .kotta/changes/grains-on-the-plate/conversation.md, the repository-relative path the board opens.
