// US-01m3rvr64zrzczabckjf6crb2z (See where I am against the day's pace): the daily goal is spread evenly over the
// waking window the user sets; the pace gap is eaten minus the planned amount for this time of day.
export interface Window {
  startHour: number; // e.g. 7
  endHour: number; // e.g. 22
}

/** Share of the day that has passed, 0 before the window starts and 1 after it ends. */
export function dayFraction(minutesSinceMidnight: number, w: Window): number {
  const start = w.startHour * 60;
  const end = w.endHour * 60;
  if (end <= start) throw new Error("The window must end after it starts.");
  return Math.min(1, Math.max(0, (minutesSinceMidnight - start) / (end - start)));
}

export interface PaceResult {
  planned: number; // amount planned by now, rounded
  eaten: number;
  gap: number; // eaten - planned; negative means behind the plan
  behind: boolean;
  planFraction: number; // 0..1, where the plan tick sits on the bar
  eatenFraction: number; // 0..1, how much of the daily goal is eaten
}

export function pace(goal: number, eaten: number, minutesSinceMidnight: number, w: Window): PaceResult {
  const planFraction = dayFraction(minutesSinceMidnight, w);
  const planned = Math.round(goal * planFraction);
  const gap = Math.round(eaten) - planned;
  return { planned, eaten: Math.round(eaten), gap, behind: gap < 0, planFraction, eatenFraction: goal > 0 ? Math.min(1, eaten / goal) : 0 };
}
