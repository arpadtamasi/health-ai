---
id: BR-01m6ph6dq7aszxhxgzz4kgr8d4
form: business-rule
title: The conversation keeps what happened in it
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: [".kotta/changes/napi-lap/conversation.md · SZ1", ".kotta/changes/napi-lap/conversation.md · J1", ".kotta/changes/streamed-reply/conversation.md · SZ1", ".kotta/changes/ettem-ennek/conversation.md · SZ1", ".kotta/changes/ettem-ennek/conversation.md · J2"]
  quote: "ha beszélgetésbe/fotóba kerülök, az lenne a jó, ha kb ugyanaz az élmény lenne, mint a claude/chatgpt"
  inferred: "The comparison with Claude and ChatGPT and the five gaps are the assistant's; keeping a photo for two more messages is the assistant's choice."
---
# The conversation keeps what happened in it

## Rule

The conversation SHALL read like a chat app. The person's messages SHALL stay in bubbles; the assistant's replies SHALL be shown without a bubble, across the width, with their formatting (bold, lists). An entry logged during the conversation SHALL stay in it as a card with its name, calories and macros and with Edit and Undo, and after Undo the card SHALL say it was undone. A message that did not reach the service SHALL say so under it with "Újra", which sends the same text and photos again; nothing SHALL be sent again without that tap. A photo SHALL be seen by the assistant with its message and with the next two messages after it. The camera button SHALL offer taking a photo now or choosing one from the gallery. The conversation SHALL start on a new page each day, when the diary's day changes in the person's time zone: earlier days SHALL NOT be shown in the app, and the assistant SHALL be given only today's conversation; a page open when the day changes SHALL stay until the app next comes back to the front.

## Rationale

A day's conversation belongs to that day, like the diary; the owner chose a clean page with no earlier days shown, and the assistant reading only today (napi-lap J1). Earlier days stay stored as the rule "The chat is kept during the test" says. Long conversations are comfortable in Claude and ChatGPT; the owner wants the same feeling once in the app's conversation or photo (SZ1), and chose all of the gaps found in the comparison (J2). The two-message window keeps follow-up questions about a photo working while each photo is paid for in the daily limit only a few times.

## Scope

The conversation sheet and the dock. Replies that grow as they are written, their steps and Stop are the rule "A reply arrives as it is written, with its steps".
