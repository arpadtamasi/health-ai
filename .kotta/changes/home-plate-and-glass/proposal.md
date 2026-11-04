# Home plate and glass

## Why

The owner asked: "Az infografika legyen egy stilizált tányér mellette egy pohár. … A tányér legyen harmadolva: fehérje, zsír, szénhidrát és teljen, ahogy eszem." Then: "A teljes felületet is újragondolhatod. A claude-ban kényelmes úgy, ahogy van. A paprika paletta sem követelmény." After the preview: "Most szerintem nem kell az óriás kalória hero." Longer conversations are already comfortable in Claude, so the app becomes the place for a glance and a tap.

## What changes

The home becomes a table seen from above. On top a plate cut into equal thirds for protein, carbs and fat and a glass for water, each filling by area with a layer per entry, a dashed mark for where the plan stands now, and the calories in the centre of the plate. One line under the plate states the situation in words with a drawn mark. Then a row of the four figures, today's entries in a row (a tap highlights the entry's layer), a "What should I eat now?" button whose options are previewed on the plate, and the dock. The conversation moves to a sheet behind a button at the top; while typing, the plate folds into one line. Each macro has its own colour (water is blue); no element changes colour to state the situation. The large hero figure and the chart of the day are gone.

It changes these accepted stories: "Open on a full-screen home that shows the day", "See where I am against the day's pace", "Choose what the home shows", "See today's entries in the thread" (now "See today's entries under the plate"), "Start logging from one button on the home" and "Ask what to eat to catch up", and twelve of their examples. It adds two rules, "Each macro has its own colour, and words state the situation" and "The plate fills each third by area, one layer per entry", and six examples. It removes the rule "The hero's colour states the situation".

Preview the owner reviewed: the "Terített asztal" artifact (https://claude.ai/artifact/5N8KDss6pGqRTXV7bVMHLZ).

Outside the model but part of the work: the new palette (tablecloth and ceramic, beet, wheat, olive and blue for the macros, deep green for actions) replaces Paprika in the app, on the sign-in and on the landing text (J2, answer 4); `app/src/theme/tokens.ts` and `DESIGN.md` follow it. `PRODUCT.md` still names plain Material Design 3 as the visual language; that line is out of date.

## Open decisions

- How is a suggestion logged now that a tap previews it on the plate? (See the open decision in "Ask what to eat to catch up"; the assistant suggests that a second tap on the same option logs it.)
