import { test } from "node:test";
import assert from "node:assert/strict";
import { applyLine, emptyLive, lineReader, stepLabel, stepSummary, type StepWords, type StreamLine } from "./stream.ts";

const w: StepWords = {
  photo: "Megnézem a képet", today: "Megnézem a mai napot", log: (d) => `Beírom: ${d ?? "étel"}`, water: (d) => `Beírom: ${d ?? ""} víz`,
  options: "Ajánlatot keresek", update: (d) => `Átírom: ${d ?? ""}`, entries: "Megnézem a bejegyzéseket", delete: "Előkészítem a törlést",
  settings: "Elmentem a beállítást", estimate: "Kiszámolom a célt", other: "Dolgozom",
};

// EX-01m6pmf9repmym9yf87emkrjph (A photo reply shows its steps before its words): steps in order, ticked when done, the card as soon
// as it is logged, then the text growing as it arrives.
test("a photo reply builds up as its lines arrive", () => {
  const lines: StreamLine[] = [
    { type: "step", id: "photo", tool: "photo", state: "start" },
    { type: "step", id: "photo", tool: "photo", state: "done" },
    { type: "step", id: "t1", tool: "log_meal", detail: "ropa vieja, fél adag", state: "start" },
    { type: "event", event: { type: "logged", id: "e1", name: "Ropa vieja", kcal: 480 } },
    { type: "step", id: "t1", tool: "log_meal", detail: "ropa vieja, fél adag", state: "done" },
    { type: "delta", text: "Beírtam " }, { type: "delta", text: "fél adagot." },
  ];
  const live = lines.reduce(applyLine, emptyLive());
  assert.deepEqual(live.steps.map((s) => [stepLabel(w, s), s.done]), [["Megnézem a képet", true], ["Beírom: ropa vieja, fél adag", true]]);
  assert.equal(live.events[0]!.type, "logged");
  assert.equal(live.text, "Beírtam fél adagot.");
  assert.equal(stepSummary(w, live.steps), "Megnézem a képet · Beírom: ropa vieja, fél adag");
});

test("a claim the server dropped is taken back", () => {
  const live = [{ type: "delta", text: "Felírtam." }, { type: "text_set", text: "" }, { type: "delta", text: "Kész." }].reduce((s, l) => applyLine(s, l as StreamLine), emptyLive());
  assert.equal(live.text, "Kész.");
});

test("lines cut between two chunks are read whole", () => {
  const read = lineReader();
  assert.deepEqual(read('{"type":"delta","te'), []);
  assert.deepEqual(read('xt":"a"}\n{"type":"delta","text":"b"}\n'), [{ type: "delta", text: "a" }, { type: "delta", text: "b" }]);
  assert.deepEqual(read("not json\n"), []);
});
