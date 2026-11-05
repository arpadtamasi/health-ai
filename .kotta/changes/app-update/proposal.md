# App update

## Why

The owner asked for "frissítés gomb a pwa-ra meg a webappra" (SZ1). The app is used from the phone's home screen,
where there is no address bar and no reload: a new version arrives only when the page happens to be fetched again,
and Firebase Hosting lets the browser keep the page for up to an hour. Entries logged through Claude do not appear
until the app loads the day again.

## What changes

- When the app comes back to the front it loads the day again, and if a newer version was published it loads that
  version instead, unless a message is being typed or a sheet is open; then it waits for the next time. There is no
  button and no bar for it (J1, J2): rule "The app loads the newest version and the day when it comes back".
- The app becomes a proper home-screen app: name "Health AI", the "three grains" icon (J3), opens without the browser
  bar: story "Load the new version from the home-screen app".
- Technically: each build writes its version next to the page; the page and that file are served uncached and the
  hashed scripts are cached for good, so opening the app always gets the latest build.

Nothing changes in the plate, the line or the logging. No offline mode: there is no service worker.

## Open decisions

None: the owner answered all three (J1, J2, J3).
