---
id: BR-01m6ph6dgw3qxzxjjy1sh3t0yz
form: business-rule
title: The dock's switch says whether a message is what was eaten or what to eat
provenance:
  level: partly-inferred
  decided_by: agent-proposed-human-approved
  sources: [".kotta/changes/ennek-no-chip/conversation.md · SZ1", ".kotta/changes/ennek-no-chip/conversation.md · J1", ".kotta/changes/ettem-ennek/conversation.md · SZ1", ".kotta/changes/ettem-ennek/conversation.md · J1"]
  quote: "C, de valami jobb felirattal. Egyszer kell megérteni"
  inferred: "The label pair, the remembered side, the one-time hint and the changing chips are the assistant's proposal (preview Ettem, ennék, emlékszem)."
---
# The dock's switch says whether a message is what was eaten or what to eat

## Rule

Above the dock's camera and text field a switch SHALL offer two sides, "Ettem" and "Ennék". What is sent on "Ettem" (text, photo or both) SHALL be taken as what was eaten and logged, unless the message itself asks what to eat; what is sent on "Ennék" SHALL be taken as a request for options and SHALL open the "What should I eat now?" sheet. The text field's placeholder SHALL follow the side. On "Ettem" the chips SHALL offer the usual items; on "Ennék" the chips SHALL offer up to four of the person's usual foods that fit what is left of today's calories, the one that closes most of the largest macro gap first, worked out on the phone without a model call, and SHALL show none when none fits; a tap on one SHALL preview it on the plate and a second tap SHALL log it, as on the "What should I eat now?" sheet; Send SHALL be available with an empty field, asking "Mit egyek most?" as it is. The switch SHALL stay on the side last used. The first time the dock is shown, one line under the switch SHALL say what the two sides do, and SHALL NOT be shown again. After the eating window the switch SHALL be hidden and the dock SHALL stay on "Ettem".

## Rationale

What was eaten matters as much as what to eat (SZ1); one field with a switch keeps one place to type and photograph while saying which of the two is meant (J1). The owner asked for labels that are understood after one reading (J1).

## Scope

The dock on the home. The conversation sheet keeps one text field without a switch; it answers in the conversation.

## Decided by the owner

- The "Ennék" chips are the usual foods that fit now (J1: "A"); the "Mit egyek most?" chip goes (SZ1).
- The labels are "Ettem" and "Ennék" (J4: "1 ok", confirmed with "Igen igen").
