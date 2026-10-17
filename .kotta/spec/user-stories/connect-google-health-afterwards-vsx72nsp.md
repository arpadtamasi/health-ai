---
id: US-01m3w51cs0tvb44382vsx72nsp
form: user-story
title: "Connect Google Health afterwards"
actor: [A-01m3rvr5z4n6ny0qnm5mm438zp]
accepted: ["unimplemented: connecting Google Health afterwards is not built"]
provenance:
  level: stated
  decided_by: human
  sources: [".kotta/changes/mobile-app-daily-balance/conversation.md · SZ12", ".kotta/changes/mobile-app-daily-balance/conversation.md · P31", ".kotta/changes/mobile-app-daily-balance/conversation.md · P32"]
  quote: "azt külön dughatnám rá"
  inferred: null
---
# Connect Google Health afterwards

## Story

As a phone user, I want to connect Google Health later, from the app, when I have a Fitbit, so that my meals and water also show in the Fitbit app and the Claude connector keeps working.

## Value

Connecting adds value (the Fitbit app shows the entries, the Claude connector can read them) but must not be a condition for using the app.

## Notes

The Claude connector (MCP) needs a Google Health connection; the app does not.

## Decided by the owner

- Earlier entries are not copied to Google Health in this change; maybe later ("majd esetleg másoljuk").
- When Google Health is disconnected, everything stays: the logs and the entries in our storage, and nothing is deleted from Google Health ("nem tudom: minden, a logok és a bejegyzések").
