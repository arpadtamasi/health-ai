---
change: ettem-ennek
generated_at: 2026-11-05T18:59:41.594Z
delta_hash: sha256:39d36d2200d1725e59e0055357fbbff7b939111b43ba7bde1e6cc61f9e89f2ff
ready_for_approval: false
---

# Planning: ettem-ennek

Written by `kotta plan`. Every conflict below is a candidate awaiting a human's judgement, not a verdict; nothing here was decided by the machine except what section (f) lists.

## Delta

Added:
- The conversation keeps what happened in it (BR-z4kgr8d4) — business-rule, .kotta/changes/ettem-ennek/model/business-rules/the-conversation-keeps-what-happened-in-it-z4kgr8d4.md
- The dock's switch says whether a message is what was eaten or what to eat (BR-1sh3t0yz) — business-rule, .kotta/changes/ettem-ennek/model/business-rules/the-dock-s-switch-says-whether-a-message-is-what-was-eaten-o-1sh3t0yz.md
- A lunch photo from the gallery is logged afterwards (EX-ahg41g4r) — example, .kotta/changes/ettem-ennek/model/examples/a-lunch-photo-from-the-gallery-is-logged-afterwards-ahg41g4r.md
- A message that did not go out can be sent again (EX-gyy2r9tr) — example, .kotta/changes/ettem-ennek/model/examples/a-message-that-did-not-go-out-can-be-sent-again-gyy2r9tr.md
- A question about the photo still sees the photo (EX-kd33xszg) — example, .kotta/changes/ettem-ennek/model/examples/a-question-about-the-photo-still-sees-the-photo-kd33xszg.md
- Ennék asks for options on the same sheet (EX-2raq04vm) — example, .kotta/changes/ettem-ennek/model/examples/ennek-asks-for-options-on-the-same-sheet-2raq04vm.md
- The switch explains itself the first time only (EX-703xhe7a) — example, .kotta/changes/ettem-ennek/model/examples/the-switch-explains-itself-the-first-time-only-703xhe7a.md
- What was logged stays in the conversation as a card (EX-x395z7nn) — example, .kotta/changes/ettem-ennek/model/examples/what-was-logged-stays-in-the-conversation-as-a-card-x395z7nn.md

Changed:
- A photo logs what it shows (BR-g5fgz0ne) — business-rule, .kotta/changes/ettem-ennek/model/business-rules/a-photo-logs-what-it-shows-g5fgz0ne.md
- In the evening the line says what still fits (BR-gg85aytx) — business-rule, .kotta/changes/ettem-ennek/model/business-rules/in-the-evening-the-line-says-what-still-fits-gg85aytx.md
- After the eating window What should I eat now is gone (EX-c4s68a98) — example, .kotta/changes/ettem-ennek/model/examples/after-the-eating-window-what-should-i-eat-now-is-gone-c4s68a98.md
- The home shows the day as a plate and a glass (EX-a79pbphx) — example, .kotta/changes/ettem-ennek/model/examples/the-home-shows-the-day-s-calories-carbs-protein-and-water-as-a79pbphx.md
- Ask what to eat to catch up (US-k3h6mqvc) — user-story, .kotta/changes/ettem-ennek/model/user-stories/ask-what-to-eat-to-catch-up-k3h6mqvc.md
- Open on a full-screen home that shows the day (US-b86qkft7) — user-story, .kotta/changes/ettem-ennek/model/user-stories/open-on-a-full-screen-home-that-shows-the-day-b86qkft7.md
- Start logging from one button on the home (US-6k80r782) — user-story, .kotta/changes/ettem-ennek/model/user-stories/start-logging-from-one-button-on-the-home-6k80r782.md

Removed: none

## (a) Structure of the delta

Every delta node satisfies its form: sections, required edges, id and provenance.

## (b) The merged view

The accepted model with this delta applied validates as a whole.

## (c) Conflict candidates

