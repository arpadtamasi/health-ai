---
version: 1
slug: "server-src-landing-ts"
primary_target: "server/src/landing.ts"
related_targets: ["server/src/app.ts"]
---

# Surface brief: Landing page (`/`)

Shaped with /impeccable on 2026-09-26 from the owner's choice "beszélgetés elöl" (conversation first) and "ez mind elfér a hajtás felett" (everything above the fold). Visual world: the sign-in flow's plain Material Design 3 (see `docs/designs/signin-flow-brief.md`); this surface inherits it and changes no token.

## Scope and visitor mode

- Route `/` on the Cloud Run service, server-rendered like the sign-in pages.
- Mode: **Persuade**. The visitor is an invited tester holding the link from the owner; success is adding the connector in Claude and signing in.
- Language: English (PRODUCT.md).

## Audience, job, proof

- Audience: invited testers (allow-listed Google accounts) and the owner checking the deploy.
- Job: understand in seconds what Health AI does, copy the MCP URL, know what will be shared.
- Proof: one real answer from the owner's own week of testing (sleep summary), supplied by the owner and translated to English; labelled as a real answer, not a promise. No invented users, metrics or testimonials.
- Constraints: no health values beyond the supplied example; no legal pages exist yet, so no Privacy/Terms links; testing mode note (weekly re-sign-in, Google's unverified-app screen).

## Direction contract

THESIS: The product is a conversation, so the landing shows the conversation, not a feature list; the category default of hero headline + three feature cards + CTA is refused.
OWN-WORLD: The sign-in flow's M3 tonal palette from the blue seed (primary #39608f / #a3c9fe), Roboto Flex, tonal surface containers with 16px radii, filled pill buttons, list items with leading icon circles and trailing assist chips, inline Material Symbols. Light and dark follow the system.
STORY: "Claude already knows my week." The tester reads a real answer, believes the data is theirs and stays theirs, copies the URL, and goes back to Claude.
FIRST VIEWPORT: Desktop 1280–1440 wide: a 64px app bar (logo, name, "Testing · invited accounts" chip). Below, a two-column grid, 5/7. Left: the headline "Ask Claude about your own sleep." at 44px, one paragraph, then the connect card: the MCP URL in a surface-container field with a Copy button, and the three steps as a compact list. Right: the conversation card, a tester bubble ("How did I sleep this week?") and Claude's answer trimmed to a two-line summary, three highlight rows and the offer line, with a small "Real answer from the owner's testing week" caption. The six-night table (bed and wake time, asleep, awake, deep, REM) stays inside the answer: every cell is transcribed from the owner's pasted Hungarian answer, and it is the page's strongest proof. Under both columns, one row: what is shared (three list items with chips: Read / Read and write / None). That is the fold at 1440x900. Below it, a section "Also in the same conversation" with two example conversation cards side by side (logging a meal from a photo; starting the late-dinner experiment), then the footer line. The owner asked on 2026-09-26 for more use cases and said they need not sit above the fold. Mobile: one column, conversation card first after the headline.
FORM: "Conversation first", index 3 of the grounded list, dealt by seed key dea25769.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Example conversations

- Hero, sleep this week: the owner's real answer (see FIRST VIEWPORT).
- Below the fold, log a meal: a synthetic exchange (photo attachment, one word, the logged entry), captioned as illustrative; rendered only when the write scope is configured, like the "Read and write" shared item.
- Below the fold, run an experiment: a synthetic exchange following docs/designs/sleep-dinner-experiment.md (early/late assignment, logging, verdict computed in code), captioned as an example with no result.

## Signature interaction

Copying the URL: the Copy button turns into a check with "Copied" for two seconds; no other motion.

## Unresolved

- Product name and logo (placeholder heart icon, as on the sign-in pages).
- Company line in the footer (PROGOS Kft.) and legal pages: not on this page until they exist.
