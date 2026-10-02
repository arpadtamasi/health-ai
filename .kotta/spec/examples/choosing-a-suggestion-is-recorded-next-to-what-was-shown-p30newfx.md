---
id: EX-01m3s789wxqpqankpfp30newfx
form: example
title: "Choosing a suggestion is recorded next to what was shown"
subjects: [US-01m3s789qmvs4jx8e93nb2j61n]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["docs/designs/mobile-app-what-now.md · Success Criteria"]
  quote: null
  inferred: "Sample options and numbers are mine."
---
# Choosing a suggestion is recorded next to what was shown

## Given

The "What now?" answer showed three options in this order: chicken with rice, a wholegrain sandwich, a salad.

## When

The user taps the sandwich card.

## Then

One record is saved with the three options in their order, the choice (the second one), and the time. It contains no photo, and it counts as followed because the choice was among the suggestions.
