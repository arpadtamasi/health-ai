---
change: camera-system-sheet
generated_at: 2026-11-06T09:37:37.051Z
delta_hash: sha256:b79b4820e5a5c50f3738fe6b65e64e0c05cf7a6eeeac861cdc1c79b5b16adb17
ready_for_approval: true
---

# Planning: camera-system-sheet

Written by `kotta plan`. Every conflict below is a candidate awaiting a human's judgement, not a verdict; nothing here was decided by the machine except what section (f) lists.

## Delta

Added: none

Changed:
- The conversation keeps what happened in it (BR-z4kgr8d4) — business-rule, .kotta/changes/camera-system-sheet/model/business-rules/the-conversation-keeps-what-happened-in-it-z4kgr8d4.md
- A lunch photo from the gallery is logged afterwards (EX-ahg41g4r) — example, .kotta/changes/camera-system-sheet/model/examples/a-lunch-photo-from-the-gallery-is-logged-afterwards-ahg41g4r.md
- Choose food and quantity with the camera (US-xfw4r6v4) — user-story, .kotta/changes/camera-system-sheet/model/user-stories/choose-food-and-quantity-with-the-camera-xfw4r6v4.md

Removed: none

## (a) Structure of the delta

Every delta node satisfies its form: sections, required edges, id and provenance.

## (b) The merged view

The accepted model with this delta applied validates as a whole.

## (c) Conflict candidates

1. **A photo of a plate is logged at once and the portion can be changed (EX-c066ev2b)** — names the changed node in 'subjects' (references-changed; because of Choose food and quantity with the camera (US-xfw4r6v4)). Awaits judgement.
2. **A photo of a label is read, not estimated (EX-5ra1sxhn)** — names the changed node in 'subjects' (references-changed; because of Choose food and quantity with the camera (US-xfw4r6v4)). Awaits judgement.
3. **A question about the photo still sees the photo (EX-kd33xszg)** — names the changed node in 'subjects' (references-changed; because of The conversation keeps what happened in it (BR-z4kgr8d4)). Awaits judgement.
4. **A message that did not go out can be sent again (EX-gyy2r9tr)** — names the changed node in 'subjects' (references-changed; because of The conversation keeps what happened in it (BR-z4kgr8d4)). Awaits judgement.
5. **What was logged stays in the conversation as a card (EX-x395z7nn)** — names the changed node in 'subjects' (references-changed; because of The conversation keeps what happened in it (BR-z4kgr8d4)). Awaits judgement.
6. **A new day starts a new page in the conversation (EX-pzh6q29y)** — names the changed node in 'subjects' (references-changed; because of The conversation keeps what happened in it (BR-z4kgr8d4)). Awaits judgement.
7. **Phone user (A-5mm438zp)** — is named by the changed node (referenced-by-changed; because of Choose food and quantity with the camera (US-xfw4r6v4)). Awaits judgement.
8. **A photo logs what it shows (BR-g5fgz0ne)** — is named by the changed node (referenced-by-changed; because of A lunch photo from the gallery is logged afterwards (EX-ahg41g4r)). Awaits judgement.
9. **Start logging from one button on the home (US-6k80r782)** — is named by the changed node (referenced-by-changed; because of A lunch photo from the gallery is logged afterwards (EX-ahg41g4r)). Awaits judgement.
10. **A photo of a plate is logged at once and the portion can be changed (EX-c066ev2b)** — both name A photo logs what it shows in 'subjects' (shares-edge; because of A lunch photo from the gallery is logged afterwards (EX-ahg41g4r)). Awaits judgement.

26 lower-ranked candidates are not listed; the 10 above rank highest.

The machine's candidates are mechanical and narrow. Contradictions the agent found by comparing every claim of the delta with the accepted nodes it touches, each marked `judged`:

<!-- kotta:judged — the agent's own findings; `kotta plan` keeps this block as written -->
- `judged` Choose food and quantity with the camera (US-xfw4r6v4) noted that the camera button opens the system camera; it now opens the phone's photo menu. Changed in the delta.
- `judged` The photo examples (EX-c066ev2b, EX-5ra1sxhn, EX-h2ehefty, EX-kd33xszg) and A photo logs what it shows (BR-g5fgz0ne): about what a photo does once chosen, not how it is chosen. No conflict.
- `judged` The dock offers the usual items, the camera and the text field on the home (EX-smp3yxyj), Start logging from one button on the home (US-6k80r782): the camera button stays where it is. No conflict.
- `judged` A message that did not go out, the cards, the new daily page (EX-gyy2r9tr, EX-x395z7nn, EX-pzh6q29y): untouched by how a photo is chosen. No conflict.
<!-- /kotta:judged -->

## (d) Silences

No open decision, and no question a form asks is left unanswered.

## (e) Narrative drift

No narrative requirement bound to a node says something else than the node.

## (f) Provenance

3 delta nodes: 1 stated, 2 partly-inferred, 0 inferred.
Decided by: 1 human, 2 agent-proposed-human-approved, 0 agent-decided.

What the machine decided alone:

- nothing

Conversation: .kotta/changes/camera-system-sheet/conversation.md, cited 9 times. Read it for the why before calling anything inferred.
- Unresolved: The conversation keeps what happened in it (BR-z4kgr8d4) cites “.kotta/changes/napi-lap/conversation.md · SZ1” — name the conversation as .kotta/changes/camera-system-sheet/conversation.md, the repository-relative path the board opens.
- Unresolved: The conversation keeps what happened in it (BR-z4kgr8d4) cites “.kotta/changes/napi-lap/conversation.md · J1” — name the conversation as .kotta/changes/camera-system-sheet/conversation.md, the repository-relative path the board opens.
- Unresolved: The conversation keeps what happened in it (BR-z4kgr8d4) cites “.kotta/changes/streamed-reply/conversation.md · SZ1” — name the conversation as .kotta/changes/camera-system-sheet/conversation.md, the repository-relative path the board opens.
- Unresolved: The conversation keeps what happened in it (BR-z4kgr8d4) cites “.kotta/changes/ettem-ennek/conversation.md · SZ1” — name the conversation as .kotta/changes/camera-system-sheet/conversation.md, the repository-relative path the board opens.
- Unresolved: The conversation keeps what happened in it (BR-z4kgr8d4) cites “.kotta/changes/ettem-ennek/conversation.md · J2” — name the conversation as .kotta/changes/camera-system-sheet/conversation.md, the repository-relative path the board opens.
- Unresolved: Choose food and quantity with the camera (US-xfw4r6v4) cites “.kotta/changes/app-one-flow/conversation.md · SZ1” — name the conversation as .kotta/changes/camera-system-sheet/conversation.md, the repository-relative path the board opens.
