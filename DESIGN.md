---
name: Health AI
description: 'Terített asztal: the day as a table seen from above, a dark stoneware plate of lentils, rice and pumpkin seeds and a glass on a tablecloth, each macro in its food's colour, the situation said in words and drawn marks.'
colors:
  action-green: "#1d5c4d"
  on-action: "#ffffff"
  action-container: "#d8e9e0"
  on-action-container: "#0e3a30"
  tablecloth: "#e4eae1"
  ceramic: "#fbfcfa"
  ceramic-low: "#f1f4ef"
  ceramic-high: "#e6ebe4"
  plate-white: "#ffffff"
  plate-edge: "#e9ede6"
  empty-well: "#f1f4ef"
  table-shadow: "rgba(28, 48, 36, 0.14)"
  ink: "#17201b"
  ink-muted: "#59675f"
  hairline: "#d2dacf"
  protein-lentil: "#e07a4f"
  carbs-rice: "#f1e8d3"
  fat-pumpkin-seed: "#7f9e47"
  stoneware: "#3b403d"
  stoneware-deep: "#2c302e"
  stoneware-ridge: "#454b48"
  water-blue: "#3a87d0"
  good: "#1e6c42"
  warn: "#b04314"
  error: "#b3261e"
  own-message: "#1d5c4d"
  on-own-message: "#ffffff"
  scrim: "#17201b66"
  action-green-dark: "#86d4b9"
  on-action-dark: "#0b2a21"
  action-container-dark: "#24453b"
  on-action-container-dark: "#cdeee1"
  tablecloth-dark: "#151c18"
  ceramic-dark: "#1d2621"
  ceramic-low-dark: "#232d28"
  ceramic-high-dark: "#2b3530"
  plate-white-dark: "#242e29"
  plate-edge-dark: "#2f3a34"
  empty-well-dark: "#1b231f"
  table-shadow-dark: "rgba(0, 0, 0, 0.5)"
  ink-dark: "#edf3ee"
  ink-muted-dark: "#a0b1a7"
  hairline-dark: "#34413a"
  protein-lentil-dark: "#e07a4f"
  carbs-rice-dark: "#f1e8d3"
  fat-pumpkin-seed-dark: "#7f9e47"
  water-blue-dark: "#63a9ec"
  good-dark: "#74d59d"
  warn-dark: "#ff9b68"
  error-dark: "#ff8a80"
  own-message-dark: "#2f6b5b"
  on-own-message-dark: "#edf3ee"
  scrim-dark: "#000000aa"
typography:
  display:
    fontFamily: "Gabarito, Trebuchet MS, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 800
    lineHeight: "42px"
    letterSpacing: "-0.8px"
  title:
    fontFamily: "Gabarito, Trebuchet MS, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 800
    lineHeight: "normal"
    letterSpacing: "-0.4px"
  line:
    fontFamily: "Gabarito, Trebuchet MS, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: "24px"
    letterSpacing: "-0.2px"
    fontFeature: "tnum"
  card:
    fontFamily: "Gabarito, Trebuchet MS, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 800
    lineHeight: "normal"
    letterSpacing: "normal"
  section:
    fontFamily: "Gabarito, Trebuchet MS, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "normal"
    letterSpacing: "normal"
  body:
    fontFamily: "Figtree, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "23px"
    letterSpacing: "normal"
  button:
    fontFamily: "Figtree, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "normal"
    letterSpacing: "normal"
  meta:
    fontFamily: "Figtree, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "normal"
    letterSpacing: "normal"
  figure:
    fontFamily: "Figtree, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: "normal"
    letterSpacing: "normal"
    fontFeature: "tnum"
  micro:
    fontFamily: "Figtree, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "normal"
rounded:
  stroke-end: "2px"
  entry: "12px"
  tile: "14px"
  bar: "16px"
  bubble: "18px"
  card: "22px"
  sheet: "26px"
  pill: "999px"
