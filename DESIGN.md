---
name: Health AI
description: Plain Material Design 3 from one calm blue seed, for a chat product's short web stops.
colors:
  primary: "#39608f"
  on-primary: "#ffffff"
  primary-container: "#d3e4ff"
  on-primary-container: "#1e4875"
  secondary-container: "#d7e3f8"
  on-secondary-container: "#3c4758"
  tertiary-container: "#f5d9ff"
  on-tertiary-container: "#533f5e"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  surface: "#f8f9ff"
  surface-container-low: "#f2f3fa"
  surface-container-high: "#e7e8ee"
  on-surface: "#191c20"
  on-surface-variant: "#43474e"
  outline-variant: "#c3c6cf"
typography:
  display:
    fontFamily: "Roboto Flex, Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "44px"
    fontWeight: 400
    lineHeight: "52px"
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Roboto Flex, Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: "36px"
    letterSpacing: "normal"
  headline-small:
    fontFamily: "Roboto Flex, Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: "32px"
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Roboto Flex, Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "24px"
    letterSpacing: "normal"
  body:
    fontFamily: "Roboto Flex, Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "22px"
    letterSpacing: "normal"
  body-small:
    fontFamily: "Roboto Flex, Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "normal"
  label:
    fontFamily: "Roboto Flex, Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0.3px"
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "normal"
rounded:
  hairline: "2px"
  tile: "8px"
  field: "12px"
  container: "16px"
  bubble: "20px"
  card-lg: "24px"
  pill: "24px"
  circle: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
  4xl: "48px"
components:
  button-filled:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "40px"
  button-copy:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "18px"
    padding: "0 14px 0 10px"
    height: "36px"
  button-copy-done:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
    rounded: "18px"
    padding: "0 14px 0 10px"
    height: "36px"
  chip-assist:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label}"
    rounded: "{rounded.tile}"
    padding: "4px 10px"
  chip-status:
    backgroundColor: "{colors.secondary-container}"
    textColor: "{colors.on-secondary-container}"
    typography: "{typography.label}"
    rounded: "{rounded.tile}"
    padding: "6px 12px"
  logo-tile:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
    rounded: "{rounded.tile}"
    size: "32px"
  icon-circle:
    backgroundColor: "{colors.secondary-container}"
    textColor: "{colors.on-secondary-container}"
    rounded: "{rounded.circle}"
    size: "40px"
  step-number:
    backgroundColor: "{colors.secondary-container}"
    textColor: "{colors.on-secondary-container}"
    rounded: "{rounded.circle}"
    size: "28px"
  list-container:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.container}"
    padding: "0"
  list-item:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    padding: "12px 16px"
    height: "56px"
  card-connect:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.container}"
    padding: "20px"
  card-conversation:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.card-lg}"
    padding: "20px 24px 16px"
  chip-attachment:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.tile}"
    padding: "4px 8px 4px 6px"
  logged-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-small}"
    rounded: "{rounded.field}"
    padding: "8px 12px 8px 8px"
  bubble-user:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
    typography: "{typography.body}"
    rounded: "20px 20px 4px 20px"
    padding: "10px 16px"
  url-field:
    backgroundColor: "{colors.surface-container-high}"
    textColor: "{colors.on-surface}"
    typography: "{typography.code}"
    rounded: "{rounded.field}"
    padding: "6px 6px 6px 14px"
  badge-ok:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
    rounded: "{rounded.circle}"
    size: "72px"
  badge-warn:
    backgroundColor: "{colors.tertiary-container}"
    textColor: "{colors.on-tertiary-container}"
    rounded: "{rounded.circle}"
    size: "72px"
  badge-err:
    backgroundColor: "{colors.error-container}"
    textColor: "{colors.on-error-container}"
    rounded: "{rounded.circle}"
    size: "72px"
  appbar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    padding: "0 20px"
    height: "64px"
---

# Design System: Health AI

<!-- Recorded from the shipped build on 2026-09-26 (the below-the-fold "Also in the same conversation" section, attachment chip and logged row added the same day): server/src/auth/pages.ts (tokens, icons, fonts, sign-in components) and server/src/landing.ts (landing page). Values here are what the code does, not what was planned. -->

## Overview

**Creative North Star: "Google's Quiet Neighbour"**

