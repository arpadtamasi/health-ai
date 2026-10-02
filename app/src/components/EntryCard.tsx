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

export function EntryCard({ entry, timeZone, t, fresh, note, onEdit, onUndo }:
  { entry: DayEntry; timeZone: string; t: Texts; fresh: boolean; note?: string | undefined; onEdit: (e: DayEntry) => void; onUndo: (e: DayEntry) => void }) {
  const water = entry.kind === "water";
  const own = entry.source !== "google";
  const meta = [hhmm(minutesOf(entry.at, timeZone)), entry.estimate && !water ? t.estimateTag : "", !own ? t.threadGoogle : ""].filter(Boolean).join(" · ");
  return (
    <Pressable accessibilityRole={own && !water ? "button" : "text"} accessibilityLabel={`${entry.name}`} disabled={!own || water} onPress={() => onEdit(entry)}
      style={{ backgroundColor: c.surfaceLow, borderRadius: T.radius.card, padding: 14, borderWidth: 2, borderColor: fresh ? c.ink : "transparent" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <Text style={{ flex: 1, fontFamily: T.face.display, fontSize: 17, letterSpacing: -0.3, color: c.onSurface }}>{water ? t.waterLabel : entry.name}</Text>
        <Text style={{ fontFamily: T.face.display, fontSize: 17, color: c.onSurface }}>{water ? `${entry.ml} ml` : `${entry.kcal} kcal`}</Text>
      </View>
      <Text style={{ fontFamily: T.face.body, fontSize: T.font.body, color: c.onSurfaceVariant, marginTop: 2 }}>
        {water ? meta : `${t.macroLine(entry.protein, entry.carbs, entry.fat)}\n${meta}`}
      </Text>
      {note ? <Text style={{ fontFamily: T.face.bold, fontSize: T.font.body, color: c.goodText, marginTop: 4 }}>{note}</Text> : null}
      {fresh && own ? (
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          {!water ? <Chip label={t.cardEdit} selected onPress={() => onEdit(entry)} /> : <View />}
          <Pressable accessibilityRole="button" onPress={() => onUndo(entry)} style={{ minHeight: T.size.touch, justifyContent: "center", paddingHorizontal: 4 }}>
            <Text style={{ fontFamily: T.face.semi, fontSize: T.font.body, color: c.onSurfaceVariant }}>{t.cardUndo}</Text>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}
