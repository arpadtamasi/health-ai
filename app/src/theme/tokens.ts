// The one place that decides how the app looks. Same shape as docs/designs/what-now-ui/tokens.js:
// when the design variant is chosen, paste its tokens here. Components read only from this file.
export const tokens = {
  color: {
    primary: "#6c3cf0", onPrimary: "#ffffff",
    primaryContainer: "#ffd23f", onPrimaryContainer: "#2b1d00",
    secondaryContainer: "#ff3d8b", onSecondaryContainer: "#ffffff",
    surface: "#ffffff", surfaceLow: "#f4f4f8", surfaceHigh: "#e8e8ef",
    onSurface: "#15122b", onSurfaceVariant: "#5d5a75", outline: "#d6d6e0",
    good: "#00c896", warn: "#ff5a00", behind: "#ff7a00", error: "#e0245e",
  },
  radius: { card: 20, chip: 10, button: 24, bar: 4 },
  space: { xs: 4, s: 8, m: 12, l: 16, xl: 20 },
  font: { overline: 12, body: 14, base: 16, title: 22 },
  size: { button: 48, touch: 44 },
} as const;

// Food icons: the model picks one category per food; this table maps it to an icon. Swap the table to change the set.
export const foodIcons = {
  fruit: "🍎", vegetable: "🥦", bread: "🍞", grain: "🍚", meat: "🍗", fish: "🐟", egg: "🥚", dairy: "🥛", sweet: "🍫",
  drink: "🥤", water: "💧", coffee: "☕", soup: "🍲", salad: "🥗", snack: "🥨", other: "🍽️",
} as const;

export type FoodCategory = keyof typeof foodIcons;