Health AI is plain Material Design 3, played straight, so that its few web pages sit naturally between Claude and Google's own account and Google Health screens. Nothing here is a visual world of its own: one calm blue seed (`#3B6EA8`, recorded in `docs/designs/signin-flow-brief.md`) generates the whole tonal palette, Roboto Flex carries every word at two weights, and depth is done with tonal surface containers instead of shadows. The pages are short stops in a redirect flow; the design's job is to be trustworthy, legible and gone.

The mood is balance, confidence and health: being well, never being a patient. That rules out clinical cues (lab-report tables, medical reds, illness iconography) without needing decoration to replace them. Colour is reserved: primary blue appears on the filled button, the progress fill, a highlighted number and the focus ring; everything else is a soft container tone on a near-white (or near-black) surface. The landing page extends the same materials into a two-column layout with a conversation card, and the conversation card is the closest thing to a signature: a tester bubble in primary-container, an answer led by the logo tile, a weekly table in tabular numerals.

Two things are placeholders, not decisions: the product name "Health AI" and the heart-icon logo tile (both marked unresolved in `PRODUCT.md` and the surface brief). Roboto (Flex) is an accepted choice: the design detector's overused-font warning is waived for it in `.impeccable/config.json` because it is the Material 3 default typeface.

**Key Characteristics:**
- Material 3 tonal scheme from one blue seed; light and dark follow `prefers-color-scheme`, every colour a `--md-*` custom property.
- Roboto Flex at 400 and 500 only; emphasis is weight 500 or primary colour, never bold.
- Flat: no `box-shadow` anywhere; depth is surface → surface-container-low → surface-container-high.
- Rounded containers (16px, 24px for the conversation card), full-pill interactive elements, circular icon holders.
- Inline Material Icons SVG (24px, `currentColor`), never an icon font.
- Dense but airy: 4px rhythm, 12–24px internal padding, 8–16px gaps between siblings.

## Colors

An M3 tonal-spot palette from the blue seed `#3B6EA8`; the frontmatter lists the light scheme, the dark scheme is in `.impeccable/design.json` (`extensions.schemes.dark`) and in `pages.ts` under `@media (prefers-color-scheme: dark)`.

### Primary
- **Seed Blue** (`primary`): the filled button and Copy button, the active step segment and progress fill, the highlighted best/worst values in the weekly table, text-button labels and the 3px focus ring. In dark mode it lightens to a sky tone (`#a3c9fe`) on `on-primary` navy.
- **Sky Container** (`primary-container` / `on-primary-container`): the logo tile, the tester's chat bubble, the "ok" badge, the Copy button's "Copied" state and text selection. The warm, welcoming tint of the system.

### Secondary
- **Slate Container** (`secondary-container` / `on-secondary-container`): every leading icon circle in a list item, the numbered step circles and the "Testing · invited accounts" status chip. Quieter than primary-container; used wherever an icon or number needs a seat without asking for attention.

### Tertiary
- **Lilac Container** (`tertiary-container` / `on-tertiary-container`): the "warn" badge only (access expired, permissions missing). Not used on the landing page.

### Error
- **Rose Container** (`error-container` / `on-error-container`): the "err" badge only (not invited, something went wrong). Never used for text or borders.

### Neutral
- **Surface** (`surface`): page background, app bar and footer sit directly on it.
- **Surface Container Low** (`surface-container-low`): the list block, the connect card, the conversation card, the "what is shared" row.
- **Surface Container High** (`surface-container-high`): the URL field inside a card, and the empty track of the step indicator and progress bar.
- **On Surface** (`on-surface`): headlines, list titles, answer text, code.
- **On Surface Variant** (`on-surface-variant`): body copy, intro paragraph, secondary lines, notes, captions, table headers, chip text.
- **Outline Variant** (`outline-variant`): the 1px divider between list items, the assist-chip border, the table header rule, the caption rule; at 45% via `color-mix` for table row separators.

### Named Rules
**The Container Rule.** Colour arrives as a container pair (`*-container` + `on-*-container`), never as a solid fill: primary solid is only for the filled button, the progress fill, a highlighted number and the focus ring.

**The System Scheme Rule.** Every colour is a `--md-*` custom property declared once for light and once under `prefers-color-scheme: dark`; no hex value appears outside `:root`, and no page offers a manual theme toggle.

## Typography

**Display Font:** Roboto Flex (with Roboto, system-ui, -apple-system, Segoe UI, sans-serif)
**Body Font:** Roboto Flex (same stack)
**Label/Mono Font:** ui-monospace, SFMono-Regular, Menlo, Consolas, monospace (the MCP URL only)

