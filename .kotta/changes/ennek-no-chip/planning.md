---
change: ennek-no-chip
generated_at: 2026-11-05T21:58:14.672Z
delta_hash: sha256:d929be1e375028b1ca7b65a6b47c1746e1c9c57eaf72c13843198d67f39c964e
ready_for_approval: true
---

# Planning: ennek-no-chip

Written by `kotta plan`. Every conflict below is a candidate awaiting a human's judgement, not a verdict; nothing here was decided by the machine except what section (f) lists.

## Delta

Added:
- Ennék offers the usual foods that fit now (EX-dczn9kx4) — example, .kotta/changes/ennek-no-chip/model/examples/ennek-offers-the-usual-foods-that-fit-now-dczn9kx4.md
- Send on Ennék with an empty field asks what to eat now (EX-rp2tm4z6) — example, .kotta/changes/ennek-no-chip/model/examples/send-on-ennek-with-an-empty-field-asks-what-to-eat-now-rp2tm4z6.md
- When no usual food fits, Ennék has no chips (EX-qydw2dn7) — example, .kotta/changes/ennek-no-chip/model/examples/when-no-usual-food-fits-ennek-has-no-chips-qydw2dn7.md

Changed:
- The dock's switch says whether a message is what was eaten or what to eat (BR-1sh3t0yz) — business-rule, .kotta/changes/ennek-no-chip/model/business-rules/the-dock-s-switch-says-whether-a-message-is-what-was-eaten-o-1sh3t0yz.md
- Choosing a suggestion previews it on the plate (EX-03fp9ff2) — example, .kotta/changes/ennek-no-chip/model/examples/choosing-a-suggestion-previews-it-on-the-plate-03fp9ff2.md
- Ennék asks for options on the same sheet (EX-2raq04vm) — example, .kotta/changes/ennek-no-chip/model/examples/ennek-asks-for-options-on-the-same-sheet-2raq04vm.md
- What to eat proposes carb-rich snacks when carbs are behind (EX-1f496wnr) — example, .kotta/changes/ennek-no-chip/model/examples/the-chat-proposes-carb-rich-snacks-when-carbs-are-behind-1f496wnr.md
- The first chat sets constraints, goal and window before any suggestion (EX-gz4z1j4d) — example, .kotta/changes/ennek-no-chip/model/examples/the-first-chat-sets-constraints-goal-and-window-before-any-s-gz4z1j4d.md

Removed: none

## (a) Structure of the delta

Every delta node satisfies its form: sections, required edges, id and provenance.

## (b) The merged view

The accepted model with this delta applied validates as a whole.

## (c) Conflict candidates

