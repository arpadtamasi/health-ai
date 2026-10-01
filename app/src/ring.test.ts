import { test } from "node:test";
import assert from "node:assert/strict";
import { ringGeometry } from "./ring.ts";

// EX: The home shows the day's calories, carbs, protein and water as a full-screen picture.
test("the filled arc is the eaten share of the circle, never more than all of it", () => {
  const g = ringGeometry(100, 10, 0.25, 0.5);
  assert.equal(Math.round(g.dash), Math.round(g.circ / 4));
  assert.equal(ringGeometry(100, 10, 3, 0.5).dash, ringGeometry(100, 10, 1, 0.5).dash);
  assert.equal(ringGeometry(100, 10, -1, 0.5).dash, 0);
});

test("the plan tick sits at the top for 0, at the right for a quarter and at the bottom for half the day", () => {
  const top = ringGeometry(100, 10, 0, 0).tick;
  assert.ok(Math.abs(top.x1 - 50) < 1e-9 && top.y1 < 50 && top.y2 < top.y1);
  const right = ringGeometry(100, 10, 0, 0.25).tick;
  assert.ok(Math.abs(right.y1 - 50) < 1e-9 && right.x1 > 50);
  const bottom = ringGeometry(100, 10, 0, 0.5).tick;
  assert.ok(Math.abs(bottom.x1 - 50) < 1e-9 && bottom.y1 > 50);
});

test("the tick crosses the stroke: it starts inside the ring and ends outside it", () => {
  const g = ringGeometry(100, 10, 0, 0.5);
  const d = (x: number, y: number) => Math.hypot(x - g.mid, y - g.mid);
  assert.ok(d(g.tick.x1, g.tick.y1) < g.r && d(g.tick.x2, g.tick.y2) > g.r);
});