**Character:** One variable family at two weights (400 and 500; only those are loaded from Google Fonts with `opsz` 8..144) reads as Google's own voice. Headlines are regular weight, large and calm; emphasis inside running text is weight 500, never bold. Roboto is an accepted choice recorded in `.impeccable/config.json`.

### Hierarchy
- **Display** (400, 44px/52px, -0.01em, max 14ch): the landing headline "Ask Claude about your own sleep."; drops to 34px/42px under 900px. `text-wrap: balance`.
- **Headline** (400, 28px/36px): the h1 of every sign-in page. `text-wrap: balance`.
- **Headline Small** (400, 24px/32px, -0.005em): the below-the-fold section heading "Also in the same conversation"; 22px/28px under 900px.
- **Title** (500, 16px/24px): card headings ("Connect it to Claude"). The app bar's product name is a title variant at 18px/500.
- **Body** (400, 15px/22px): conversation bubbles and answer paragraphs; list-item titles use 15px/20px.
- **Body Small** (400, 14px/20px, max 40ch): sign-in body copy, step titles, highlight rows, the offer line. The landing intro is a larger body at 17px/26px, max 44ch.
- **Label** (500, 12px/16px, 0.3–0.5px tracking): status chip, assist chip, notes, captions, footer. Table column headers are 11px/500 uppercase with 0.4px tracking.
- **Code** (400, 13.5px/20px, monospace): the connector URL, with `overflow-wrap: anywhere` and `user-select: all`.

### Named Rules
**The Two-Weight Rule.** 400 for reading, 500 for emphasis and labels. No 300, no 600, no 700; the font request only loads 400 and 500.

**The Tabular Numbers Rule.** Any block that shows measurements (the conversation card) sets `font-variant-numeric: tabular-nums` so times and durations align in columns.

## Layout

Two containers, both centred with `margin: 0 auto` on the surface colour:

- **Sign-in shell:** `max-width: 480px`, `min-height: 100dvh`, a flex column of app bar (64px) then `main` with `gap: 16px` and padding `8px 20px 24px`. Actions sit at the bottom (`margin-top: auto`) as a stacked column with 8px gaps. Result pages (`main.center`) centre content and text with `padding-bottom: 64px`. Safe-area insets pad the body top and bottom.
- **Landing:** `max-width: 1200px`, side padding 32px (20px under 900px). The hero is a 5fr/7fr grid with a 48px gutter and `padding: 40px 0 32px`; the left column stacks headline, intro and connect card with 20px gaps. Under both columns the "what is shared" row is an auto-fit grid (`repeat(auto-fit, minmax(min(100%, 300px), 1fr))`) of list items separated by 1px vertical dividers, so two items fill the row when the write scope is off. Below the fold, the `.more` section (`padding: 40px 0 8px`, flex column, 16px gap) holds a headline-small and an auto-fit grid of further conversation cards (`repeat(auto-fit, minmax(min(100%, 440px), 1fr))`, 24px gap, `align-items: stretch`): two cards sit side by side and share a bottom edge because each card's caption is pushed down with `margin-top: auto`; a lone card (write scope off) takes the full width. Then a footer (`padding: 32px 0 24px`) with space-between, wrapping.

**Breakpoint:** one, at `max-width: 900px`. The hero collapses to one column (24px gap) and reorders: headline, intro, conversation card, connect card. The table hides its "In bed" column, every conversation card tightens to `16px 18px 14px` with a 20px radius, the shared row stacks with horizontal dividers, and the `.more` section becomes `padding: 32px 0 0` with a one-column grid at 16px gap and cards at `16px 18px 14px`.

**Rhythm:** a 4px base. Gaps between siblings: 6px (step indicator, Copy button icon), 8px (buttons, actions, URL field, highlight list), 10px (step list), 12px (list-item columns, brand, answer columns), 14px (card contents), 16px (main), 20px (lead column), 24–48px (hero). Internal padding: 12px 16px (list item), 20px (connect card), 20px 24px 16px (every conversation card).

## Elevation & Depth

