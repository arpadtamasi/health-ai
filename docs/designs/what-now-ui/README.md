# What now: UI design kit

Screens are composed only from components, and components read only from tokens.

- `tokens.js`: colors, radii, spacing, fonts, sizes. Change the look here.
- `components.js`: AppBar, Card, Button, Chip, PaceRow, OptionCard, RankBadge, Banner, ListItem, Viewfinder, Input, FoodIcon, ChatBubble, ChatInput, Stack, Row.
  Food icons: Lucide line icons (`food-icons.js`, ISC). The model picks one of 16 categories per food when it is created (`tokens.js` `icons`), the design maps category to icon.
  The Expo build should use the same component names and props.
- `screens.js`: the five screens (home, capture options, what now, chat onboarding, limit reached).
- `build.js`: `node build.js` renders `screens/*.html` and `.png` with headless Chrome.

Direction: "Paprika" (tomato red, sunflower yellow, ink on warm neutral). Earlier directions: `../what-now-ui-variants/`.

To try another look, edit `tokens.js` (or one component) and run `node build.js`; every screen updates.
All values on the screens are samples, not real data.
