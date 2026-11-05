---
id: EX-01m6m4332s0zwsvq9103fp9ff2
form: example
title: "Choosing a suggestion previews it on the plate"
subjects: [US-01m3rwa0cvrtcapqk0k3h6mqvc]
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: [".kotta/changes/home-plate-and-glass/conversation.md · J2", ".kotta/changes/home-plate-and-glass/conversation.md · J3"]
  quote: "3 igen"
  inferred: "The foods and numbers are sample values chosen by the assistant."
---
# Choosing a suggestion previews it on the plate

## Given

It is 13:00, 660 kcal and 35 g protein were eaten, and the person tapped "What should I eat now?" with a photo of the fridge.

## When

They choose "Chicken breast with rice" (560 kcal, 38 g protein) from the three options.

## Then

The plate still shows above the sheet, and each third gains a dashed layer of what the chicken would add; nothing is logged until they tap the chicken a second time, which logs it with an Undo.