spacing:
  xs: "4px"
  s: "8px"
  m: "12px"
  l: "16px"
  xl: "20px"
  xxl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.action-green}"
    textColor: "{colors.on-action}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "48px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.action-green}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "48px"
  button-what-now:
    backgroundColor: "{colors.ceramic}"
    textColor: "{colors.action-green}"
    rounded: "{rounded.pill}"
    height: "48px"
  icon-button-action:
    backgroundColor: "{colors.action-green}"
    textColor: "{colors.on-action}"
    rounded: "{rounded.pill}"
    size: "44px"
  icon-button-quiet:
    backgroundColor: "{colors.ceramic}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "40px"
  chip:
    backgroundColor: "{colors.ceramic}"
    textColor: "{colors.ink}"
    typography: "{typography.meta}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.action-container}"
    textColor: "{colors.on-action-container}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "44px"
  chip-danger:
    backgroundColor: "{colors.ceramic}"
    textColor: "{colors.error}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "44px"
  figure:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.figure}"
    rounded: "{rounded.tile}"
    padding: "5px 6px"
    height: "44px"
  figure-selected:
    backgroundColor: "{colors.ceramic}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "5px 6px"
  day-entry:
    backgroundColor: "{colors.ceramic}"
    textColor: "{colors.ink}"
    typography: "{typography.figure}"
    rounded: "{rounded.entry}"
    padding: "0 10px"
    height: "40px"
  suggestion:
    backgroundColor: "{colors.ceramic}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "9px 12px"
  suggestion-picked:
    backgroundColor: "{colors.ceramic-low}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "9px 12px"
  action-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.tablecloth}"
    typography: "{typography.meta}"
    rounded: "{rounded.bar}"
    padding: "0 6px 0 14px"
    height: "48px"
  action-bar-error:
    backgroundColor: "{colors.error}"
    textColor: "{colors.tablecloth}"
    rounded: "{rounded.bar}"
    padding: "0 6px 0 14px"
    height: "48px"
  reply-assistant:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "0 8px 0 0"
  logged-card:
    backgroundColor: "{colors.ceramic}"
    textColor: "{colors.ink}"
    rounded: "16px"
    padding: "10px 14px"
  side-switch:
    backgroundColor: "{colors.ceramic-low}"
    rounded: "{rounded.pill}"
    padding: "3px"
    height: "44px"
  bubble-own:
    backgroundColor: "{colors.own-message}"
    textColor: "{colors.on-own-message}"
    typography: "{typography.body}"
    rounded: "{rounded.bubble}"
    padding: "10px 14px"
  composer-field:
    backgroundColor: "{colors.ceramic-low}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "11px 16px"
    height: "44px"
  dock:
    backgroundColor: "{colors.ceramic}"
    padding: "10px 14px 14px"
  folded-plate:
    backgroundColor: "{colors.ceramic}"
    textColor: "{colors.ink}"
    typography: "{typography.section}"
    rounded: "{rounded.bubble}"
    padding: "6px 14px 6px 6px"
    height: "56px"
  sheet:
    backgroundColor: "{colors.ceramic}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "8px 16px 14px"
  edit-row:
    backgroundColor: "{colors.ceramic-low}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.bar}"
    padding: "8px 14px"
    height: "48px"
  card:
    backgroundColor: "{colors.ceramic}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "16px"
  card-confirm:
    backgroundColor: "{colors.ceramic-low}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "16px"
---

# Design System: Health AI

## Overview

**Creative North Star: "Terített asztal" (the laid table, seen from above)**

