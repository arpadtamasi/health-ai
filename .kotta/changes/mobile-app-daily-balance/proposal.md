# Mobile app: daily balance, camera food logging

## Why

The owner uses Health AI from a chat today. Most of the first week's ~95 calls were meal and water logging, many of them the same few items, and each needed a conversation. The owner wants an app that is simpler to use: at any point in the day it shows where they are against the pace of the day ("az első képernyőn az a lényeg, hogy időarányosan hol vagyok"), helps choose the food and the quantity with the camera, and does the logging.

## What changes

The app is chat-first: it opens on a chat with the day's pace on top and a camera button in the input bar; the answers to "what should I eat" are option cards in the chat that are tapped to choose; constraints, goal and eating window are set in a first chat onboarding ("inkább chat lenne az alap és ott lenne egy kamera gomb"; "erősen hagyatkoznék a chatre"). The screens are in `screens/chat-*.png`; the design kit is `docs/designs/what-now-ui/`.

A new phone-facing surface next to the chat connector, drafted here as seven user stories with screen mockups (`screens/`): See where I am against the day's pace, Choose food and quantity with the camera, Log a meal in one step, Log water and repeat items in one tap, Correct a logged meal, Ask and log through a small chat, Ask what to eat to catch up ("valami kis chat"). The first screen shows the pace for calories, carbs and protein, because the owner is behind on carbs today ("ma épp szénhidráttal vagyok lemaradva"), and the chat answers "what should I eat" from that gap ("olyan kérdés lenne, hogy mit egyek"). The chat can also add or remove the quick-add buttons and change the goals ("a gyorsnaplózó gombokat pl chatből adhassam hozzá/vehessem el", "a célokat is módosíthassam chatből"). It uses the same Google Health reads and writes as the chat tools. The chat connector stays as it is.

## Decided by the owner

- (2026-10-01) The home is a full-screen picture of the day with the biggest gap as the hero and rings for calories, carbs, protein and water; logging starts from one button on it; when the chat starts it slides up over the home, which shrinks to a strip. Water is handled, with a goal set like the food goals.
- The address of the service is the app: a splash screen while the sign-in state is pending, then the landing page (signed out) or the app (signed in).
- The app works without Google Health: meals and water live in our own storage and are mirrored to Google Health when it is connected, which is plugged in separately later; earlier entries are not copied for now.

- The pace is the goal spread evenly over a time window the owner sets.
- Goals and quick-add buttons are kept on our side (so the landing page's "Health values stored by us: None" must be reworded: goals and buttons are personal settings, not health measurements).
- When the chat changes a goal or a button it says what it changes and applies it with an Undo.

## Added 2026-10-01: home, water, one front door, use without Google Health

Six more user stories (the full-screen home, logging from one button, water, one front door, use without Google Health, connect Google Health afterwards). They were first drafted as a change of their own and merged here, because they name the actor "Phone user" of this change, which the Kotta cannot resolve until this change is accepted ("akadály: belátásod szerint").

## Open decisions

1. What is the app: an installable web page (PWA) on the existing hosting, or a native app? The owner said "nem biztos, hogy pwa". Suggestion (mine): decide after the stories are clear; only widgets depend on it.
2. Who pays for the camera and chat model calls and how are they limited? Suggestion (mine): the service pays, one daily limit per invited tester.
3. Is "Phone user" the same actor as "Health AI user" in the change add-health-mcp-core? Suggestion (mine): yes, merge them once that change is archived.
4. The remaining questions sit in the stories: where carbs and protein goals come from, activity and the allowance, photo retention, what counts as "usual", what the chat may do, and which foods it may suggest.
