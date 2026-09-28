---
name: feedback
description: This skill should be used when the owner says "jött feedback", "read the feedback", "check feedback", "triage feedback", "what did testers say", "mark feedback done", or asks about the state of feedback sent from Claude through Health AI's send_feedback tool. It reads new feedback, merges it into the triage ledger at docs/feedback/triage.md, and moves entries through their states.
---

# Feedback: read and track

Testers and their agents send feedback from Claude with Health AI's `send_feedback` tool
(`server/src/mcp/insight.ts`). Each record lands in the Firestore collection `feedback` of the
project in `.health-ai.env` (`PROJECT_ID`), with `createdAt`, `source` (`user` | `agent`), `kind`
(`bug` | `confusing` | `too_many_calls` | `missing_capability` | `other`), `tools` and `message`.
Firestore deletes each record 90 days after `createdAt` (TTL on `expireAt`), so the ledger is the only
lasting record.

The ledger is `docs/feedback/triage.md`. Feedback is addressed to the developer: it is about the
service (tools, descriptions, missing capabilities), not the user's health data, so the ledger keeps
each message **verbatim**, next to a one-line summary. One rule still holds because the file is
committed: before writing, replace any email address, personal name, raw `userId` or a value that is
clearly the user's own measurement with `[redacted]`. Illustrative numbers in a request ("~55 g
protein") are not measurements and stay.

## 1. Read

Take the first source that works, and say in one line which one you used.

1. **The Health AI connector.** Search the deferred tools for `list_feedback` (the connector's tools
   are named like `mcp__claude_ai_Health_AI_Hub__list_feedback`). Call it with `from` set to the day
   after the newest `at` in the ledger (or leave it out for the default 30 days) and `limit: 200`.
   It is owner-only and returns `at`, `user` (a pseudonym), `source`, `kind`, `tools`, `message`.
   If the connector is listed as needing authentication, tell the owner to connect it in claude.ai
   (Settings → Connectors → Health AI) and continue with the next source.
2. **Firestore, through `scripts/read-feedback.sh [since]`.** It is read-only, prints one JSON line
   per record (`at`, `source`, `kind`, `tools`, `message`) and never prints the raw `userId`. Pass
   the day of the newest `at` in the ledger as `since`. The owner allows it once with the permission
   rule `Bash(scripts/read-feedback.sh:*)`; if the harness blocks it, say that this rule is missing
   and stop. Do not read Firestore any other way. The ledger's user column stays `—` for these records.
3. **Pasted text.** The owner pastes the feedback or a screenshot of `list_feedback` output.

## 2. Merge

- The key of an entry is its `at` timestamp (ISO 8601, UTC, milliseconds), which both sources carry.
  An entry already in the ledger is never added twice and never loses its state.
- New records enter with state `new`.
- For each new record, add a row (key, state, kind, source, tools, user pseudonym from the connector
  or `—`, one-line summary, action) and, under `## Messages`, a subsection headed by the key with the
  message verbatim as a blockquote, redacted as above.

## 3. Triage

Present the new entries to the owner in chat, newest first: the summary, kind, tools, and your
reading of what it points at in the code or the spec (name the file, tool or Kotta node). Group
duplicates. Then propose a state for each; the owner decides. Do not change a state on your own
judgement.

| State | Meaning | Required in the `Action` column |
|---|---|---|
| `new` | Read, not yet decided | nothing |
| `accepted` | Worth acting on | what will happen: an OpenSpec change name, a bug to fix, a doc to update |
| `declined` | Not acting on it | the reason in a few words |
| `duplicate` | Same as another entry | the `at` key of the original |
| `done` | Acted on and shipped | the commit, PR or archived change |

Transitions: `new` → `accepted` | `declined` | `duplicate`; `accepted` → `done` | `declined`.
Nothing leaves `done`, `declined` or `duplicate` except on the owner's word.

## 4. Act

An `accepted` entry is not a licence to change the product. Follow the repository's rules
(`AGENTS.md`, `.kotta/AGENTS.md`):

- A change in behaviour, a new capability or a changed promise goes through OpenSpec:
  `/opsx:propose` (or `/opsx:explore` first), then `plan-change` to the one human gate. Put the change
  name in the entry's `Action`.
- A defect against an accepted promise is fixed in code that cites the node it keeps, with a test.
- A confusing tool description or doc is a small edit; say which file.

Mark an entry `done` only when the fix is merged or the change is archived, with the reference.

## 5. Report

End with the counts per state after the merge, the entries that changed state in this run (by key and
summary), and the oldest `new` entry's age. Commit the ledger only when the owner asks.
