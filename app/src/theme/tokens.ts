// The one place that decides how the app looks: the "Terített asztal" direction of change home-plate-and-glass (a table seen from
// above), with the grains of change grains-on-the-plate. A tablecloth ground, a dark stoneware plate, ceramic sheets, the colours of
// the foods for each macro and blue for water (BR
// BR-01m6m4323nzt0ma6qf6j5a0yxa "Each macro has its own colour, and words state the situation": no element changes colour to state
// the situation), deep green for actions. A dark scheme follows the phone's setting. Components read `tokens.color` while they
// render; `applyScheme` changes the values in place, so a re-render is all a scheme change needs (no remount, the conversation stays).
export interface Palette {
  /** Actions: the camera, Send, the filled button. */
  primary: string; onPrimary: string;
  /** A quiet action: a selected chip, the outlined "What should I eat now?". */
  primaryContainer: string; onPrimaryContainer: string;
  /** The tablecloth (the page), the ceramic (plate, sheets, dock), the empty well of a third. */
  table: string; surface: string; surfaceLow: string; surfaceHigh: string;
  plate: string; plateEdge: string; well: string; shadow: string;
  onSurface: string; onSurfaceVariant: string; outline: string;
  /** The macros and water: the colours of their foods (lentils, rice, pumpkin seeds), never states; the second of each is the
   * shade of every other entry, `grainEdge` the thin edge that keeps cream rice visible. */
  protein: string; carbs: string; fat: string; water: string;
  protein2: string; carbs2: string; fat2: string; grainEdge: string;
  /** The stoneware plate: an object, the same in light and dark mode (BR-01m6m432cqp8fkhggthg8a6720). */
  stone: string; stone2: string; stoneWell: string; stoneRidge: string; stoneShadow: string; speck: string; stoneInk: string; stoneMuted: string; stonePlan: string;
  /** States in words and marks: done or on the plan, under the plan or near the cap, a failure. */
  good: string; goodText: string; warn: string; error: string;
  /** The strong neutral: outlines of the chosen part, the plan arc, the cap of the fat third. */
  ink: string;
  /** The person's own message, with the text on it. */
  strong: string; onStrong: string;
  scrim: string;
}

export const LIGHT: Palette = {
  primary: "#1d5c4d", onPrimary: "#ffffff",
  primaryContainer: "#d8e9e0", onPrimaryContainer: "#0e3a30",
  table: "#e4eae1", surface: "#fbfcfa", surfaceLow: "#f1f4ef", surfaceHigh: "#e6ebe4",
  plate: "#ffffff", plateEdge: "#e9ede6", well: "#f1f4ef", shadow: "rgba(28, 48, 36, 0.14)",
  onSurface: "#17201b", onSurfaceVariant: "#59675f", outline: "#d2dacf",
  protein: "#e07a4f", carbs: "#f1e8d3", fat: "#7f9e47", water: "#3a87d0",
  protein2: "#c9643b", carbs2: "#e2d4b2", fat2: "#66843a", grainEdge: "rgba(70, 52, 30, 0.38)",
  stone: "#3b403d", stone2: "#2c302e", stoneWell: "#333835", stoneRidge: "#454b48", stoneShadow: "rgba(0, 0, 0, 0.5)", speck: "#9aa39d",
  stoneInk: "#f1eee6", stoneMuted: "#b7bdb8", stonePlan: "rgba(241, 238, 230, 0.62)",
  good: "#1e6c42", goodText: "#1e6c42", warn: "#b04314", error: "#b3261e",
  ink: "#17201b", strong: "#1d5c4d", onStrong: "#ffffff", scrim: "#17201b66",
};

export const DARK: Palette = {
  primary: "#86d4b9", onPrimary: "#0b2a21",
  primaryContainer: "#24453b", onPrimaryContainer: "#cdeee1",
  table: "#151c18", surface: "#1d2621", surfaceLow: "#232d28", surfaceHigh: "#2b3530",
  plate: "#242e29", plateEdge: "#2f3a34", well: "#1b231f", shadow: "rgba(0, 0, 0, 0.5)",
  onSurface: "#edf3ee", onSurfaceVariant: "#a0b1a7", outline: "#34413a",
  protein: "#e07a4f", carbs: "#f1e8d3", fat: "#7f9e47", water: "#63a9ec",
  protein2: "#c9643b", carbs2: "#e2d4b2", fat2: "#66843a", grainEdge: "rgba(70, 52, 30, 0.38)",
  stone: "#3b403d", stone2: "#2c302e", stoneWell: "#333835", stoneRidge: "#454b48", stoneShadow: "rgba(0, 0, 0, 0.5)", speck: "#9aa39d",
  stoneInk: "#f1eee6", stoneMuted: "#b7bdb8", stonePlan: "rgba(241, 238, 230, 0.62)",
  good: "#74d59d", goodText: "#74d59d", warn: "#ff9b68", error: "#ff8a80",
  ink: "#edf3ee", strong: "#2f6b5b", onStrong: "#edf3ee", scrim: "#000000aa",
};

export type Scheme = "light" | "dark";

export const tokens = {
  color: { ...LIGHT } as Palette,
  radius: { card: 22, chip: 999, button: 999, bar: 6, sheet: 26 },
  space: { xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 24 },
  /**
   * The type roles of the app, and the only sizes it uses: `title` sheet titles and the wordmark; `line` the sentence under the plate;
   * `card` names on a card; `body` the conversation, inputs and buttons; `meta` figures, chips and notes; `micro` small labels.
   * `display` is the landing page's headline only.
   */
  font: { micro: 13, meta: 14, body: 16, card: 17, line: 19, title: 20, display: 40 },
  /** Figures line up in columns and do not jitter when they change. */
  numeric: { fontVariant: ["tabular-nums"] as "tabular-nums"[] },
  /** Loaded in App.tsx (expo-font); the names are the ones the @expo-google-fonts packages register. */
  face: {
    display: "Gabarito_800ExtraBold", displaySemi: "Gabarito_600SemiBold",
    body: "Figtree_400Regular", medium: "Figtree_500Medium", semi: "Figtree_600SemiBold", bold: "Figtree_700Bold",
  },
  size: { button: 48, touch: 44 },
} as const;

/** Switches the palette in place. Call it while rendering the root, before the children read the colours. */
export function applyScheme(scheme: Scheme): void {
  Object.assign(tokens.color, scheme === "dark" ? DARK : LIGHT);
  try { if (typeof document !== "undefined") document.body.style.backgroundColor = tokens.color.table; } catch { /* not a browser */ }
}
