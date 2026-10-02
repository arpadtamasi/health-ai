// US "Correct a logged meal": the edit sheet of a card. The portion scales the entry's numbers, the time and the meal type can be
// fixed, the name renamed; saving changes the same entry (no second one), deleting asks nothing more because the person tapped it.
import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import type { DayEntry } from "../day";
import { minutesOf } from "../day";
import type { Texts } from "../i18n";
import type { EntryPatch } from "../api/client";
import { tokens as T } from "../theme/tokens";
import { Button, Chip } from "./ui";

const c = T.color;
const TYPES = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"] as const;
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const scale = (n: number, f: number) => Math.round(n * f);

export function EditSheet({ entry, timeZone, t, onSave, onDelete, onClose }:
  { entry: DayEntry; timeZone: string; t: Texts; onSave: (patch: EntryPatch) => void; onDelete: (e: DayEntry) => void; onClose: () => void }) {
  const [name, setName] = useState(entry.name);
  const [pct, setPct] = useState(100);
  const [time, setTime] = useState(hhmm(minutesOf(entry.at, timeZone)));
  const [type, setType] = useState<(typeof TYPES)[number] | undefined>((TYPES as readonly string[]).includes(entry.mealType ?? "") ? (entry.mealType as (typeof TYPES)[number]) : undefined);
  const f = pct / 100;
  const timeOk = /^\d{1,2}:\d{2}$/.test(time);
  const save = () => {
    const patch: EntryPatch = { id: entry.id };
    if (name.trim() && name.trim() !== entry.name) patch.name = name.trim();
    if (pct !== 100) Object.assign(patch, { kcal: scale(entry.kcal, f), carbs: scale(entry.carbs, f), protein: scale(entry.protein, f), fat: scale(entry.fat, f) });
    if (timeOk && time !== hhmm(minutesOf(entry.at, timeZone))) patch.time = time;
    if (type && type !== entry.mealType) patch.mealType = type;
    onSave(patch);
  };
  const step = (d: number) => setPct((p) => Math.min(300, Math.max(10, p + d)));
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel={t.cancel} onPress={onClose} style={{ flex: 1, backgroundColor: c.scrim, justifyContent: "flex-end" }}>
        <Pressable onPress={() => undefined} style={{ backgroundColor: c.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 28, gap: 10, alignSelf: "center", width: "100%", maxWidth: 480 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
            <Text style={{ fontFamily: T.face.display, fontSize: 20, letterSpacing: -0.4, color: c.onSurface }}>{t.editTitle}</Text>
            <Text style={{ fontFamily: T.face.display, fontSize: 17, color: c.onSurface }}>{scale(entry.kcal, f)} kcal</Text>
          </View>
          <Text style={{ fontFamily: T.face.body, fontSize: T.font.body, color: c.onSurfaceVariant }}>{t.macroLine(scale(entry.protein, f), scale(entry.carbs, f), scale(entry.fat, f))}</Text>
          <Row label={t.editName}>
            <TextInput value={name} onChangeText={setName} accessibilityLabel={t.editName} style={{ flex: 1, textAlign: "right", fontFamily: T.face.semi, fontSize: T.font.base, color: c.onSurface, minHeight: 36 }} />
          </Row>
          <Row label={t.editPortion}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Round label="−" onPress={() => step(-10)} />
              <Text style={{ fontFamily: T.face.bold, fontSize: T.font.base, color: c.onSurface, minWidth: 52, textAlign: "center" }}>{pct}%</Text>
              <Round label="+" onPress={() => step(10)} />
            </View>
          </Row>
          <Row label={t.editTime}>
            <TextInput value={time} onChangeText={setTime} accessibilityLabel={t.editTime} keyboardType="numbers-and-punctuation" maxLength={5}
              style={{ textAlign: "right", fontFamily: T.face.bold, fontSize: T.font.base, color: timeOk ? c.onSurface : c.error, minHeight: 36, minWidth: 60 }} />
          </Row>
          <Row label={t.editType}>
            <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", flex: 1 }}>
              {TYPES.map((k) => <Chip key={k} label={t[`meal${k}` as const]} selected={type === k} onPress={() => setType(k)} />)}
            </View>
          </Row>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 8, alignItems: "center" }}>
            <View style={{ flex: 1 }}><Button label={t.save} onPress={save} disabled={!timeOk || !name.trim()} /></View>
            <Chip label={t.remove} tone="danger" onPress={() => onDelete(entry)} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, backgroundColor: c.surfaceLow, borderRadius: 16, paddingVertical: 8, paddingHorizontal: 14, minHeight: 48 }}>
      <Text style={{ fontFamily: T.face.body, fontSize: T.font.base, color: c.onSurface }}>{label}</Text>
      {children}
    </View>
  );
}

function Round({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
      style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface, borderWidth: 1, borderColor: c.outline, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontFamily: T.face.bold, fontSize: 20, color: c.onSurface }}>{label}</Text>
    </Pressable>
  );
}
