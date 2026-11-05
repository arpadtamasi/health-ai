---
id: BR-01m6ph6dgw3qxzxjjy1sh3t0yz
form: business-rule
title: The dock's switch says whether a message is what was eaten or what to eat
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: [".kotta/changes/ettem-ennek/conversation.md · SZ1", ".kotta/changes/ettem-ennek/conversation.md · J1"]
  quote: "C, de valami jobb felirattal. Egyszer kell megérteni"
  inferred: "The label pair, the remembered side, the one-time hint and the changing chips are the assistant's proposal (preview Ettem, ennék, emlékszem)."
---
# The dock's switch says whether a message is what was eaten or what to eat

## Rule

Above the dock's camera and text field a switch SHALL offer two sides, "Ettem" and "Ennék". What is sent on "Ettem" (text, photo or both) SHALL be taken as what was eaten and logged, unless the message itself asks what to eat; what is sent on "Ennék" SHALL be taken as a request for options and SHALL open the "What should I eat now?" sheet. The text field's placeholder and the chips SHALL follow the side: on "Ettem" the usual items, on "Ennék" requests such as "Mit egyek most?". The switch SHALL stay on the side last used. The first time the dock is shown, one line under the switch SHALL say what the two sides do, and SHALL NOT be shown again. After the eating window the switch SHALL be hidden and the dock SHALL stay on "Ettem".

## Rationale

What was eaten matters as much as what to eat (SZ1); one field with a switch keeps one place to type and photograph while saying which of the two is meant (J1). The owner asked for labels that are understood after one reading (J1).

## Scope

The dock on the home. The conversation sheet keeps one text field without a switch; it answers in the conversation.

## Decided by the owner

- The labels are "Ettem" and "Ennék" (J4: "1 ok", confirmed with "Igen igen").
