// US-01m3rvr64zrzczabckjf6crb2z (pace) and the Status of "Open on a full-screen home that shows the day": the geometry of one ring,
// eaten against the goal, with a tick where the plan for this time of day stands (the same idea as the bar's tick).
export interface RingGeometry {
  r: number;
  mid: number;
  circ: number;
  /** Length of the filled arc. */
  dash: number;
  tick: { x1: number; y1: number; x2: number; y2: number };
}

/** `eaten` and `plan` are fractions of the goal (0 to 1); the ring starts at the top and runs clockwise. */
export function ringGeometry(size: number, stroke: number, eaten: number, plan: number): RingGeometry {
  const r = (size - stroke) / 2;
  const mid = size / 2;
  const circ = 2 * Math.PI * r;
  const angle = Math.min(1, Math.max(0, plan)) * 2 * Math.PI - Math.PI / 2;
  const len = stroke / 2 + 2;
  const at = (radius: number) => ({ x: mid + Math.cos(angle) * radius, y: mid + Math.sin(angle) * radius });
  const a = at(r - len);
  const b = at(r + len);
  return { r, mid, circ, dash: Math.min(1, Math.max(0, eaten)) * circ, tick: { x1: a.x, y1: a.y, x2: b.x, y2: b.y } };
}
