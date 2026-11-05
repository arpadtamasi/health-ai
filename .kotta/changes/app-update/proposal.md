# App update

## Why

The owner asked for "frissítés gomb a pwa-ra meg a webappra". The app is used from the phone's home screen, where
there is no address bar and no reload: a new version only arrives when the page happens to be fetched again, and
Firebase Hosting lets the browser keep the page for up to an hour. Entries logged through Claude also do not appear
until the app loads the day again.

## What changes

- The app can tell that a newer version was published than the one it runs, and offers it with a bar and a
  "Frissítés" button (the rule "A newer version is offered with a refresh button").
- The app becomes a proper home-screen app: name "Health AI", its own icon, opens without the browser bar
  (story "Load the new version from the home-screen app").
- Technically: each build writes its version next to the page; the page and that file are served uncached, the
  hashed scripts are cached for good, so a refresh always gets the latest build.

Nothing changes in the plate, the line or the logging. No offline mode: there is no service worker.

## Open decisions

- Whether a refresh button sits in the header all the time, or only the bar appears when a new version is out.
- Whether a new version loads by itself when the app is brought back from the background and nothing is typed.
