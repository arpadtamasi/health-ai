// BR-01m6ph6dq7aszxhxgzz4kgr8d4 (The conversation keeps what happened in it): the conversation starts a new page each day, when the
// diary's day changes in the person's time zone. Earlier days are not shown, the assistant is given only today's turns, and a page
// open when the day changes stays until the app comes back to the front (EX-01m6py99nbp6t6ctsbpzh6q29y).

/** The diary's day of a moment, as YYYY-MM-DD in the person's time zone. */
export const dayOf = (at: number, timeZone: string): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(at));

/** Only the turns written on the same day as `now`. */
export const todaysTurns = <T extends { at: number }>(turns: T[], timeZone: string, now: number): T[] => {
  const today = dayOf(now, timeZone);
  return turns.filter((t) => dayOf(t.at, timeZone) === today);
};

/** The page was opened on another day than today: the next time the app comes back, it starts a new page. */
export const isNewDay = (pageDay: string, timeZone: string, now: number): boolean => pageDay !== dayOf(now, timeZone);
