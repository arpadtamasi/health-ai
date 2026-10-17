// The words of the hero, from the judged state (see day.ts). Separate from the component so that they can be tested and translated.
import type { DayInput, Hero, Metric } from "./day.ts";
import { METRIC_EATEN, METRIC_GOAL } from "./day.ts";
import type { Texts } from "./i18n";

const metricLabel = (t: Texts, m: Metric) => ({ kcal: t.metricKcal, p: t.metricP, c: t.metricC, f: t.metricF, w: t.metricW })[m];

/** "1,3 l" for water, "190 kcal" for calories, "42 g" for the macros. */
export function amountText(m: Metric, n: number): string {
  if (m === "w") return `${(n / 1000).toFixed(1).replace(".", ",")} l`;
  return m === "kcal" ? `${n} kcal` : `${n} g`;
}

export function heroWords(h: Hero, d: DayInput, t: Texts): { big: string; text: string } {
  // The chart names the metric; the sentence only needs to when the figure is not calories.
  const label = h.metric === "kcal" ? "" : metricLabel(t, h.metric);
  const note = h.note ? (h.note.kind === "fatLeft" ? t.noteFatLeft(h.note.amount) : t.noteProteinBehind(h.note.amount)) : "";
  const join = (a: string) => (note ? `${a} ${note}` : a);
  switch (h.kind) {
    case "morning": return { big: t.heroMorning, text: t.heroMorningText(d.goals.calories) };
    case "start": return { big: t.heroStart, text: join(t.heroStartText(h.amount, d.goals.protein)) };
    case "under": return { big: t.heroUnder(label, amountText(h.metric, h.amount)), text: join(t.heroUnderText(label)) };
    case "ahead": return { big: t.heroAhead, text: join(t.heroAheadText(label, amountText(h.metric, h.amount))) };
    case "on": return { big: t.heroOn, text: join(t.heroOnText(label)) };
    case "done": return { big: t.heroDone, text: t.heroDoneText(h.amount) };
    case "fatLeft": return { big: t.heroFatLeft(h.amount), text: t.heroFatLeftText(METRIC_GOAL(d.goals, "f"), METRIC_EATEN(d.eaten, "f")) };
    case "fatOver": return { big: t.heroFatOver(h.amount), text: t.heroFatOverText(METRIC_GOAL(d.goals, "f")) };
  }
}
