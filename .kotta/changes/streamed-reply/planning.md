---
change: streamed-reply
generated_at: 2026-11-05T20:14:21.106Z
delta_hash: sha256:7ef61fc6ce73406001b8bb3a774797490e5ee4ecad98e1de73068504267b3e66
ready_for_approval: true
---

# Planning: streamed-reply

Written by `kotta plan`. Every conflict below is a candidate awaiting a human's judgement, not a verdict; nothing here was decided by the machine except what section (f) lists.

## Delta

Added:
- A reply arrives as it is written, with its steps (BR-1jcvvaqw) — business-rule, .kotta/changes/streamed-reply/model/business-rules/a-reply-arrives-as-it-is-written-with-its-steps-1jcvvaqw.md
- A photo reply shows its steps before its words (EX-7emkrjph) — example, .kotta/changes/streamed-reply/model/examples/a-photo-reply-shows-its-steps-before-its-words-7emkrjph.md
- Stop before anything was logged logs nothing (EX-8jn68ceq) — example, .kotta/changes/streamed-reply/model/examples/stop-before-anything-was-logged-logs-nothing-8jn68ceq.md
- Stop keeps what was already logged (EX-z8ncfdrj) — example, .kotta/changes/streamed-reply/model/examples/stop-keeps-what-was-already-logged-z8ncfdrj.md
- The first step shows within a second and a half (EX-14pka5ka) — example, .kotta/changes/streamed-reply/model/examples/the-first-step-shows-within-a-second-and-a-half-14pka5ka.md
- The answer starts to show at once (QA-edpxmbyr) — quality-attribute, .kotta/changes/streamed-reply/model/quality-attributes/the-answer-starts-to-show-at-once-edpxmbyr.md

Changed:
- The conversation keeps what happened in it (BR-z4kgr8d4) — business-rule, .kotta/changes/streamed-reply/model/business-rules/the-conversation-keeps-what-happened-in-it-z4kgr8d4.md

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

The machine's candidates are mechanical and narrow. Contradictions the agent found by comparing every claim of the delta with the accepted nodes it touches, each marked `judged`:

<!-- kotta:judged — the agent's own findings; `kotta plan` keeps this block as written -->
- judged: "The conversation keeps what happened in it" changes only its scope sentence (the next change is now named); the four examples that name it (gallery photo, a question about the photo, a message that did not go out, the logged card) hold as written. The card now shows when its step ends instead of with the whole reply, which "What was logged stays in the conversation as a card" allows.
- judged: the quality "The app stays usable on a slow response" says the app shows that the assistant is thinking; the steps do that. Its 45-second limit applies to the whole streamed reply; a stream cut off by it keeps what was written and offers "Újra", and nothing logged is repeated by itself.
- judged: the new quality's 6-second measure after a quiet hour sits inside that quality's slow-connection notice at 2.5 seconds: both hold together.
<!-- /kotta:judged -->

## (d) Silences

No open decision, and no question a form asks is left unanswered.

## (e) Narrative drift

No narrative requirement bound to a node says something else than the node.

## (f) Provenance

7 delta nodes: 0 stated, 4 partly-inferred, 3 inferred.
Decided by: 0 human, 3 agent-proposed-human-approved, 4 agent-decided.

What the machine decided alone:

- A photo reply shows its steps before its words (EX-7emkrjph) — The dish and the wording of the steps are made up for the example.
- Stop before anything was logged logs nothing (EX-8jn68ceq) — That a Stop before any step logs nothing follows from the rule; the moment is made up.
- Stop keeps what was already logged (EX-z8ncfdrj) — The dish is made up for the example.
- The first step shows within a second and a half (EX-14pka5ka) — The photo and the step wording are made up for the example.

Conversation: .kotta/changes/streamed-reply/conversation.md, cited 12 times. Read it for the why before calling anything inferred.
- Unresolved: The conversation keeps what happened in it (BR-z4kgr8d4) cites “.kotta/changes/ettem-ennek/conversation.md · SZ1” — name the conversation as .kotta/changes/streamed-reply/conversation.md, the repository-relative path the board opens.
- Unresolved: The conversation keeps what happened in it (BR-z4kgr8d4) cites “.kotta/changes/ettem-ennek/conversation.md · J2” — name the conversation as .kotta/changes/streamed-reply/conversation.md, the repository-relative path the board opens.