1. **A photo of a plate is logged at once and the portion can be changed (EX-c066ev2b)** — names the changed node in 'subjects' (references-changed; because of A photo logs what it shows (BR-g5fgz0ne)). Awaits judgement.
2. **What to eat proposes carb-rich snacks when carbs are behind (EX-1f496wnr)** — names the changed node in 'subjects' (references-changed; because of Ask what to eat to catch up (US-k3h6mqvc)). Awaits judgement.
3. **The dock offers the usual items, the camera and the text field on the home (EX-smp3yxyj)** — names the changed node in 'subjects' (references-changed; because of Start logging from one button on the home (US-6k80r782)). Awaits judgement.
4. **A photo of a label is read, not estimated (EX-5ra1sxhn)** — names the changed node in 'subjects' (references-changed; because of A photo logs what it shows (BR-g5fgz0ne)). Awaits judgement.
5. **A photo of a fridge proposes and logs nothing (EX-h2ehefty)** — names the changed node in 'subjects' (references-changed; because of A photo logs what it shows (BR-g5fgz0ne)). Awaits judgement.
6. **The dock offers yesterday's breakfast (EX-dw1xzwcx)** — names the changed node in 'subjects' (references-changed; because of Start logging from one button on the home (US-6k80r782)). Awaits judgement.
7. **A logged meal appears among today's entries in time order (EX-ke81r9ve)** — names the changed node in 'subjects' (references-changed; because of Open on a full-screen home that shows the day (US-b86qkft7)). Awaits judgement.
8. **Typing with the keyboard open keeps a one-line status (EX-w3w46qk1)** — names the changed node in 'subjects' (references-changed; because of Open on a full-screen home that shows the day (US-b86qkft7)). Awaits judgement.
9. **Choosing a suggestion previews it on the plate (EX-03fp9ff2)** — names the changed node in 'subjects' (references-changed; because of Ask what to eat to catch up (US-k3h6mqvc)). Awaits judgement.
10. **The conversation opens on a sheet from the top of the home (EX-q1ekhjmd)** — names the changed node in 'subjects' (references-changed; because of Open on a full-screen home that shows the day (US-b86qkft7)). Awaits judgement.

55 lower-ranked candidates are not listed; the 10 above rank highest.

The machine's candidates are mechanical and narrow. Contradictions the agent found by comparing every claim of the delta with the accepted nodes it touches, each marked `judged`:

<!-- kotta:judged — the agent's own findings; `kotta plan` keeps this block as written -->
<!-- /kotta:judged -->

## (d) Silences

- Open: The dock's switch says whether a message is what was eaten or what to eat (BR-1sh3t0yz) BR-1sh3t0yz/Q1 — Which labels: "Ettem · Ennék", "Beírom · Ajánlj" or "Napló · Ötlet"? (.kotta/changes/ettem-ennek/model/business-rules/the-dock-s-switch-says-whether-a-message-is-what-was-eaten-o-1sh3t0yz.md:28)

## (e) Narrative drift

No narrative requirement bound to a node says something else than the node.

## (f) Provenance

15 delta nodes: 1 stated, 10 partly-inferred, 4 inferred.
Decided by: 1 human, 4 agent-proposed-human-approved, 10 agent-decided.

What the machine decided alone:

- A photo logs what it shows (BR-g5fgz0ne) — Derived from the owner's usage logs; the rule's wording is the assistant's. How a photo and the side of the switch combine is the assistant's proposal.
- The conversation keeps what happened in it (BR-z4kgr8d4) — The comparison with Claude and ChatGPT and the five gaps are the assistant's; keeping a photo for two more messages is the assistant's choice.
- The dock's switch says whether a message is what was eaten or what to eat (BR-1sh3t0yz) — The label pair, the remembered side, the one-time hint and the changing chips are the assistant's proposal (preview Ettem, ennék, emlékszem).
- A lunch photo from the gallery is logged afterwards (EX-ahg41g4r) — The times and the dish are made up for the example.
- A message that did not go out can be sent again (EX-gyy2r9tr) — The dish is made up for the example; that Újra sends exactly once follows the slow-response quality.
- A question about the photo still sees the photo (EX-kd33xszg) — The question is the one in the preview.
- After the eating window What should I eat now is gone (EX-c4s68a98) — The window is the sample 7:00 to 22:00.
- Ennék asks for options on the same sheet (EX-2raq04vm) — The time and the wording are made up for the example.
- The switch explains itself the first time only (EX-703xhe7a) — Showing the line once and remembering the side are the assistant's proposal.
- What was logged stays in the conversation as a card (EX-x395z7nn) — The numbers are those of the preview.

