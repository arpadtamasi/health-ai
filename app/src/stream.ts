// BR-01m6pmf9avbbgd373z1jcvvaqw (A reply arrives as it is written, with its steps): what the streamed chat sends, read into what the
// screen draws. The server sends one JSON object a line: a step that starts or ends, a piece of text, the text set anew (a claim
// it dropped), a card or a sheet as soon as it exists, and finally the whole reply.

export interface Step { id: string; tool: string; detail?: string; done: boolean }

export type StreamLine =
  | { type: "step"; id: string; tool: string; detail?: string; state: "start" | "done" }
  | { type: "delta"; text: string }
  | { type: "text_set"; text: string }
  | { type: "event"; event: { type: string } & Record<string, unknown> }
  | { type: "done"; reply: unknown }
  | { type: "error"; status: number; error?: string };

/** The reply as it stands: its steps in order, its text so far, and the cards and sheets it made. */
export interface Live { steps: Step[]; text: string; events: ({ type: string } & Record<string, unknown>)[] }

export const emptyLive = (): Live => ({ steps: [], text: "", events: [] });

export function applyLine(s: Live, l: StreamLine): Live {
  switch (l.type) {
    case "step": {
      const at = s.steps.findIndex((x) => x.id === l.id);
      const step: Step = { id: l.id, tool: l.tool, ...(l.detail ? { detail: l.detail } : {}), done: l.state === "done" };
      return { ...s, steps: at < 0 ? [...s.steps, step] : s.steps.map((x, i) => (i === at ? step : x)) };
    }
    case "delta": return { ...s, text: s.text + l.text };
    case "text_set": return { ...s, text: l.text };
    case "event": return { ...s, events: [...s.events, l.event] };
    default: return s;
  }
}

/** Splits what arrives into whole lines; a line cut between two chunks waits for the rest. */
export function lineReader(): (chunk: string) => StreamLine[] {
  let rest = "";
  return (chunk) => {
    rest += chunk;
    const parts = rest.split("\n");
    rest = parts.pop() ?? "";
    return parts.filter((p) => p.trim()).flatMap((p) => { try { return [JSON.parse(p) as StreamLine]; } catch { return []; } });
  };
}

/** The words of each step, in the person's language. */
export interface StepWords { photo: string; today: string; log: (d?: string) => string; water: (d?: string) => string; options: string; update: (d?: string) => string; entries: string; delete: string; settings: string; estimate: string; other: string }

export function stepLabel(w: StepWords, s: Pick<Step, "tool" | "detail">): string {
  switch (s.tool) {
    case "photo": return w.photo;
    case "get_today": return w.today;
    case "log_meal": return w.log(s.detail);
    case "log_water": return w.water(s.detail);
    case "suggest_options": return w.options;
    case "update_entry": return w.update(s.detail);
    case "list_entries": return w.entries;
    case "request_delete": return w.delete;
    case "save_settings": return w.settings;
    case "estimate_calories": return w.estimate;
    default: return w.other;
  }
}

/** The quiet line a finished reply's steps fold into: each step once, in order. */
export const stepSummary = (w: StepWords, steps: Step[]): string => [...new Set(steps.map((s) => stepLabel(w, s)))].join(" · ");
