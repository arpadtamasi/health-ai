// BR-01m6m4323nzt0ma6qf6j5a0yxa (Each macro has its own colour, and words state the situation): the line under the plate, from the
// judged state (see day.ts). A mark and a sentence say the situation; no colour does. Separate from the component so that the words
// can be tested and translated.
import type { DayInput, Hero, Metric } from "./day.ts";
import { METRIC_EATEN, METRIC_GOAL } from "./day.ts";
import type { Texts } from "./i18n";

export type Mark = "behind" | "ahead" | "on" | "done" | "none";
export interface Line { mark: Mark; text: string; sub: string }

const nf = (n: number) => Math.round(n).toLocaleString("hu-HU");
/** "1,3 l" for water, "1 300 kcal" for calories, "42 g" for the macros. */
export function amountText(m: Metric, n: number): string {
  if (m === "w") return `${(n / 1000).toFixed(1).replace(".", ",")} l`;
  return m === "kcal" ? `${nf(n)} kcal` : `${Math.round(n)} g`;
}
const nameOf = (t: Texts, m: Metric) => ({ kcal: "", p: t.nameP, c: t.nameC, f: t.nameF, w: t.nameW })[m];

export function lineWords(h: Hero, d: DayInput, t: Texts, planNow: number): Line {
  const label = nameOf(t, h.metric);
  const of = () => t.lineOf(amountText(h.metric, METRIC_EATEN(d.eaten, h.metric)), amountText(h.metric, METRIC_GOAL(d.goals, h.metric)));
  const note = h.note?.kind === "proteinBehind" ? t.noteProteinBehind(h.note.amount) : "";
  const kcal = h.metric === "kcal";
  switch (h.kind) {
    case "morning": return { mark: "none", text: t.lineMorning, sub: t.lineMorningSub(d.goals.calories, d.goals.protein) };
    case "start": return { mark: "on", text: t.lineStart, sub: t.lineStartSub(h.amount, d.goals.protein) };
    case "under": return { mark: "behind", text: t.lineUnder(label, amountText(h.metric, h.amount)), sub: kcal ? note || t.lineUnderSub(amountText("kcal", Math.round(planNow / 10) * 10)) : of() };
    case "ahead": return { mark: "ahead", text: t.lineAhead(label), sub: kcal ? [t.lineAheadSub(amountText("kcal", h.amount)), note].filter(Boolean).join(" ") : of() };
    case "on": return { mark: "on", text: t.lineOn(label), sub: kcal ? note || t.lineOnSub : of() };
    case "done": return { mark: "done", text: t.lineDone, sub: t.lineDoneSub(h.amount) };
    case "fatLeft": {
      const goal = METRIC_GOAL(d.goals, "f"), eaten = METRIC_EATEN(d.eaten, "f");
      return { mark: eaten / goal >= 0.85 ? "behind" : "on", text: t.lineFatLeft(h.amount), sub: t.lineFatLeftSub(goal, Math.round(eaten)) };
    }
    case "fatOver": return { mark: "behind", text: t.lineFatOver(h.amount), sub: t.lineFatOverSub(METRIC_GOAL(d.goals, "f")) };
    // BR-01m6nzdyz40bdbmtbn9ffze1v5: how far over, never "done".
    case "over": return { mark: "behind", text: t.lineOver(h.amount), sub: t.lineOverSub(h.overBy ?? []) };
    // BR-01m6nzdz57xbc4k501gg85aytx: what still fits, not how far under the plan.
    case "evening": return { mark: "on", text: t.lineEvening(h.amount), sub: t.lineEveningSub(h.note?.amount ?? 0) };
  }
}