Flat. There is no `box-shadow` in either file. Depth is tonal layering only: the page is `surface`, cards and list blocks step up to `surface-container-low`, and a field inside a card steps once more to `surface-container-high`. Interactive emphasis comes from colour (primary fill on buttons) and, on the Copy button, an M3 state layer: an `::after` overlay of `on-primary` at 8% on hover and 12% on active, fading over 150ms. Inside the conversation card, the attachment chip and the logged row step *down* to `surface` to read as inset objects on the `surface-container-low` card. The sign-in buttons brighten instead (`filter: brightness(1.06)` on hover); see the drift note in the report.

### Named Rules
**The No-Shadow Rule.** Surfaces never cast shadows. A new surface picks the next container tone up; if it needs a boundary on the same tone, it gets a 1px `outline-variant` line.

## Shapes

Rounded, in three families:

- **Containers** are 16px (list block, connect card, shared row); the conversation card is 24px (20px on mobile) and the URL field inside a card is 12px. Small tiles (logo, assist chip, status chip) are 8px.
- **Interactive elements are full pills**: the 48px button is 24px radius, the 40px text button inherits it, the 36px Copy button is 18px.
- Inset objects on a card are 8px (attachment chip) and 12px (logged row), matching the tile and field radii.
- **Icon holders are circles**: 40px list-item icon circle (32px inside the conversation card), 28px numbered step circle, 72px result badge.
- The tester's bubble is asymmetric, `20px 20px 4px 20px`, with the tight corner at the bottom-right pointing to the sender.
- Hairlines: the step indicator and progress bar are 4px tall with 2px radius.
- Borders are used only as dividers and the assist-chip outline, always 1px `outline-variant`. Lists clip their children with `overflow: hidden`.

## Components

### Buttons
- **Shape:** full pill (24px radius on 48px height).
- **Filled:** `primary` on `on-primary`, `padding: 0 24px`, 15px/500 with 0.1px tracking, optional leading 24px icon with 8px gap, full width inside the sign-in actions column. Rendered as an `<a class="btn">`.
- **Text:** transparent, `primary` text, 40px min height; used for the secondary "Back to Claude" action under a filled button.
- **Copy (landing):** a real `<button>`, 36px, `padding: 0 14px 0 10px`, 13px/500, 18px leading icon with 6px gap. Hover/active use the on-primary state layer (8%/12%). After a successful copy it swaps to `primary-container` with a check icon and "Copied" for 2 seconds, then reverts. `aria-live="polite"`.
- **Hover / Focus:** focus is `outline: 3px solid primary` with 3px offset on both button kinds. Hover on the sign-in buttons is `brightness(1.06)`; on the Copy button the state layer.

### Chips
- **Assist chip** (trailing in list items): outlined, 1px `outline-variant`, transparent, `on-surface-variant` text, 12px/500, `padding: 4px 10px`, 8px radius, `white-space: nowrap`. Values: Read / Read and write / None.
- **Status chip** (app bar, landing): filled `secondary-container` on `on-secondary-container`, 12px/500 with 0.3px tracking, `padding: 6px 12px`, 8px radius. Text "Testing · invited accounts".

### Cards / Containers
- **List block:** `surface-container-low`, 16px radius, clipped; items are a `40px 1fr auto` grid with 12px gaps, `padding: 12px 16px`, 56px min height, 1px `outline-variant` divider between items. Leading 40px icon circle in `secondary-container`; title 15px/20px `on-surface`, supporting line 12.5px/16px `on-surface-variant`; trailing assist chip. On the landing the same items sit side by side in a 3-column grid with vertical dividers and `padding: 12px 20px`.
- **Connect card:** `surface-container-low`, 16px radius, `padding: 20px`, 14px column gap. Contains a title, the URL field, a numbered step list and a left-aligned note.
- **Conversation card:** `surface-container-low`, 24px radius, `padding: 20px 24px 16px`, 14px gap, tabular numerals (on mobile 20px radius; every card `16px 18px 14px`). In the `.more` grid the caption carries `margin-top: auto` so side-by-side cards share a bottom edge. Contains a tester bubble, the answer led by the logo tile, a follow-up line, and a caption row separated by a 1px `outline-variant` rule with a 16px chat icon. Three exist: the sleep week in the hero, the meal and the experiment in the `.more` grid.
- **Shadow strategy:** none (see Elevation & Depth).

### Inputs / Fields
- **URL field:** read-only `surface-container-high` strip, 12px radius, `padding: 6px 6px 6px 14px`, flex row of monospace `<code>` (13.5px/20px, `user-select: all`) and the Copy button at the right edge. No interactive text input exists in the system yet; Google's own screens handle sign-in.

