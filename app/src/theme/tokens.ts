// The one place that decides how the app looks: the "Paprika" direction of docs/designs/what-now-ui/tokens.js (tomato red, sunflower
// yellow, ink), on white with cool neutral greys (the cream paper of the first drawings felt old-fashioned), and a dark scheme that
// follows the phone's setting. Components read `tokens.color` while they render; `applyScheme` changes the values in place, so a
// re-render is all a scheme change needs (no remount, the conversation stays).
// Red is the brand and the "behind the plan" signal; yellow is "on track"; the dark "done" hero is the end of the day (BR "The hero's
// colour states the situation").
export interface Palette {
  primary: string; onPrimary: string;
  primaryContainer: string; onPrimaryContainer: string;
  surface: string; surfaceLow: string; surfaceHigh: string;
  onSurface: string; onSurfaceVariant: string; outline: string;
  good: string; goodText: string; warn: string; behind: string; error: string;
  /** The strong neutral: selection outlines, plan ticks, the end of a limit bar. */
  ink: string;
  /** The person's own message, and the hero once the day is done, with the text on them. */
  strong: string; onStrong: string;
  scrim: string;
}

export const LIGHT: Palette = {
  primary: "#d7331a", onPrimary: "#ffffff",
  primaryContainer: "#ffc21a", onPrimaryContainer: "#2a1c00",
  surface: "#ffffff", surfaceLow: "#f4f4f7", surfaceHigh: "#e8e8ed",
  onSurface: "#17151b", onSurfaceVariant: "#65636d", outline: "#dcdce3",
  good: "#10a34f", goodText: "#0b7a39", warn: "#b84a00", behind: "#ff8a00", error: "#c4261a",
  ink: "#17151b", strong: "#17151b", onStrong: "#ffffff", scrim: "#17151b66",
};

export const DARK: Palette = {
  primary: "#e8402a", onPrimary: "#ffffff",
  primaryContainer: "#ffc21a", onPrimaryContainer: "#2a1c00",
  surface: "#111014", surfaceLow: "#1c1a21", surfaceHigh: "#2a2830",
  onSurface: "#f3f1f6", onSurfaceVariant: "#aaa7b4", outline: "#3b3943",
  good: "#22c768", goodText: "#4ade80", warn: "#ff9d5c", behind: "#ff8a00", error: "#ff7a7a",
  ink: "#f3f1f6", strong: "#34323c", onStrong: "#f3f1f6", scrim: "#000000aa",
};

export type Scheme = "light" | "dark";

export const tokens = {
  color: { ...LIGHT } as Palette,
  radius: { card: 22, chip: 999, button: 999, bar: 6 },
  space: { xs: 4, s: 8, m: 12, l: 16, xl: 20 },
  /**
   * The type roles of the app, and the only sizes it uses: `hero` the one figure of the day; `title` sheet titles and the wordmark;
   * `card` the name and the price on a card; `body` the conversation, inputs and buttons; `meta` macros, bar labels, chips and notes;
   * `micro` the labels inside the chart. `display` is the landing page's headline only.
   */
  font: { micro: 12, meta: 14, body: 16, card: 17, title: 20, hero: 38, display: 40 },
  /** Figures line up in columns and do not jitter when they change. */
  numeric: { fontVariant: ["tabular-nums"] as "tabular-nums"[] },
  /** Loaded in App.tsx (expo-font); the names are the ones the @expo-google-fonts packages register. */
  face: {
    display: "BricolageGrotesque_800ExtraBold", displaySemi: "BricolageGrotesque_600SemiBold",
    body: "Figtree_400Regular", medium: "Figtree_500Medium", semi: "Figtree_600SemiBold", bold: "Figtree_700Bold",
  },
  size: { button: 48, touch: 44 },
} as const;

/** Switches the palette in place. Call it while rendering the root, before the children read the colours. */
export function applyScheme(scheme: Scheme): void {
  Object.assign(tokens.color, scheme === "dark" ? DARK : LIGHT);
  try { if (typeof document !== "undefined") document.body.style.backgroundColor = tokens.color.surface; } catch { /* not a browser */ }
}
