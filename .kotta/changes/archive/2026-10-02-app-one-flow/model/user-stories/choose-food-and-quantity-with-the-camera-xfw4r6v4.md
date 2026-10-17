---
id: US-01m3rvr6am99nrrbycxfw4r6v4
form: user-story
title: "Choose food and quantity with the camera"
actor: [A-01m3rvr5z4n6ny0qnm5mm438zp]
provenance:
  level: stated
  decided_by: human
  sources: [".kotta/changes/app-one-flow/conversation.md · SZ1"]
  quote: "nem megy a fotó meg az egész kicsit clunky; tervezd át az appot; a beszélgetéseimből akarom megtakarítani, amit lehet"
  inferred: null
---
# Choose food and quantity with the camera

## Story

As a phone user, I want to take a photo with the phone's own camera and have the app log what it shows (a plate, a label, a scale or a package) at once as an estimate, so that I only correct what is wrong instead of describing the meal.

## Value

In the owner's logs about one message in four was a photo with no text, almost always a plate, a label or a scale to be logged, and only now and then a fridge to choose from. The in-app viewfinder did not work on the owner's phone; the phone's own camera does.

## Notes

The camera button opens the system camera (on the web, a file input that opens the camera on a phone); the picture is scaled to 1280 px before it is sent. Several photos can go in one message (a scale and a package). What the photo shows decides what happens: see "A photo logs what it shows".

Photos stay on the phone and are not stored by us, as decided earlier.
