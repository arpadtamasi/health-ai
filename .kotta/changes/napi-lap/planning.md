---
change: napi-lap
generated_at: 2026-11-05T22:47:52.135Z
delta_hash: sha256:b3cb3be3cd0ed3b341ff01abe1dadd4bdc8026fd77470db780a67e8df4e71b3b
ready_for_approval: true
---

# Planning: napi-lap

Written by `kotta plan`. Every conflict below is a candidate awaiting a human's judgement, not a verdict; nothing here was decided by the machine except what section (f) lists.

## Delta

Added:
- A new day starts a new page in the conversation (EX-pzh6q29y) — example, .kotta/changes/napi-lap/model/examples/a-new-day-starts-a-new-page-in-the-conversation-pzh6q29y.md

Changed:
- The conversation keeps what happened in it (BR-z4kgr8d4) — business-rule, .kotta/changes/napi-lap/model/business-rules/the-conversation-keeps-what-happened-in-it-z4kgr8d4.md
- Reopening the app shows the conversation again (EX-b7shz36n) — example, .kotta/changes/napi-lap/model/examples/reopening-the-app-shows-the-conversation-again-b7shz36n.md

Removed: none

## (a) Structure of the delta

Every delta node satisfies its form: sections, required edges, id and provenance.

## (b) The merged view

The accepted model with this delta applied validates as a whole.

## (c) Conflict candidates

1. **A lunch photo from the gallery is logged afterwards (EX-ahg41g4r)** — names the changed node in 'subjects' (references-changed; because of The conversation keeps what happened in it (BR-z4kgr8d4)). Awaits judgement.
2. **A question about the photo still sees the photo (EX-kd33xszg)** — names the changed node in 'subjects' (references-changed; because of The conversation keeps what happened in it (BR-z4kgr8d4)). Awaits judgement.
3. **A message that did not go out can be sent again (EX-gyy2r9tr)** — names the changed node in 'subjects' (references-changed; because of The conversation keeps what happened in it (BR-z4kgr8d4)). Awaits judgement.
4. **What was logged stays in the conversation as a card (EX-x395z7nn)** — names the changed node in 'subjects' (references-changed; because of The conversation keeps what happened in it (BR-z4kgr8d4)). Awaits judgement.
5. **The chat is kept during the test (BR-hxser706)** — is named by the changed node (referenced-by-changed; because of Reopening the app shows the conversation again (EX-b7shz36n)). Awaits judgement.
6. **Deleting the whole history also deletes the conversation (EX-4ntbvm0t)** — both name The chat is kept during the test in 'subjects' (shares-edge; because of Reopening the app shows the conversation again (EX-b7shz36n)). Awaits judgement.

The machine's candidates are mechanical and narrow. Contradictions the agent found by comparing every claim of the delta with the accepted nodes it touches, each marked `judged`:

<!-- kotta:judged — the agent's own findings; `kotta plan` keeps this block as written -->
- `judged` Reopening the app shows the conversation again (EX-b7shz36n) said "yesterday … on another phone, the conversation is back"; with a daily page that contradicts the rule, so the example moves to the same day. Changed in the delta.
- `judged` The chat is kept during the test (BR-hxser706): its rule is about storage and still holds (every message kept 90 days); its rationale "so that reopening the app shows the conversation again" now holds within a day only. No change to the node; said here.
- `judged` Deleting the whole history also deletes the conversation (EX-4ntbvm0t): deletes stored messages of every day, unaffected by what the app shows. No conflict.
- `judged` A question about the photo still sees the photo (EX-kd33xszg), A message that did not go out can be sent again (EX-gyy2r9tr), What was logged stays in the conversation as a card (EX-x395z7nn), A lunch photo from the gallery is logged afterwards (EX-ahg41g4r): all within one day's conversation. A photo sent at 23:59 is not seen by the next day's messages; accepted as the cost of the daily page.
- `judged` Yesterday's breakfast with more milk changes the entry (EX-cng4mx53) and The dock offers yesterday's breakfast (EX-dw1xzwcx) use yesterday's entries, not yesterday's conversation. No conflict.
<!-- /kotta:judged -->

## (d) Silences

No open decision, and no question a form asks is left unanswered.

## (e) Narrative drift

No narrative requirement bound to a node says something else than the node.

## (f) Provenance

3 delta nodes: 0 stated, 3 partly-inferred, 0 inferred.
Decided by: 0 human, 3 agent-proposed-human-approved, 0 agent-decided.

What the machine decided alone:

- nothing

Conversation: .kotta/changes/napi-lap/conversation.md, cited 8 times. Read it for the why before calling anything inferred.
- Unresolved: The conversation keeps what happened in it (BR-z4kgr8d4) cites “.kotta/changes/streamed-reply/conversation.md · SZ1” — name the conversation as .kotta/changes/napi-lap/conversation.md, the repository-relative path the board opens.
- Unresolved: The conversation keeps what happened in it (BR-z4kgr8d4) cites “.kotta/changes/ettem-ennek/conversation.md · SZ1” — name the conversation as .kotta/changes/napi-lap/conversation.md, the repository-relative path the board opens.
- Unresolved: The conversation keeps what happened in it (BR-z4kgr8d4) cites “.kotta/changes/ettem-ennek/conversation.md · J2” — name the conversation as .kotta/changes/napi-lap/conversation.md, the repository-relative path the board opens.
