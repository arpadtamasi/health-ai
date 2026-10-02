---
id: BR-01m3w6mwr4tjz6d69tmebx5z2k
form: business-rule
title: "Meals and water kept by the service belong to the person"
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/mobile-app-daily-balance/conversation.md · P37", ".kotta/changes/add-health-mcp-core/model/business-rules/per-user-data-isolation-d1c6zyat.md", ".kotta/changes/add-health-mcp-core/model/business-rules/no-health-data-in-logs-cm0nnjtm.md", ".kotta/changes/mobile-app-daily-balance/conversation.md · P38", ".kotta/changes/mobile-app-daily-balance/conversation.md · P39"]
  quote: "az első változat elsősorban google health volt, ez most önálló is"
  inferred: "The owner pointed out that the app is now standalone, so meals and water are kept by the service and no longer only by Google Health. The rule is my reading of what that needs: kept until deleted and deleted by one command (both said by the owner earlier), readable only by the person, never in logs, and no photos or chat text. The owner has not said these words."
---
# Meals and water kept by the service belong to the person

## Rule

The system SHALL keep a person's meals and water, in its own storage, until that person deletes them; SHALL let the person delete their history (their entries, one by one or all) at any time; SHALL delete them together with the rest of that person's data by the delete-my-data command, which the app offers as one command; SHALL make them readable only in that person's own session (no operator or owner tool reads them); SHALL NOT write their contents to the application logs; and SHALL NOT keep photos or chat text on its side.

## Rationale

The first version kept meals and water only in Google Health, so the service held none of this. The app now also works on its own, so the service holds a person's meals and water, which is health information about them; the person decides how long it stays and can remove all of it at once.

## Scope

Meals and water entered in the app or by chat, and their ingredients, source and estimate flag; not the Google Health copy, which the person manages in Google Health.

## Decided by the owner

- Deleting history is done in the chat: the chat has tools to list the latest entries, delete one entry and delete all of the history, and every deletion is confirmed by the person's own tap on a confirmation card, never by the model alone ("a chatben mondhatja, és ez is egy tool"; "ok akkor elfogadom").
- At rest, the database's own encryption is enough for now; the person can delete their history ("egyelőre az adatbázis és törölheti a user a historíját").
- The operator may not look at a person's meals and water ("nem").
