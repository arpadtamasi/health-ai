---
change: app-update
generated_at: 2026-11-05T14:46:45.637Z
delta_hash: sha256:2f3a4b4ec7d4e836e2431a8061e52f42a564e146c2e09bc126d7bade5afeaed1
ready_for_approval: true
---

# Planning: app-update

Written by `kotta plan`. Every conflict below is a candidate awaiting a human's judgement, not a verdict; nothing here was decided by the machine except what section (f) lists.

## Delta

Added:
- The app loads the newest version and the day when it comes back (BR-wjx0q28w) — business-rule, .kotta/changes/app-update/model/business-rules/the-app-loads-the-newest-version-and-the-day-when-it-comes-b-wjx0q28w.md
- A meal logged in Claude is on the plate when the app comes back (EX-8yn4t4xs) — example, .kotta/changes/app-update/model/examples/a-meal-logged-in-claude-is-on-the-plate-when-the-app-comes-b-8yn4t4xs.md
- A new version loads when the app comes back from the background (EX-9g8ney8y) — example, .kotta/changes/app-update/model/examples/a-new-version-loads-when-the-app-comes-back-from-the-backgro-9g8ney8y.md
- While a message is being typed the new version waits (EX-rcnnfhvx) — example, .kotta/changes/app-update/model/examples/while-a-message-is-being-typed-the-new-version-waits-rcnnfhvx.md
- Load the new version from the home-screen app (US-ehb7tx57) — user-story, .kotta/changes/app-update/model/user-stories/load-the-new-version-from-the-home-screen-app-ehb7tx57.md

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
- judged: "The app stays usable on a slow response" says a write is never lost or repeated on its own; a reload during a pending log, edit or undo could lose it, so the rule waits for pending writes. After a reload the last known day is drawn from the device as before.
- judged: "Open on a full-screen home that shows the day" and the slow-connection notice are unchanged; the reload brings no new screen, bar or button.
- judged: the owner first asked for a button (SZ1) and then chose no button (J1, J2); the rule follows the later answer.
<!-- /kotta:judged -->

## (d) Silences

No open decision, and no question a form asks is left unanswered.

## (e) Narrative drift

No narrative requirement bound to a node says something else than the node.

## (f) Provenance

5 delta nodes: 0 stated, 3 partly-inferred, 2 inferred.
Decided by: 0 human, 0 agent-proposed-human-approved, 5 agent-decided.

What the machine decided alone:

- The app loads the newest version and the day when it comes back (BR-wjx0q28w) — Loading the day again on every return, also when there is no new version, is the assistant's addition for entries logged in Claude; waiting for a pending write is the assistant's addition from the slow-response quality.
- A meal logged in Claude is on the plate when the app comes back (EX-8yn4t4xs) — The numbers are made up for the example.
- A new version loads when the app comes back from the background (EX-9g8ney8y) — The times are made up for the example.
- While a message is being typed the new version waits (EX-rcnnfhvx) — The wording of the half-written message is made up for the example.
- Load the new version from the home-screen app (US-ehb7tx57) — That the home-screen app has no reload, and that entries logged through Claude only appear after the day is loaded again, are the assistant's reading of the current app.

Conversation: .kotta/changes/app-update/conversation.md, cited 9 times. Read it for the why before calling anything inferred.