Conversation: .kotta/changes/ettem-ennek/conversation.md, cited 36 times. Read it for the why before calling anything inferred.
- Unresolved: A photo logs what it shows (BR-g5fgz0ne) cites “.kotta/changes/app-one-flow/conversation.md · SZ1” — name the conversation as .kotta/changes/ettem-ennek/conversation.md, the repository-relative path the board opens.
- Unresolved: In the evening the line says what still fits (BR-gg85aytx) cites “.kotta/changes/grains-on-the-plate/conversation.md · J1” — name the conversation as .kotta/changes/ettem-ennek/conversation.md, the repository-relative path the board opens.
- Unresolved: In the evening the line says what still fits (BR-gg85aytx) cites “.kotta/changes/grains-on-the-plate/conversation.md · P1” — name the conversation as .kotta/changes/ettem-ennek/conversation.md, the repository-relative path the board opens.
- Unresolved: After the eating window What should I eat now is gone (EX-c4s68a98) cites “.kotta/changes/grains-on-the-plate/conversation.md · P1” — name the conversation as .kotta/changes/ettem-ennek/conversation.md, the repository-relative path the board opens.
- Unresolved: The home shows the day as a plate and a glass (EX-a79pbphx) cites “.kotta/changes/home-plate-and-glass/conversation.md · SZ1” — name the conversation as .kotta/changes/ettem-ennek/conversation.md, the repository-relative path the board opens.
- Unresolved: The home shows the day as a plate and a glass (EX-a79pbphx) cites “.kotta/changes/home-plate-and-glass/conversation.md · J1” — name the conversation as .kotta/changes/ettem-ennek/conversation.md, the repository-relative path the board opens.
- Unresolved: The home shows the day as a plate and a glass (EX-a79pbphx) cites “.kotta/changes/home-plate-and-glass/conversation.md · SZ4” — name the conversation as .kotta/changes/ettem-ennek/conversation.md, the repository-relative path the board opens.
- Unresolved: Ask what to eat to catch up (US-k3h6mqvc) cites “.kotta/changes/home-plate-and-glass/conversation.md · J2” — name the conversation as .kotta/changes/ettem-ennek/conversation.md, the repository-relative path the board opens.
- Unresolved: Ask what to eat to catch up (US-k3h6mqvc) cites “.kotta/changes/home-plate-and-glass/conversation.md · J3” — name the conversation as .kotta/changes/ettem-ennek/conversation.md, the repository-relative path the board opens.
- Unresolved: Ask what to eat to catch up (US-k3h6mqvc) cites “.kotta/changes/archive/2026-10-02-mobile-app-daily-balance/conversation.md · P15” — name the conversation as .kotta/changes/ettem-ennek/conversation.md, the repository-relative path the board opens.
- Unresolved: Ask what to eat to catch up (US-k3h6mqvc) cites “.kotta/changes/archive/2026-10-02-mobile-app-daily-balance/conversation.md · P16” — name the conversation as .kotta/changes/ettem-ennek/conversation.md, the repository-relative path the board opens.
- Unresolved: Ask what to eat to catch up (US-k3h6mqvc) cites “.kotta/changes/archive/2026-10-02-mobile-app-daily-balance/conversation.md · P18” — name the conversation as .kotta/changes/ettem-ennek/conversation.md, the repository-relative path the board opens.
- Unresolved: Open on a full-screen home that shows the day (US-b86qkft7) cites “.kotta/changes/home-plate-and-glass/conversation.md · SZ1” — name the conversation as .kotta/changes/ettem-ennek/conversation.md, the repository-relative path the board opens.
- Unresolved: Open on a full-screen home that shows the day (US-b86qkft7) cites “.kotta/changes/home-plate-and-glass/conversation.md · SZ3” — name the conversation as .kotta/changes/ettem-ennek/conversation.md, the repository-relative path the board opens.
- Unresolved: Open on a full-screen home that shows the day (US-b86qkft7) cites “.kotta/changes/home-plate-and-glass/conversation.md · SZ4” — name the conversation as .kotta/changes/ettem-ennek/conversation.md, the repository-relative path the board opens.
- Unresolved: Open on a full-screen home that shows the day (US-b86qkft7) cites “.kotta/changes/home-plate-and-glass/conversation.md · J1” — name the conversation as .kotta/changes/ettem-ennek/conversation.md, the repository-relative path the board opens.
- Unresolved: Open on a full-screen home that shows the day (US-b86qkft7) cites “.kotta/changes/home-plate-and-glass/conversation.md · J2” — name the conversation as .kotta/changes/ettem-ennek/conversation.md, the repository-relative path the board opens.
- Unresolved: Start logging from one button on the home (US-6k80r782) cites “.kotta/changes/archive/2026-10-02-app-one-flow/conversation.md · SZ1” — name the conversation as .kotta/changes/ettem-ennek/conversation.md, the repository-relative path the board opens.