The whole app is one table. The page is a tablecloth, pale sage in daylight (#e4eae1) and near-black green at night (#151c18). On it stand two objects: a dark speckled stoneware plate (#3b403d), divided by raised ridges into three equal thirds, with the calories on its hub, and a tall glass for water. Each third fills with grains of its own food as you eat: red lentils for protein, rice for carbs, pumpkin seeds for fat, from the middle outwards, every other entry a shade deeper; above a goal the grains spill onto the rim. The plate is an object and looks the same in light and dark mode. The sheets, the dock, the cards and the chips are ceramic (#fbfcfa), so the eye reads three materials: cloth, stoneware and ceramic.

Colour is identity, never verdict. Each macro has the colour of its food (protein lentil coral, carbs rice cream, fat pumpkin-seed olive, water blue) and the shape of its grain, and keeps both whatever happens. Where you stand is said by a sentence under the plate, in Gabarito, beside a small drawn mark: an arrow down when you are under the plan, up when ahead, a dot when on it, a tick when done. The plan for now is a dashed contour in each third; the gap is the empty space inside it. Over the goal the line says how far over, and the grains spill. Deep green (#1d5c4d) is kept for the things you press.

The home is dense but calm: one screen, nothing to scroll, the dock always in reach. There is no big standalone number and no chart of the day; the plate and the line are the summary. The system rejects the retired plain Material 3 look (Roboto, a blue seed, tonal containers for state) and the earlier "Paprika" palette; it follows the phone into dark mode with its own full palette rather than an inversion.

**Key Characteristics:**
- Two materials: tablecloth ground, ceramic surfaces; depth comes from tone, a 1px hairline and the plate's own shadow.
- Four identity colours (protein, carbs, fat, water) that never change to signal a state.
- State in words, drawn marks, hatching, dotted plan arcs and ink rims.
- Deep green for actions only; ink outlines for "this one is chosen".
- Gabarito (800/600) for what is said, Figtree (400-700) for what is read and pressed; all figures tabular.
- Light and dark schemes, switched in place from the phone's setting.

## Colors

A muted sage-and-ceramic table carrying four saturated food colours and one deep action green. Light values first, dark in parentheses; the frontmatter holds both (dark keys end in `-dark`).

### Primary
- **Deep Table Green** (#1d5c4d; dark #86d4b9): the action colour. The camera and Send circles, the filled button (Sign in, Save, consent), the chosen half of the "Ettem · Ennék" switch, the "tap again to log" hint on a picked suggestion. Text on it is white (dark: #0b2a21).
- **Pale Leaf** (#d8e9e0, text #0e3a30; dark #24453b, text #cdeee1): the quiet action container. A selected chip (meal type in the edit sheet, the "Connect" chip of the Health banner).

### Secondary: the macro identities
- **Protein Lentil** (#e07a4f, every other entry #c9643b): the lentils of the protein third, its dot in the figures row and on day entries.
- **Carbs Rice** (#f1e8d3, every other entry #e2d4b2, with a thin edge rgba(70,52,30,.38)): the rice of the carbs third and its dot.
- **Fat Pumpkin Seed** (#7f9e47, every other entry #66843a): the seeds of the fat third and its dot.
- **Water Blue** (#3a87d0; dark #63a9ec): the glass and its dot.

These four are drawn at full strength as layers, at 60% opacity in the 45 degree hatching of the gap, at 28% fill under a dashed ink outline for a previewed suggestion, and at 22% for layers that are not the highlighted entry.

### Tertiary: state ink
- **Good Green** (#1e6c42; dark #74d59d): the tick, dot and up-arrow marks.
- **Behind Rust** (#b04314; dark #ff9b68): the down-arrow mark. Figures stay in ink; they never turn rust or green.
- **Error Red** (#b3261e; dark #ff8a80): the outline of an entry that failed to save, the action bar when a save failed, the danger chip, an invalid time in the edit sheet.

State ink only ever accompanies a word or a shape; it never colours a macro's own surface.

### Neutral
- **Tablecloth** (#e4eae1; dark #151c18): the page, behind everything; also the text colour on the inverse action bar.
- **Ceramic** (#fbfcfa; dark #1d2621): dock, sheets, cards (the logged-entry cards of the thread too), chips, day entries, the quiet round button.
- **Ceramic Low** (#f1f4ef; dark #232d28): the composer field, edit-sheet rows, the confirm-delete card, a picked suggestion.
- **Ceramic High** (#e6ebe4; dark #2b3530): the deepest ceramic step, used by the sign-in pages' containers.
- **Plate White** (#ffffff; dark #242e29) with **Plate Edge** (#e9ede6; dark #2f3a34): the plate, its inner rim ring, the hub, the hairline between layers, the glass body.
- **Empty Well** (#f1f4ef; dark #1b231f): the unfilled part of a third.
- **Ink** (#17201b; dark #edf3ee): text, the chosen outline, the plan arcs, the fat cap rim, the action bar ground.
- **Muted Ink** (#59675f; dark #a0b1a7): secondary text: the date, counts, reasons, placeholders, the hub's "/ 2100 kcal".
- **Hairline** (#d2dacf; dark #34413a): 1px borders of ceramic on cloth, the dock's top rule, the sheet handle.
- **Own Message** (#1d5c4d, text #ffffff; dark #2f6b5b, text #edf3ee): the person's own chat bubble.
- **Scrim** (#17201b at 40%; dark #000000 at 67%): behind the edit sheet.
- **Table Shadow** (rgba(28,48,36,0.14); dark rgba(0,0,0,0.5)): the shadow of the plate and the glass.

### Named Rules
**The Own Colour Rule.** Protein is lentil coral, carbs rice cream, fat pumpkin-seed olive, water blue, always, each with its own grain shape. No macro, layer, dot or glass changes hue to say behind, ahead, done or over.

**The Words-and-Marks Rule.** The situation is said by the line under the plate, by a drawn mark (arrow down, arrow up, dot, tick in a 2px ring), by hatching for the lag, a dotted ink arc for the plan, a thick ink rim for the fat cap, and a spill onto the rim for an overrun. State ink may tint these marks and words; it never stands alone.

**The Green Means Press Rule.** Deep Table Green marks what you can press: camera, Send, the filled button, the chosen half of the switch, "Újra". Nothing that only informs is green.

**The Ink Outline Rule.** "This one is chosen" is an ink outline (1.5-2px; 2.4px on the glass), never a colour change: a chosen third, the hub, a figure, a day entry, a picked suggestion. The others step back by opacity (26% for the other thirds, 30% for the glass, 22% for non-highlighted layers).

## Typography

**Display Font:** Gabarito (800 ExtraBold, 600 SemiBold), fallback Trebuchet MS, system-ui
**Body Font:** Figtree (400, 500, 600, 700), fallback system-ui, -apple-system, Segoe UI
**Mono:** the platform monospace, only for the connector address on the sign-in screen

**Character:** Gabarito is round, geometric and a little warm, used for what the app says to you; Figtree is a friendly grotesque for everything you read, scan and press. Both are self-loaded (expo-font in the app, Google Fonts on the server pages).

### Hierarchy
- **Display** (Gabarito 800, 40px, 42px line, -0.8px): the signed-out headline only.
- **Title** (Gabarito 800, 20px, -0.4px): sheet titles ("Mit egyek most?", the edit sheet), the wordmark in the onboarding header. The server pages' h1 uses the same face at 28/34px, -0.4px.
- **Line** (Gabarito 600, 19px, 24px line, -0.2px, tabular): the sentence under the plate. Its sub-line is Meta in Muted Ink.
- **Card** (Gabarito 800, 17px): a card's name, the kcal on the edit sheet.
- **Section** (Gabarito 600, 16px): "Ma eddig" over the day strip, the line in the folded plate.
- **Micro** (Figtree, 13px): the smallest role (legend, figures' names, the switch's one-time line, card macros, steps); nothing smaller is set, except inside the plate's hub, which is sized on screen.
- **Body** (Figtree 400, 16px, 23px line in bubbles): the conversation, inputs, edit-sheet labels. **Button** is Figtree 600 at the same size.
- **Meta** (Figtree 400, 14px): chips, notes, the action bar (500 for the message, 700 underlined for its actions).
- **Figure** (Figtree 700, 13px, tabular): figure values, day-entry amounts; Figtree 400-600 at 13px for times, the date, counts and reasons; 12.5px 600 for figure names.
- **Micro** (Figtree 500, 12px): small notes on the server pages.
- **Hub** (Gabarito 800, 20px, 18px past four characters; Figtree 600 9.5px for "/ goal"): the calories in the plate's centre, drawn in SVG units of the 256-unit plate.

### Named Rules
**The Gabarito Speaks Rule.** Gabarito is for what the app says (headlines, the line, titles, the hub). Data, controls and conversation are Figtree.

**The Tabular Figures Rule.** Every changing number uses tabular figures so columns line up and nothing jitters when a layer grows.

## Layout

One screen, portrait, built at 390px wide and capped at 480px for sheets and server pages. The home stacks top to bottom without scrolling:

1. **Top bar** (min 48px, 18px sides): the date and the clock in Muted Ink (Figtree 600, 13px), and a 40px round conversation button.
2. **Plate and glass**, bottom-aligned, 2px apart: the plate gets the height left once the top bar, the line block, today's entries and the dock are measured, between 110px (96px under 600px of height) and 300px, never wider than the width minus 108px; the glass is a quarter of the plate wide (at least 46px). The hub grows on a small plate so that its figure stays 20px and its goal 11px on screen ("/ 2100" without the unit under 240px).
3. **The line** (20px sides): the 22px mark beside the Line text and its sub-line, 8px apart.
4. **Figures row** (12px sides, 4px gaps): protein, carbs, fat, water in four equal columns.
5. A flexible spacer (min 16px), so the lower block sits on the dock.
6. **"Ma eddig"** heading and a horizontal strip of day entries (6px gaps, 16px inset), scrolled to the newest.
7. **Action bar** when something was just done, then the **dock**: the "Ettem · Ennék" switch, its one-line explanation the first time only, the chips (usual items on "Ettem", "Mit egyek most?" and "Fotó a hűtőről" on "Ennék") and the composer. After the eating window the switch is hidden and the dock stays on "Ettem".

Conversation mode folds the plate into one 56px line at the top and gives the rest to the thread. The thread reads like a chat app: the person's messages in Own Message bubbles, the assistant's replies across the width without a bubble (bold and lists rendered), every entry it logged as a Ceramic card with the name, the amount, three macro dots and Edit and Undo chips (struck through and dimmed once undone), and a message that did not go out marked "Nem ment el" in Warn with a green "Újra". While a reply is written, its steps sit above it as 13px Muted Ink lines, each with a small spinner that turns into a Good Green tick; the text grows under them as it arrives; a card shows as soon as its step ends; and a 44px Strong circle with a white square (Stop) stands in place of Send. A finished or stopped reply folds its steps into one quiet line, tick, the step labels joined by " · ", a chevron, that opens on a tap. The what-now sheet rises from under the figures so the plate stays visible above it with the picked option previewed.

Spacing runs on a 4px base (4, 8, 12, 16, 20, 24px); 6, 10 and 14px appear as in-between gaps and insets. Touch targets are at least 44px; buttons and bars 48px.

## Elevation & Depth

Depth is tonal and physical rather than layered with shadows. Cloth sits lowest, ceramic surfaces sit on it, separated by a 1px Hairline; the inverse ink action bar is the only surface that reverses. The plate and the glass are the only objects that cast a shadow, because they are the only things standing on the table. The edit sheet is a modal over a Scrim. No UI card, chip or sheet carries a box-shadow.

### Shadow Vocabulary
- **Plate shadow**: Table Shadow under the rim, offset 3px right and 6px down, drawn as three widening discs at 40, 22 and 10% so the edge is soft (react-native-svg has no portable blur). The glass casts the same kind of soft ellipse.
- **Glass shadow**: a flat contact ellipse of Table Shadow (60 by 8 units) under the foot of the glass (also unblurred in the build).

### Named Rules
**The Cloth and Ceramic Rule.** Separate surfaces by tone and a 1px Hairline. Only objects on the table cast shadows.

## Shapes

Soft, ceramic corners and true circles. The plate and its hub are circles; thirds are annular sectors with a 1.7 degree gap; layers are separated by a 1.7px Plate White hairline with round joins. The glass is a tapered beaker with rounded foot corners and a highlight stroke. Corners step from 12px (day entries) through 14px (figures, suggestions, photo thumbnails), 16px (action bar, edit rows, banners), 18px (bubbles, folded plate; the bubble's tail corner drops to 4px), 22px (cards), 26-28px (sheet tops) to full pills (buttons, chips, the composer, round buttons). Borders are 1px Hairline at rest and 1.5px where a state can change them (figures, day entries, suggestions, the outlined button). Dashed borders mean "empty" (the empty day strip) or "not yet" (a previewed suggestion).

## Components

### Buttons
- **Shape:** full pill (999px), 48px tall, 20px sides.
- **Primary:** Deep Table Green with white Figtree 600 16px. Disabled at 50% opacity.
- **Text:** transparent with green label.
- **"Ettem · Ennék" switch:** one Ceramic Low pill with a Hairline, two equal halves 38px tall; the chosen half is filled Deep Table Green with white Figtree 700 14.5px, the other is Muted Ink on the pill. It replaces the earlier outlined "Mit egyek most?" button; that label lives on as the first chip of the "Ennék" side and reads "breakfast" before 10:00 with no meal logged.
- **Touch:** every control is at least 44px in its smaller dimension (the conversation toggle and sheet close are 44px circles, day entries and the switch halves 44px tall). Below 700px of height the line block tightens (8px instead of 12px); below 600px the "Ma eddig" heading and the switch's one-time line give their space to the dock.
- **Round actions:** 44px green circles for camera and Send (Send appears only when there is something to send); a 40px Ceramic circle with a Hairline for the conversation toggle and the sheet close.

### Chips
- **Style:** pill, at least 44px tall, 16px sides, 1px Hairline, Ceramic fill, Meta text, optional 16px food icon.
- **Selected:** Pale Leaf fill and border, Figtree 600 text in dark leaf.
- **Danger:** Error Red text (Remove, Delete).
- **Usual items** in the dock are chips, up to six, scrolling sideways.

### Cards / Containers
- **Corner Style:** 22px.
- **Background:** Ceramic with a 1px Hairline (sign-in connector card, consent card); Ceramic Low without border for the in-chat confirm-delete card.
- **Shadow Strategy:** none (see Elevation).
- **Internal Padding:** 16px, 8px gaps.

### Inputs / Fields
- **Composer:** Ceramic Low pill (22px radius), 1px Hairline, 16px sides, 44-120px tall, Body text, Muted Ink placeholder; up to four photo thumbnails (64px, 14px radius) above it with a 28px ink remove dot.
- **Edit rows:** Ceramic Low 16px-radius rows, min 48px, label left, value right in Figtree 600-700; an invalid time turns Error Red.

### Navigation
There is no tab bar. The top bar's round button toggles home and conversation; tapping the folded plate returns home; tapping a third, the glass or a figure chooses what the home shows, tapping again returns to calories.

### The Plate (signature)
A 256-unit SVG: rim (Plate White) with an inner Plate Edge ring, three thirds over Empty Well, one layer per entry filling by area, the hub with the calories. The plan for now is a dotted ink arc (2px, dash 1.5/4.5, 75%); the gap below it is hatched; the fat third carries a 3.5px ink cap rim and spills onto the rim when over. A tap on a third outlines it in ink and dims the others to 26%. A previewed suggestion is a dashed ink-outlined layer at 28%. The newest layer grows in over 520ms with a cubic ease-out, skipped when the phone asks for reduced motion. A 44px "mini" plate without plan, hatching or taps lives in the folded line.

### The Glass (signature)
Beside the plate, 70px wide: fills from the bottom in Water Blue at 92%, a Plate White line between glasses, a dotted ink plan line, hatching for the lag, a Hairline outline that turns to a 2.4px ink outline when chosen.

### The Line and the Mark (signature)
A 22px drawn mark (2px ring, round caps) beside the Line text: arrow down (Behind Rust), arrow up, dot or tick (Good Green), or an empty ring (Muted Ink). The shape carries the meaning; the colour only helps.

### Figures row
Four equal 44px-tall cells: a 9px identity dot and the name (Figtree 600 12.5px), then "eaten / goal" (Figure role). The chosen cell gets a 1.5px ink outline on Ceramic.

### Day strip ("Ma eddig")
Section heading with a count of meals and glasses on the right; 40px Ceramic entries (12px radius, 1.5px Hairline) with the identity dot of the main macro, time, short name and amount. Highlighted: ink outline. Saving: 55% opacity and "…". Failed: Error Red outline. Empty: a dashed Hairline placeholder.

### Action bar
An inverse ink bar (16px radius, min 48px, 14px margin) above the dock: what was just logged or changed in Figtree 500 14px Tablecloth, with underlined Figtree 700 actions (Edit, Undo, Try again, Drop it). On a failed save the ground is Error Red.

### Suggestions (what-now sheet)
The sheet: Ceramic, 26px top corners, 1px Hairline without bottom, a 36 by 4px handle, a Title and a 40px close. Options are 14px-radius rows with a 20px food icon, name and kcal in Figtree 700 15px, the reason in 13px Muted Ink. The first tap picks (ink outline, Ceramic Low, green "tap again to log" hint, preview on the plate); the second logs.

### Chat bubbles
Max 86% wide, 10/14px padding, 18px radius with a 4px tail corner. Assistant: Ceramic with Hairline. Own: Own Message green with white text.

### Folded plate
The conversation-mode status: a 56px Ceramic row (18px radius) with the mini plate, a 20px mark, the line in Section type, and kcal plus clock on the right.

### Edit sheet
A bottom modal over the Scrim: Ceramic, 28px top corners, 20px padding, max 480px; Title and kcal at the top, the macro line in Meta, rows for name, portion (44px round steppers, 10% steps from 10 to 300%), time and meal type (chips); Save (primary button) beside a Remove danger chip.

### Sign-in surfaces
The app's signed-out screen: Tablecloth ground, the 56px "three grains" mark (a lentil, a grain of rice and a pumpkin seed on a stoneware tile, `app/src/components/Logo.tsx`; the same drawing makes every icon through `app/scripts/make-icons.mjs`), Display headline, Body text in Muted Ink, the primary button, and a Ceramic card with the Claude connector address and a Copy chip. The server pages (`server/src/auth/pages.ts`) carry the same palette through `--md-*` variables: `--md-surface` is the Tablecloth, `--md-surface-container-low` the Ceramic, Figtree body at 16px, Gabarito 800 h1 at 28px, a 48px green pill button.

## Do's and Don'ts

### Do:
- **Do** draw each macro and water in its own identity colour (#e07a4f, #f1e8d3, #7f9e47, #3a87d0; water #63a9ec in dark mode) everywhere it appears: grain, dot, glass.
- **Do** say the situation in words first, with a drawn mark, hatching, a dotted plan arc or an ink rim beside it.
- **Do** mark "chosen" with an ink outline and step the rest back by opacity.
- **Do** keep Deep Table Green (#1d5c4d / #86d4b9) for what can be pressed.
- **Do** separate ceramic from cloth by tone and a 1px Hairline; cast shadows only from objects standing on the table, with an offset and a soft edge.
- **Do** use tabular figures for every number that changes.
- **Do** keep targets at least 44px and the dock visible without scrolling.
- **Do** design both schemes; read colours from the palette at render so a scheme change needs no remount.
- **Do** respect reduced motion: layers appear without growing.

### Don't:
- **Don't** turn a third, the glass or a dot red, orange or green to say behind, over or done.
- **Don't** put deep green on anything that only informs.
- **Don't** add a large standalone number or a chart of the day to the home.
- **Don't** put a small label above a heading; the heading speaks for itself.
- **Don't** use typed characters or emoji as icons; icons are Lucide line icons at stroke 2.
- **Don't** bring back Roboto, the blue Material seed or tonal state containers from the retired system.
- **Don't** give cards, chips or sheets a box-shadow.
