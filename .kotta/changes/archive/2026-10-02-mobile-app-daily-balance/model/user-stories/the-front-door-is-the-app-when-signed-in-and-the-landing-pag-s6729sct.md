---
id: US-01m3w51ccdyb7xfbtes6729sct
form: user-story
title: "The front door is the app when signed in, and the landing page when not"
actor: [A-01m3rvr5z4n6ny0qnm5mm438zp]
accepted: ["unimplemented: the front address still shows the landing page; the app is at /app/"]
provenance:
  level: stated
  decided_by: human
  sources: [".kotta/changes/mobile-app-daily-balance/conversation.md · SZ12", ".kotta/changes/mobile-app-daily-balance/conversation.md · P31"]
  quote: "a landing az app maga lenne; ha nem vagyok belépve, a mostani landing; ha belépek, akkor a mostani app"
  inferred: null
---
# The front door is the app when signed in, and the landing page when not

## Story

As a phone user, I want the address of the service to show the app when I am signed in and the current landing page when I am not, so that I open one address and land where I belong.

## Value

Today there are two addresses (the landing page and /app/); a signed-in person opening the front door sees a page that is not for them.

## Notes

The landing page becomes the signed-out screen of the app at the front address; the signed-in view is the current app. While the sign-in state is still pending, a splash screen is shown.

Screenshot: ![The splash while the state is pending](screens/home-23-splash.png)

## Decided by the owner

- The front door decides from the sign-in state, with a splash screen while it is pending ("állapot, splash screennel, amíg pending").
