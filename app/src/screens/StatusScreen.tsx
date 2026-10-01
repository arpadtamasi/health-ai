// US-01m3rvr64zrzczabckjf6crb2z and "Open on a full-screen home that shows the day": the Status, one of the two states of the app.
// The biggest gap is the hero; beneath it a ring each for calories, carbs and protein (and water when there is data), each with
// a tick where the plan for this time of day stands; then the Log button with one or two frequent actions beside it.
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { DayState, Usual } from "../api/client";
import { Ring } from "../components/Ring";
import { UiIcon } from "../components/icons";
import { Chip } from "../components/ui";
import { useT } from "../i18n";
import { pace } from "../pace";
import { tokens as T } from "../theme/tokens";

const c = T.color;
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export interface Toast { text: string; entryId: string | null }

export function StatusScreen({ state, usuals, toast, healthConnected, onLog, onPhoto, onFrequent, onUndo, onConnect }:
  { state: DayState | null; usuals: Usual[]; toast: Toast | null; healthConnected: boolean; onLog: () => void; onPhoto: () => void; onFrequent: (u: Usual) => void; onUndo: () => void; onConnect: () => void }) {
  const { t } = useT();

  const view = useMemo(() => {
    if (!state) return null;
    const rows = [
      { key: "cal", label: t.calories, unit: "", goal: state.goals.calories, eaten: state.eaten.calories },
      { key: "carbs", label: t.carbs, unit: " g", goal: state.goals.carbs, eaten: state.eaten.carbs },
      { key: "protein", label: t.protein, unit: " g", goal: state.goals.protein, eaten: state.eaten.protein },
    ].map((r) => ({ ...r, result: pace(r.goal, r.eaten, state.minutes, state.window) }));
    // The one furthest behind relative to its own goal is the hero, so grams and kilocalories compare fairly.
    const worst = [...rows].sort((a, b) => a.result.gap / a.goal - b.result.gap / b.goal)[0]!;
    const cal = rows[0]!.result;
    return { rows, worst: worst.result.behind ? worst : null, cal, left: Math.max(0, state.goals.calories - state.eaten.calories) };
  }, [state, t]);

  // The buttons come from the history: the most frequent meal and, once there is one, the most frequent water. No water button at the start.
  const buttons = [usuals.find((u) => u.kind === "meal"), usuals.find((u) => u.kind === "water")].filter((u): u is Usual => u !== undefined);
  const water = state?.water;
  const waterFraction = water && water.goalMl > 0 ? Math.min(1, water.ml / water.goalMl) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: c.surface, paddingHorizontal: T.space.xl, paddingTop: T.space.m, gap: T.space.m }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: T.space.m, height: 48 }}>
        <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}>
          <UiIcon name="heart" size={18} color={c.onPrimary} filled />
        </View>
        <Text style={{ fontSize: 18, fontWeight: "600", color: c.onSurface }}>{t.appName}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: T.space.m, paddingBottom: T.space.m }}>
        {!state || !view ? (
          <Text style={{ color: c.onSurfaceVariant, fontSize: T.font.base }}>{t.loading}</Text>
        ) : (
          <>
            <View style={{ backgroundColor: c.primary, borderRadius: 28, padding: 20, gap: 2 }}>
              <Text style={{ fontSize: 12, letterSpacing: 0.5, fontWeight: "600", color: c.onPrimary, opacity: 0.85 }}>{t.heroOverline(hhmm(state.minutes), view.worst !== null)}</Text>
              <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontSize: 44, fontWeight: "700", color: c.onPrimary }}>
                {view.worst ? t.heroBig(view.worst.label, `${Math.abs(view.worst.result.gap)}${view.worst.unit}`) : t.heroOnPlan}
              </Text>
              <Text style={{ fontSize: 15, color: c.onPrimary, opacity: 0.92 }}>
                {view.cal.behind ? t.heroUnder(Math.abs(view.cal.gap), view.left) : t.heroOver(view.cal.gap, view.left)}
              </Text>
            </View>

            <View style={{ backgroundColor: c.surfaceLow, borderRadius: 28, paddingVertical: 14, paddingHorizontal: 8, flexDirection: "row", flexWrap: "wrap", rowGap: 10 }}>
              {view.rows.map((r) => (
                <View key={r.key} style={{ width: "50%", alignItems: "center", gap: 4 }}>
                  <Ring eaten={r.result.eatenFraction} plan={r.result.planFraction} behind={view.worst?.key === r.key}
                    center={`${r.eaten}${r.unit}`} sub={t.ofGoal(`${r.goal}${r.unit}`)} />
                  <Text style={{ fontSize: 14, fontWeight: "600", color: c.onSurface }}>{r.label}</Text>
                  <Text style={{ fontSize: 13, fontWeight: view.worst?.key === r.key ? "700" : "400", color: view.worst?.key === r.key ? c.warn : c.onSurfaceVariant }}>
                    {r.result.behind ? t.under(`${Math.abs(r.result.gap)}${r.unit}`) : t.over(`${r.result.gap}${r.unit}`)}
                  </Text>
                </View>
              ))}
              {water ? (
                <View style={{ width: "50%", alignItems: "center", gap: 4 }}>
                  <Ring eaten={waterFraction} plan={waterFraction} behind={false} center={`${water.ml}`} sub={t.waterOf(water.goalMl)} />
                  <Text style={{ fontSize: 14, fontWeight: "600", color: c.onSurface }}>{t.waterLabel}</Text>
                  <Text style={{ fontSize: 13, color: c.onSurfaceVariant }}>{water.ml >= water.goalMl ? t.waterDone : t.waterLeft(water.goalMl - water.ml)}</Text>
                </View>
              ) : null}
            </View>

            {!healthConnected ? (
              <View style={{ backgroundColor: c.surfaceLow, borderRadius: T.radius.card, padding: T.space.l, gap: T.space.s }}>
                <Text style={{ fontSize: T.font.base, fontWeight: "600", color: c.onSurface }}>{t.connectTitle}</Text>
                <Text style={{ fontSize: T.font.body, color: c.onSurfaceVariant }}>{t.connectText}</Text>
                <Chip label={t.connectButton} onPress={onConnect} />
              </View>
            ) : null}

            {toast ? (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: c.surfaceLow, borderRadius: T.radius.card, paddingVertical: T.space.s, paddingLeft: T.space.l, paddingRight: T.space.s }}>
                <Text style={{ flex: 1, fontSize: T.font.body, color: c.onSurface }}>{toast.text}</Text>
                <Chip label={t.toastUndo} onPress={onUndo} />
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", paddingBottom: T.space.s }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t.log} onPress={onLog}
          style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 56, paddingHorizontal: 24, borderRadius: 28, backgroundColor: c.primary }}>
          <UiIcon name="plus" size={22} color={c.onPrimary} />
          <Text style={{ fontSize: 17, fontWeight: "700", color: c.onPrimary }}>{t.log}</Text>
        </Pressable>
        {buttons.map((u) => (
          <Pressable key={`${u.kind}-${u.name}`} accessibilityRole="button" accessibilityLabel={u.name} onPress={() => onFrequent(u)}
            style={{ height: 56, paddingHorizontal: 18, borderRadius: 28, backgroundColor: c.primaryContainer, alignItems: "center", justifyContent: "center", maxWidth: 130 }}>
            <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "600", color: c.onPrimaryContainer }}>{u.kind === "water" ? `${u.ml} ml` : u.name}</Text>
          </Pressable>
        ))}
        <Pressable accessibilityRole="button" accessibilityLabel={t.photo} onPress={onPhoto}
          style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 56, paddingHorizontal: 18, borderRadius: 28, backgroundColor: c.primaryContainer }}>
          <UiIcon name="camera" size={20} color={c.onPrimaryContainer} />
          <Text style={{ fontSize: 15, fontWeight: "600", color: c.onPrimaryContainer }}>{t.photo}</Text>
        </Pressable>
      </View>
    </View>
  );
}
