import { test } from "node:test";
import assert from "node:assert/strict";
import { blocksOf, spansOf } from "./rich.ts";

// BR-01m6ph6dq7aszxhxgzz4kgr8d4: the reply is shown with its formatting, the way a chat app shows it.
test("bold, paragraphs and both kinds of list are read from the reply", () => {
  const b = blocksOf("**Beírtam.** Ezzel 1140 kcal-nál jársz.\nVacsorára:\n- túró tojással\n- csirkemell\n\n1. első\n2) második");
  assert.deepEqual(b[0], { kind: "p", spans: [{ text: "Beírtam.", bold: true }, { text: " Ezzel 1140 kcal-nál jársz. Vacsorára:", bold: false }] });
  assert.deepEqual(b.slice(1).map((x) => (x.kind === "li" ? `${x.mark} ${x.spans.map((s) => s.text).join("")}` : "p")), ["• túró tojással", "• csirkemell", "1. első", "2. második"]);
});

test("an unmatched ** stays as written", () => {
  assert.deepEqual(spansOf("2**3 = 8"), [{ text: "2**3 = 8", bold: false }]);
});
