---
id: BR-01m6p2r4vmgte1n2wkwjx0q28w
form: business-rule
title: The app loads the newest version and the day when it comes back
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/app-update/conversation.md · J1", ".kotta/changes/app-update/conversation.md · J2"]
  quote: "2 ok, de akkor nem kell gomb"
  inferred: "Loading the day again on every return, also when there is no new version, is the assistant's addition for entries logged in Claude; waiting for a pending write is the assistant's addition from the slow-response quality."
---
# The app loads the newest version and the day when it comes back

## Rule

When the app comes back to the front, it SHALL load the day again. When a newer version of the app has been published than the one running, it SHALL load that version instead, which also loads the day, unless text is in the message field, a sheet is open or a log, edit or undo is still waiting for the server; then it SHALL wait and load the new version the next time it comes back with none of these. The app SHALL NOT show a button or a bar for this.

## Rationale

The home-screen app has no reload of its own (story "Load the new version from the home-screen app"). The owner chose loading by itself without a button (J2); waiting while something is typed or saved keeps a half-written message or an unconfirmed entry from being lost (quality "The app stays usable on a slow response": a write is never lost and never repeated on its own).

## Scope

The web app, in a browser tab and on the home screen. A native build is updated by its store.
