# Grains on the plate

## Why

After the plate and glass went live, an Impeccable critique from the owner's point of view found that eating over the goal looks like success (2,735 of 2,100 kcal shown as "Mára kész." with a tick) and that the evening line ("1,390 kcal under the plan" at 21:40) invites late eating. The owner kept the plate ("A tányér maga jó") and, after six fillings, chose grains: "Tetszik a rizs, de lehetne különböző a három", with colours rethought ("A színeket gondold át"), then "Nézzük".

## What changes

- The thirds fill with grains of their own food: red lentils for protein, rice for carbs, pumpkin seeds for fat, a shade per entry, growing from the middle; a dashed contour marks the plan ("Each third of the plate fills with its own food, one portion per entry").
- The colours become the foods' own: coral, cream, olive, and blue for water, everywhere on the home ("Each macro has its own colour, and words state the situation").
- Over a goal the grains spill onto the rim and the table, and the line says how far over, never "done" ("Going over a goal is shown, never praised").
- In the evening the line says what still fits, and after the window the "What should I eat now?" button is gone ("In the evening the line says what still fits").

Preview: https://claude.ai/artifact/9k2b7KXfWeQyiQr6whyGHU

Outside the model but part of the work: the grains are drawn with the existing react-native-svg (no Skia, which would add about 2.9 MB to the first web load); DESIGN.md and the app tokens follow the new colours. The critique's plain defects (the dock below the fold on short screens, silent failures) keep existing promises and are fixed without a change.

## Open decisions

- Which plate: dark stoneware or light ceramic (see the plate rule).
- How far over the calorie goal counts as over (see the over rule).
- From what hour the evening wording starts (see the evening rule).