1. **After the eating window What should I eat now is gone (EX-c4s68a98)** — names the changed node in 'subjects' (references-changed; because of The dock's switch says whether a message is what was eaten or what to eat (BR-1sh3t0yz)). Awaits judgement.
2. **The switch explains itself the first time only (EX-703xhe7a)** — names the changed node in 'subjects' (references-changed; because of The dock's switch says whether a message is what was eaten or what to eat (BR-1sh3t0yz)). Awaits judgement.
3. **Ask and log through a small chat (US-9g02t1zr)** — is named by the changed node (referenced-by-changed; because of The first chat sets constraints, goal and window before any suggestion (EX-gz4z1j4d)). Awaits judgement.
4. **Ask what to eat to catch up (US-k3h6mqvc)** — is named by the changed node (referenced-by-changed; because of What to eat proposes carb-rich snacks when carbs are behind (EX-1f496wnr)). Awaits judgement.
5. **Ask what to eat to catch up (US-k3h6mqvc)** — is named by the changed node (referenced-by-changed; because of Choosing a suggestion previews it on the plate (EX-03fp9ff2)). Awaits judgement.
6. **Ask what to eat to catch up (US-k3h6mqvc)** — is named by the changed node (referenced-by-changed; because of Ennék asks for options on the same sheet (EX-2raq04vm)). Awaits judgement.
7. **Typing what was eaten logs it and updates the pace (EX-wv503fy3)** — both name Ask and log through a small chat in 'subjects' (shares-edge; because of The first chat sets constraints, goal and window before any suggestion (EX-gz4z1j4d)). Awaits judgement.
8. **The chat changes the goal and the quick-add buttons (EX-t9g5wenr)** — both name Ask and log through a small chat in 'subjects' (shares-edge; because of The first chat sets constraints, goal and window before any suggestion (EX-gz4z1j4d)). Awaits judgement.
9. **After the eating window What should I eat now is gone (EX-c4s68a98)** — both name The dock's switch says whether a message is what was eaten or what to eat in 'subjects' (shares-edge; because of Ennék asks for options on the same sheet (EX-2raq04vm)). Awaits judgement.
10. **The switch explains itself the first time only (EX-703xhe7a)** — both name The dock's switch says whether a message is what was eaten or what to eat in 'subjects' (shares-edge; because of Ennék asks for options on the same sheet (EX-2raq04vm)). Awaits judgement.

The machine's candidates are mechanical and narrow. Contradictions the agent found by comparing every claim of the delta with the accepted nodes it touches, each marked `judged`:

<!-- kotta:judged — the agent's own findings; `kotta plan` keeps this block as written -->
- judged: "Ask what to eat to catch up" already says the "Ennék" side replaces the button and that a message or photo sent there opens the sheet; with no chip and an empty Send it still holds.
- judged: "After the eating window…", "The switch explains itself…", "Typing what was eaten…", "The chat changes the goal and the quick-add buttons" and "Ask and log through a small chat" speak of the "Ettem" side, the switch or the chat; none relies on a chip on "Ennék".
- judged: the four examples that tapped "What should I eat now?" are reworded in this delta to ask on the "Ennék" side; the sheet keeps its name.
<!-- /kotta:judged -->

## (d) Silences

No open decision, and no question a form asks is left unanswered.

## (e) Narrative drift

No narrative requirement bound to a node says something else than the node.

## (f) Provenance

8 delta nodes: 0 stated, 6 partly-inferred, 2 inferred.
Decided by: 0 human, 2 agent-proposed-human-approved, 6 agent-decided.

What the machine decided alone:

- Ennék asks for options on the same sheet (EX-2raq04vm) — The time and the wording are made up for the example.
- Ennék offers the usual foods that fit now (EX-dczn9kx4) — The numbers and the four-chip limit are the assistant's.
- Send on Ennék with an empty field asks what to eat now (EX-rp2tm4z6) — Sending with an empty field is the assistant's proposal, so that asking stays one tap without the chip.
- What to eat proposes carb-rich snacks when carbs are behind (EX-1f496wnr) — Sample foods and numbers are mine, for the mockup; reworked from the chat to the sheet.
- The first chat sets constraints, goal and window before any suggestion (EX-gz4z1j4d) — The sample answers and numbers are mine, for the mockup.
- When no usual food fits, Ennék has no chips (EX-qydw2dn7) — The numbers are made up for the example.

Conversation: .kotta/changes/ennek-no-chip/conversation.md, cited 17 times. Read it for the why before calling anything inferred.
- Unresolved: The dock's switch says whether a message is what was eaten or what to eat (BR-1sh3t0yz) cites “.kotta/changes/ettem-ennek/conversation.md · SZ1” — name the conversation as .kotta/changes/ennek-no-chip/conversation.md, the repository-relative path the board opens.
- Unresolved: The dock's switch says whether a message is what was eaten or what to eat (BR-1sh3t0yz) cites “.kotta/changes/ettem-ennek/conversation.md · J1” — name the conversation as .kotta/changes/ennek-no-chip/conversation.md, the repository-relative path the board opens.
- Unresolved: Choosing a suggestion previews it on the plate (EX-03fp9ff2) cites “.kotta/changes/home-plate-and-glass/conversation.md · J2” — name the conversation as .kotta/changes/ennek-no-chip/conversation.md, the repository-relative path the board opens.
- Unresolved: Choosing a suggestion previews it on the plate (EX-03fp9ff2) cites “.kotta/changes/home-plate-and-glass/conversation.md · J3” — name the conversation as .kotta/changes/ennek-no-chip/conversation.md, the repository-relative path the board opens.
- Unresolved: Ennék asks for options on the same sheet (EX-2raq04vm) cites “.kotta/changes/ettem-ennek/conversation.md · J1” — name the conversation as .kotta/changes/ennek-no-chip/conversation.md, the repository-relative path the board opens.
- Unresolved: What to eat proposes carb-rich snacks when carbs are behind (EX-1f496wnr) cites “.kotta/changes/home-plate-and-glass/conversation.md · J2” — name the conversation as .kotta/changes/ennek-no-chip/conversation.md, the repository-relative path the board opens.
- Unresolved: The first chat sets constraints, goal and window before any suggestion (EX-gz4z1j4d) cites “.kotta/changes/mobile-app-daily-balance/conversation.md · P18” — name the conversation as .kotta/changes/ennek-no-chip/conversation.md, the repository-relative path the board opens.
