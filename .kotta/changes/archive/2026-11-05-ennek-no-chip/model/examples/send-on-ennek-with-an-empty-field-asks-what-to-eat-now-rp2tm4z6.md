---
id: EX-01m6pv411c3hpg00qkrp2tm4z6
form: example
title: Send on Ennék with an empty field asks what to eat now
subjects: [BR-01m6ph6dgw3qxzxjjy1sh3t0yz, US-01m3rwa0cvrtcapqk0k3h6mqvc]
provenance:
  level: inferred
  decided_by: agent-proposed-human-approved
  sources: [".kotta/changes/ennek-no-chip/conversation.md · SZ1"]
  quote: null
  inferred: "Sending with an empty field is the assistant's proposal, so that asking stays one tap without the chip."
---
# Send on Ennék with an empty field asks what to eat now

## Given

It is 12:40 and the dock is on "Ennék"; there are no chips and the field is empty.

## When

The person taps Send.

## Then

The "What should I eat now?" sheet opens and asks what they can choose from, as the chip did before; nothing is logged.
