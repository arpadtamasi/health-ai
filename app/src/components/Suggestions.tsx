// US-01m3rwa0cvrtcapqk0k3h6mqvc (Ask what to eat to catch up) and EX-01m6m4332s0zwsvq9103fp9ff2 (Choosing a suggestion previews it
// on the plate): the options of "What should I eat now?". The first tap on one picks it, and the plate shows it as a dashed layer;
// a second tap on the same option logs it, with an Undo (the owner's choice, no separate button).
import { Pressable, Text, View } from "react-native";
import type { Option } from "./food";
import { FoodIcon } from "./icons";
import type { Texts } from "../i18n";
import { tokens as T } from "../theme/tokens";

export function Suggestions({ options, picked, onTap, t }: { options: Option[]; picked: number | null; onTap: (o: Option) => void; t: Texts }) {
  const c = T.color;
  return (
    <View style={{ gap: 8 }}>
      {options.map((o) => {
        const on = picked === o.rank;
        return (
          <Pressable key={o.rank} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityHint={on ? t.pickAgain : undefined} accessibilityLabel={`${o.name}, ${o.kcal} kcal`}
            onPress={() => onTap(o)}
            style={{ flexDirection: "row", gap: 10, alignItems: "flex-start", borderRadius: 14, borderWidth: 1.5, paddingVertical: 9, paddingHorizontal: 12,
              borderColor: on ? c.ink : c.outline, backgroundColor: on ? c.surfaceLow : c.surface }}>
            <View style={{ paddingTop: 2 }}><FoodIcon category={o.category} size={20} color={c.onSurfaceVariant} /></View>
            <View style={{ flex: 1, gap: 1 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                <Text style={{ flex: 1, ...T.type.label, color: c.onSurface }}>{o.name}</Text>
                <Text style={{ fontFamily: T.face.semi, fontSize: T.font.label, color: c.onSurfaceVariant, ...T.numeric }}>{o.kcal} kcal</Text>
              </View>
              {o.reason ? <Text style={{ ...T.type.micro, color: c.onSurfaceVariant }}>{o.reason}</Text> : null}
              {on ? <Text style={{ ...T.type.microStrong, color: c.primary, marginTop: 2 }}>{t.pickAgain}</Text> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
