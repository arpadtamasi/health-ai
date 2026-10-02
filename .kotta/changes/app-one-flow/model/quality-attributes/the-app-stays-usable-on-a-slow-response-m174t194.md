---
id: QA-01m3y2sn77z4s7pszem174t194
form: quality-attribute
title: "The app stays usable on a slow response"
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/app-one-flow/proposal.md · What changes"]
  quote: "nem kell meleg példány, azt elfogadom, de számítson a frontend lassú reakcióra"
  inferred: "The owner said this in the session. The thresholds (a slow-connection notice after 2.5 seconds, a 45 second limit, one retry for reads) are the assistant's choices."
---
# The app stays usable on a slow response

## Source

A person using the app.

## Stimulus

The service answers slowly: the first call after a quiet hour starts an instance and takes several seconds, or the network is poor.

## Environment

The service scales to zero (no warm instance); a phone or a browser on a mobile connection.

## Artifact

The home screen and the actions on it (logging, editing, undoing, the chat).

## Response

The app SHALL show the result of the person's own action at once and confirm it with the server afterwards, SHALL draw the last known day from the device while the server is read, SHALL say when the connection is slow, SHALL show that the assistant is thinking, SHALL offer a retry for an action that failed instead of losing it, and SHALL NOT repeat a write on its own.

## Measure

A logged item, a water chip, an undo and an edit change the screen within one frame of the tap; the notice "the connection is slow" appears after 2.5 seconds of waiting; a request is given up after 45 seconds; a read is tried once more after a failure, a write never.
