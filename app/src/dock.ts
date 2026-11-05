// BR-01m6ph6dgw3qxzxjjy1sh3t0yz (The dock's switch says whether a message is what was eaten or what to eat) and
// BR-01m6ph6dq7aszxhxgzz4kgr8d4 (The conversation keeps what happened in it): the small decisions behind the dock and the chat.

export type Side = "ate" | "would";
export type DockMode = "home" | "talk" | "whatnow";

/** The switch is on the home's dock, and stays while the person types from it; the conversation opened by its own button has none.
 * After the eating window there is nothing to ask for (EX-01m6nzdzz3r239egz1c4s68a98). */
export const switchShown = (o: { ready: boolean; afterWindow: boolean; mode: DockMode; armed: boolean }): boolean =>
  o.ready && !o.afterWindow && (o.mode === "home" || (o.mode === "talk" && o.armed));

/** The side a message is sent with: none without the switch, and always "ate" after the window. */
export const intentOf = (shown: boolean, side: Side): Side | undefined => (shown ? side : undefined);

/** The side to start on: the one used last, "ate" the first time (EX-01m6ph6ey8cbd7wre1703xhe7a). */
export const startSide = (saved: unknown): Side => (saved === "would" ? "would" : "ate");

/** A photo is seen with its message and the next two (EX-01m6ph6eawez8cc1g4kd33xszg): which earlier user messages, by index,
 * bring their photos along with the message being sent. `users` are the indexes of the earlier user messages, oldest first. */
export const PHOTO_TURNS = 2;
export const photoTurns = (users: number[]): Set<number> => new Set(users.slice(-PHOTO_TURNS));

/** A failed reply offers "Újra" unless sending again cannot help (the daily limit). */
export const canSendAgain = (code: string | undefined): boolean => code !== "daily_limit";

/** What is left of today, per goal: the calories and each macro's grams still to eat. */
export interface Left { calories: number; protein: number; carbs: number; fat: number }
type Macro = "protein" | "carbs" | "fat";
export const ENNEK_CHIPS = 4;

/** The macro furthest behind, measured against its own goal; none when every macro is met. */
export function largestGap(left: Left, goals: Left): Macro | null {
  const ms: Macro[] = ["protein", "carbs", "fat"];
  const share = (m: Macro) => (goals[m] > 0 ? Math.max(0, left[m]) / goals[m] : 0);
  const best = ms.reduce((a, b) => (share(b) > share(a) ? b : a));
  return share(best) > 0 ? best : null;
}

/** EX-01m6pvfvzzq4vs1pfhdczn9kx4 (Ennék offers the usual foods that fit now): up to four usual foods within the calories left,
 * the one that closes most of the largest gap first, worked out here without a model call; none when none fits
 * (EX-01m6pvfw80s18pn0szqydw2dn7). Water is not a food to suggest. */
export function fittingUsuals<U extends { kind: "meal" | "water"; kcal: number; protein: number; carbs: number; fat: number; count: number }>(
  usuals: U[], left: Left, goals: Left): U[] {
  const gap = largestGap(left, goals);
  const closes = (u: U) => (gap ? Math.min(u[gap], Math.max(0, left[gap])) : 0);
  return usuals
    .filter((u) => u.kind === "meal" && u.kcal > 0 && u.kcal <= left.calories)
    .sort((a, b) => closes(b) - closes(a) || b.count - a.count)
    .slice(0, ENNEK_CHIPS);
}
