// US "See today's entries in the thread": one logged meal or drink as a card. A fresh one (just logged) also shows Edit and Undo
// (US "Correct a logged meal"); tapping any of our own meals opens the edit sheet.
import { Pressable, Text, View } from "react-native";
import type { DayEntry } from "../day";
import { minutesOf } from "../day";
import type { Texts } from "../i18n";
import { tokens as T } from "../theme/tokens";
import { Chip } from "./ui";

const c = T.color;
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export function EntryCard({ entry, timeZone, t, fresh, note, status, onEdit, onUndo, onRetry }:
  { entry: DayEntry; timeZone: string; t: Texts; fresh: boolean; note?: string | undefined; status?: "pending" | "failed" | undefined; onEdit: (e: DayEntry) => void; onUndo: (e: DayEntry) => void; onRetry?: ((e: DayEntry, again: boolean) => void) | undefined }) {
  const water = entry.kind === "water";
  const own = entry.source !== "google" && !status;
  const meta = [entry.estimate && !water ? t.estimateTag : "", !own && !status ? t.threadGoogle : "", hhmm(minutesOf(entry.at, timeZone))].filter(Boolean).join(" · ");
  return (
    <Pressable accessibilityRole={own && !water ? "button" : "text"} accessibilityLabel={`${entry.name}`} disabled={!own || water} onPress={() => onEdit(entry)}
      style={{ backgroundColor: c.surfaceLow, borderRadius: T.radius.card, padding: 14, borderWidth: 2, borderColor: status === "failed" ? c.error : fresh ? c.ink : "transparent", opacity: status === "pending" ? 0.65 : 1 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <Text style={{ flex: 1, fontFamily: T.face.display, fontSize: T.font.card, letterSpacing: -0.3, color: c.onSurface }}>{water ? t.waterLabel : entry.name}</Text>
        <Text style={{ fontFamily: T.face.display, fontSize: T.font.card, color: c.onSurface, ...T.numeric }}>{water ? `${entry.ml} ml` : `${entry.kcal} kcal`}</Text>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 2 }}>
        <Text style={{ flexShrink: 1, fontFamily: T.face.body, fontSize: T.font.meta, lineHeight: 20, color: c.onSurfaceVariant, ...T.numeric }}>{water ? "" : t.macroLine(entry.protein, entry.carbs, entry.fat)}</Text>
        <Text style={{ fontFamily: T.face.body, fontSize: T.font.meta, lineHeight: 20, color: c.onSurfaceVariant, ...T.numeric }}>{meta}</Text>
      </View>
      {status === "pending" ? <Text style={{ fontFamily: T.face.semi, fontSize: T.font.meta, color: c.onSurfaceVariant, marginTop: 4 }}>{t.pendingSaving}</Text> : null}
      {status === "failed" ? (
        <View style={{ marginTop: 6 }}>
          <Text style={{ fontFamily: T.face.bold, fontSize: T.font.meta, color: c.error }}>{t.failedSave}</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}><Chip label={t.retry} selected onPress={() => onRetry?.(entry, true)} /><Chip label={t.discard} onPress={() => onRetry?.(entry, false)} /></View>
        </View>
      ) : null}
      {note ? <Text style={{ fontFamily: T.face.bold, fontSize: T.font.meta, color: c.goodText, marginTop: 4 }}>{note}</Text> : null}
      {fresh && own ? (
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          {!water ? <Chip label={t.cardEdit} selected onPress={() => onEdit(entry)} /> : <View />}
          <Pressable accessibilityRole="button" onPress={() => onUndo(entry)} style={{ minHeight: T.size.touch, justifyContent: "center", paddingHorizontal: 4 }}>
            <Text style={{ fontFamily: T.face.semi, fontSize: T.font.meta, color: c.onSurfaceVariant }}>{t.cardUndo}</Text>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}
