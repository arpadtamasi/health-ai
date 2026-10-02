---
id: EX-01m3w6mwygvv4whahcwbbbmj3m
form: example
title: "Deleting my data removes my meals and water"
subjects: [BR-01m3w6mwr4tjz6d69tmebx5z2k]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/mobile-app-daily-balance/conversation.md · P37"]
  quote: null
  inferred: "The numbers and the wording are sample values chosen by the assistant."
---
# Deleting my data removes my meals and water

## Given

A person has 40 logged meals and 60 logged waters in the service's storage, a goal and a list of foods to avoid.

## When

They run the delete-my-data command in the app.

## Then

The meals, the water, the goals and the foods to avoid are removed from the service's storage in one step, nothing of them remains in the application logs, and the entries already copied to Google Health are untouched.
