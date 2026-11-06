---
change: send-errors
generated_at: 2026-11-06T13:50:39.479Z
delta_hash: sha256:b1b9c42b1171e817decb9bac6d7285a8509fceba74dedc881e538eac8a65775d
ready_for_approval: true
---

# Planning: send-errors

Written by `kotta plan`. Every conflict below is a candidate awaiting a human's judgement, not a verdict; nothing here was decided by the machine except what section (f) lists.

## Delta

Added:
- A failed message says why, and the owner can read the failure (BR-wmgv4bkn) — business-rule, .kotta/changes/send-errors/model/business-rules/a-failed-message-says-why-and-the-owner-can-read-the-failure-wmgv4bkn.md
- A photo that did not reach the service is not blamed on the photo (EX-azqvxsfe) — example, .kotta/changes/send-errors/model/examples/a-photo-that-did-not-reach-the-service-is-not-blamed-on-the--azqvxsfe.md

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
- `judged` A message that did not go out can be sent again (EX-gyy2r9tr) and The conversation keeps what happened in it (BR-z4kgr8d4): "Nem ment el" with "Újra" stays; the new rule adds the reason. No conflict.
- `judged` send_feedback tool (IF-6n0xrgst, open change add-health-mcp-core) accepts the sources `user` and `agent`; the app's records are written by the service itself with the source `app`, not through that tool, so its precondition is untouched. list_feedback and usage_summary tools (IF-95w6mn4b) returns them with their source, as it says.
- `judged` The chat is kept during the test (BR-hxser706): the record holds no message content, so the consent's statement about what is kept is not widened by it beyond what the conversation already keeps.
<!-- /kotta:judged -->

## (d) Silences

No open decision, and no question a form asks is left unanswered.

## (e) Narrative drift

No narrative requirement bound to a node says something else than the node.

## (f) Provenance

2 delta nodes: 0 stated, 2 partly-inferred, 0 inferred.
Decided by: 0 human, 2 agent-proposed-human-approved, 0 agent-decided.

What the machine decided alone:

- nothing

Conversation: .kotta/changes/send-errors/conversation.md, cited 4 times. Read it for the why before calling anything inferred.
