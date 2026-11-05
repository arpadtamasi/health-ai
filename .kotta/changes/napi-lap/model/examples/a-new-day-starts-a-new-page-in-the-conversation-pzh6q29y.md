---
id: EX-01m6py99nbp6t6ctsbpzh6q29y
form: example
title: A new day starts a new page in the conversation
subjects: [BR-01m6ph6dq7aszxhxgzz4kgr8d4]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: [".kotta/changes/napi-lap/conversation.md · SZ1", ".kotta/changes/napi-lap/conversation.md · J1"]
  quote: "De ráadásul naponta új lap indulhatna a chatben is."
  inferred: "The times and the message are the assistant's."
---
# A new day starts a new page in the conversation

## Given

Yesterday the person wrote 30 messages with the assistant; today is a new day in their time zone.

## When

They open the app at 7:10 and write "Ettem egy joghurtot".

## Then

The conversation is an empty page with only today's message and its answer; none of yesterday's messages is shown or sent to the assistant, and yesterday's messages are still stored.