### Navigation
- **App bar:** 64px, `surface`, no border. Left: the brand (32px logo tile with the 20px heart icon in `primary-container`, then "Health AI" at 18px/500, 12px gap). On the landing the bar spreads to `space-between` with the status chip on the right and no side padding (the container pads). The sign-in bar pads 20px. No navigation links anywhere; the pages are short stops.

### Logo tile
32px, 8px radius, `primary-container` with `on-primary-container` heart icon at 20px. Reused as the assistant avatar in the conversation card (`32px 1fr` grid, 12px gap, nudged 2px down). Placeholder: the heart icon and the name are not final.

### Icon circles and step numbers
- **Icon circle:** 40px circle, `secondary-container`, 24px icon; 32px with an 18px icon inside the conversation card's highlight rows and logged row.
- **Step number:** 28px circle, `secondary-container`, CSS counter at 13px/500; step text is 14px/20px with a 500 title and a 13px/18px `on-surface-variant` line.

### Attachment chip
A small inset chip inside a tester bubble for an attached photo (meal conversation card): `surface` on `on-surface`, 8px radius, `padding: 4px 8px 4px 6px`, 12px/500, 16px leading icon with 6px gap, 6px below to the bubble text.

### Logged row
A confirmation strip inside an answer (meal conversation card): `surface` on `on-surface`, 12px radius, `padding: 8px 12px 8px 8px`, `32px 1fr` grid with 10px gap, 12px above; a 32px `secondary-container` icon circle with an 18px check, a 14px/20px line and a 12.5px supporting line in `on-surface-variant`.

### Tester bubble
`primary-container` on `on-primary-container`, `20px 20px 4px 20px` radius, `padding: 10px 16px`, 15px/22px, right-aligned, max 70% width (85% on mobile).

### Weekly table
Full-width, `border-collapse`, 13px/18px (12px on mobile), cells `padding: 5px 8px 5px 0` left-aligned, `white-space: nowrap`. Header row 11px/500 uppercase `on-surface-variant` with a 1px `outline-variant` bottom rule; row headers 500; body rows separated by `outline-variant` at 45% (`color-mix`). Highlighted values are `primary` at 500. The caption is visually hidden.

### Result badge
72px circle with a 40px icon, above a centred headline. Variants: ok (`primary-container`, check), warn (`tertiary-container`, schedule/lock), err (`error-container`, block/error).

### Step indicator and progress bar
Three 4px segments with 6px gaps and 2px radius on `surface-container-high`; completed segments are `primary`. The connected page's progress bar is 120px wide, fills with `scaleX` over the redirect delay (linear), and is disabled under `prefers-reduced-motion: reduce`.

### Icons
Material Icons paths (Apache-2.0) inlined as 24px SVG with `fill: currentColor`, `aria-hidden`. Sizes: 24px in list circles, 20px in the logo tile, 18px in the Copy button, highlight rows and logged row, 16px in the caption and attachment chip, 40px in a badge.

## Do's and Don'ts

### Do:
- **Do** take every colour from a `--md-*` custom property and add new ones in both the light and dark blocks of `STYLE` in `pages.ts`.
- **Do** use a container pair for any coloured seat (icon circle, tile, bubble, badge): `*-container` background with `on-*-container` foreground.
- **Do** keep type to Roboto Flex 400 and 500; emphasise with weight 500 or `primary`, and set `tabular-nums` wherever numbers line up.
- **Do** build new surfaces on the tonal ladder: `surface` → `surface-container-low` → `surface-container-high`, 16px containers, full-pill buttons, 1px `outline-variant` dividers.
- **Do** inline Material Icons as SVG through `icon()` and add paths to `ICONS`; keep focus rings at `3px solid primary` with 3px offset and honour `prefers-reduced-motion`.

### Don't:
- **Don't** add `box-shadow`, gradients or a manual dark-mode toggle; the build has none.
- **Don't** hard-code hex values in component CSS or introduce a second accent; tertiary and error containers are for badges only.
- **Don't** load an icon font or a third typeface; the only non-Roboto face is the monospace stack for the connector URL.
- **Don't** use weight 700 or uppercase for emphasis in running text; uppercase exists only in the table header labels.
- **Don't** show health values outside the one supplied example answer, and don't reach for clinical cues (lab-report styling, medical red as text) anywhere.
