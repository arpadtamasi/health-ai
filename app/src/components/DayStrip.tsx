// US-01m3y1prs26ph5khvjnjsn0wx2 (See today's entries under the plate): everything logged today in a row, in time order, with the
// dot of its main macro, the time, a short name and its calories (or its amount of the chosen metric). A tap highlights its layers on
// the plate (EX-01m6m433e1t8zq2qycthkx9e6e) and offers its edit; an entry still saving is dimmed, one that failed is outlined. An entry
// that came from Google Health only is listed too, in its place in time (EX-01m3y1pve0wkbm75jfke81r9ve).
import { useEffect, useRef } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { DayEntry } from "../day";
import { minutesOf } from "../day";
import { mainOf, type Drawn } from "../plate";
import type { Texts } from "../i18n";
import { tokens as T } from "../theme/tokens";
import { colorOf } from "./Plate";

const hm = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
/** The part of a long entry name before its first bracket or comma, so that a chip stays a chip. */
export const shortName = (n: string) => (n.split(/ \(|, | \+ /)[0] ?? n).trim().slice(0, 24);

export function DayStrip({ entries, timeZone, metric, highlight, status, onTap, t, bare = false }:
  { entries: DayEntry[]; timeZone: string; metric: Drawn | "kcal"; highlight: string | null; status: Record<string, "pending" | "failed">; onTap: (e: DayEntry) => void; t: Texts; bare?: boolean }) {
  const c = T.color;
  const ref = useRef<ScrollView>(null);
  useEffect(() => { const id = setTimeout(() => ref.current?.scrollToEnd({ animated: false }), 60); return () => clearTimeout(id); }, [entries.length]);
  const meals = entries.filter((e) => e.kind === "meal").length, waters = entries.length - meals;
  const amount = (e: DayEntry) => {
    if (metric === "p" || metric === "c" || metric === "f") return e.kind === "water" ? "–" : `${{ p: e.protein, c: e.carbs, f: e.fat }[metric]} g`;
    if (metric === "w") return e.kind === "water" ? `${e.ml} ml` : "–";
    return e.kind === "water" ? `${e.ml} ml` : `${e.kcal}`;
  };
  return (
    <View style={{ gap: 8 }}>
      {/* A very short screen keeps the entries and gives the heading's line to the plate and the dock. */}
      {bare ? null : (
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingHorizontal: 20 }}>
          <Text style={{ fontFamily: T.face.displaySemi, fontSize: T.font.body, color: c.onSurface }}>{t.todayHead}</Text>
          {entries.length ? <Text style={{ ...T.type.micro, color: c.onSurfaceVariant, ...T.numeric }}>{t.todayCount(meals, waters)}</Text> : null}
        </View>
      )}
      <ScrollView ref={ref} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}>
        {entries.length ? entries.map((e) => {
          const s = status[e.id];
          const on = highlight === e.id;
          return (
            <Pressable key={e.id} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${hm(minutesOf(e.at, timeZone))} ${e.kind === "water" ? t.waterLabel : e.name}, ${amount(e)}`}
              disabled={s === "pending"} onPress={() => onTap(e)}
              style={{ flexDirection: "row", alignItems: "center", gap: 7, minHeight: 44, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1.5,
                borderColor: s === "failed" ? c.error : on ? c.ink : c.outline, backgroundColor: c.surface, opacity: s === "pending" ? 0.55 : 1 }}>
              <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: colorOf(mainOf(e)), borderWidth: 1, borderColor: c.grainEdge }} />
              <Text style={{ ...T.type.micro, color: c.onSurfaceVariant, ...T.numeric }}>{hm(minutesOf(e.at, timeZone))}</Text>
              <Text numberOfLines={1} style={{ ...T.type.micro, color: c.onSurface }}>{e.kind === "water" ? t.waterLabel : shortName(e.name)}</Text>
              <Text style={{ fontFamily: T.face.bold, fontSize: T.font.micro, color: c.onSurface, ...T.numeric }}>{s === "pending" ? "…" : amount(e)}</Text>
            </Pressable>
          );
        }) : (
          <View style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: 12, borderRadius: 12, borderWidth: 1.5, borderStyle: "dashed", borderColor: c.outline }}>
            <Text style={{ ...T.type.micro, color: c.onSurfaceVariant }}>{t.todayEmpty}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
