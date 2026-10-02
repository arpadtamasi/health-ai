// The one place that decides how the app looks: the "Paprika" direction of docs/designs/what-now-ui/tokens.js (tomato red, sunflower
// yellow, ink on warm paper). Components read only from this file. Red is the brand and the "behind the plan" signal; yellow is
// "on track"; ink is "the day is done" (BR "The hero's colour states the situation").
export const tokens = {
  color: {
    primary: "#d7331a", onPrimary: "#ffffff",
    primaryContainer: "#ffc21a", onPrimaryContainer: "#2a1c00",
    secondaryContainer: "#1f1a17", onSecondaryContainer: "#ffffff",
    surface: "#ffffff", surfaceLow: "#f6f2ec", surfaceHigh: "#ebe4da",
    onSurface: "#1f1a17", onSurfaceVariant: "#6b6158", outline: "#ddd4c8",
    good: "#10a34f", goodText: "#0b7a39", warn: "#b84a00", behind: "#ff8a00", error: "#c4261a",
    ink: "#1f1a17",
  },
  radius: { card: 22, chip: 999, button: 999, bar: 6 },
  space: { xs: 4, s: 8, m: 12, l: 16, xl: 20 },
  font: { overline: 12, body: 14, base: 16, title: 22 },
  /** Loaded in App.tsx (expo-font); the names are the ones the @expo-google-fonts packages register. */
  face: {
    display: "BricolageGrotesque_800ExtraBold", displaySemi: "BricolageGrotesque_600SemiBold",
    body: "Figtree_400Regular", medium: "Figtree_500Medium", semi: "Figtree_600SemiBold", bold: "Figtree_700Bold",
  },
  size: { button: 48, touch: 44 },
} as const;
