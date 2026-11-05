---
id: BR-01m6p0m4pwtxhkwfydgky54fpk
form: business-rule
title: A newer version is offered with a refresh button
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: [".kotta/changes/app-update/proposal.md · Why"]
  quote: "Meg frissítés gomb a pwa-ra meg a webappra"
  inferred: "When the check runs (on opening, on coming back to the front, every 15 minutes) is the assistant's proposal."
---
# A newer version is offered with a refresh button

## Rule

When a newer version of the app has been published than the one running, the app SHALL show a bar above the plate that says so ("Új verzió érhető el.") with a "Frissítés" button, and tapping it SHALL load the new version and the day. The app SHALL check for a newer version when it opens, when it comes back to the front and every 15 minutes while it is open. The bar SHALL NOT cover the plate, the dock or a sheet that is open.

## Rationale

The home-screen app has no reload of its own (story "Load the new version from the home-screen app").

## Scope

The web app, in a browser tab and on the home screen. A native build is updated by its store and shows no bar.

## Open decisions

- Should a refresh button sit in the header all the time, next to the conversation button, or should only the bar appear when a new version is out?
- When a new version is out and the app comes back from the background with nothing typed and no sheet open, should it load the new version by itself instead of showing the bar?
