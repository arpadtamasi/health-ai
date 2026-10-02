---
id: BR-01m3y1prykkz2yqtf6g5fgz0ne
form: business-rule
title: "A photo logs what it shows"
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/app-one-flow/conversation.md · SZ1"]
  quote: null
  inferred: "Derived from the owner's usage logs; the rule's wording is the assistant's."
---
# A photo logs what it shows

## Rule

When a photo shows prepared food, a nutrition label or a scale, the assistant SHALL log what it shows at once, marked as an estimate unless a label or a scale gave the numbers, and SHALL show a card with Edit and Undo. When a photo shows a fridge, a menu or a counter of possible choices, the assistant SHALL propose options and MUST NOT log anything.

## Rationale

Most photos in the owner's logs were meant to be logged, and the earlier default question ("what can I eat from this?") was the opposite of that; a wrong guess costs one tap on Undo, while a question costs a step every time.

## Scope

Photos sent in the app's chat. The model decides what the photo shows; when it cannot tell, it asks one short question.
