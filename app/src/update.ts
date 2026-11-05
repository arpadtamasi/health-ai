// US-01m6p0kmp0aj2hyxnzehb7tx57 (Load the new version from the home-screen app) and BR-01m6p2r4vmgte1n2wkwjx0q28w (The app loads
// the newest version and the day when it comes back): when the app comes back to the front it loads the day again, or, when a newer
// version was published, that version, unless something would be lost by it (a message being typed, an open sheet, a write still
// waiting for the server). There is no button and no bar for it.

/** The build this bundle was made from; the deploy writes the same value into /version.json next to the page. Empty in development. */
export const BUILD: string = process.env.EXPO_PUBLIC_BUILD ?? "";

/** What would be lost by loading the page again right now. */
export interface Busy { typing: boolean; sheetOpen: boolean; writing: boolean }

export type ComeBack = "reload" | "load";

/** A newer build is published when the deploy's build differs from the running one; without either, nothing is known. */
export const isNewer = (running: string, published: string | null): boolean => !!running && !!published && running !== published;

/** EX-01m6p2r52g2z53nsyd9g8ney8y loads the new version; EX-01m6p2r597gw7850rrrcnnfhvx waits while a message is typed. */
export const onComeBack = (newer: boolean, busy: Busy): ComeBack =>
  newer && !busy.typing && !busy.sheetOpen && !busy.writing ? "reload" : "load";

/** The build the server now publishes, read past every cache; null when it cannot be read (offline, development). */
export async function publishedBuild(get: typeof fetch = fetch): Promise<string | null> {
  try {
    const r = await get(`/version.json?t=${Date.now()}`, { cache: "no-store" });
    if (!r.ok) return null;
    const j = (await r.json()) as { build?: unknown };
    return typeof j.build === "string" && j.build ? j.build : null;
  } catch { return null; }
}
