// Design tokens: the one place to change the look. Every component reads from here.
// Variant "Paprika": market-stall warm. Tomato red and sunflower yellow, ink text, warm neutral paper. Flat, no gradients, no pastels.
module.exports = {
  color: {
    primary: "#d7331a", onPrimary: "#ffffff",
    primaryGradient: "#d7331a", // token name kept for components; solid on purpose
    primaryContainer: "#ffc21a", onPrimaryContainer: "#2a1c00",
    secondaryContainer: "#1f1a17", onSecondaryContainer: "#ffffff",
    surface: "#ffffff", surfaceLow: "#f6f2ec", surfaceHigh: "#ebe4da",
    onSurface: "#1f1a17", onSurfaceVariant: "#6b6158", outline: "#ddd4c8",
    good: "#10a34f", goodContainer: "#10a34f",
    warn: "#b84a00", warnContainer: "#ffc21a", onWarnContainer: "#2a1c00",
    behind: "#ff8a00",
    error: "#c4261a", errorContainer: "#ffd9d2",
  },
  style: { titleWeight: 800, nameWeight: 700, appBarSize: 20, titleTracking: "-0.02em", barH: 7,
    rankTopBg: "#ffc21a", onRankTop: "#2a1c00", overlineWeight: 700, overlineTracking: "1px" },
  radius: { card: 22, chip: 999, button: 999, badge: 12, bar: 4 },
  space: { xs: 4, s: 8, m: 12, l: 16, xl: 20 },
  font: { url: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Figtree:wght@400;500;600;700&display=block",
    family: 'Figtree, system-ui, sans-serif', display: '"Bricolage Grotesque", Figtree, sans-serif', overline: 12, body: 14, base: 16, title: 22, display: 40 },
  // Food icons: the model picks one category per food when it is created; the design maps category to icon here.
  // Swap this table (or the FoodIcon component) to change the icon set; the categories stay the same.
  icons: { fruit: "apple", vegetable: "carrot", bread: "croissant", grain: "wheat", meat: "drumstick", fish: "fish", egg: "egg", dairy: "milk", sweet: "candy",
    drink: "cup-soda", water: "glass-water", coffee: "coffee", soup: "soup", salad: "salad", snack: "popcorn", other: "utensils" },
  size: { screenW: 390, screenH: 844, button: 48, touch: 44 },
};
