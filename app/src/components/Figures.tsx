// US-01m3y1prd5e73v389tvmmk9nm7 (Choose what the home shows): the row under the line, protein, carbs, fat and water as eaten against
// the goal, each with the dot of its colour. A tap chooses it, as a tap on its third or on the glass does; the chosen one is outlined.
// The figures stay in ink: the line, its mark and the hatching on the plate say how the day stands (BR-01m6m4323nzt0ma6qf6j5a0yxa).
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import type { Drawn, Part } from "../plate";
import type { Texts } from "../i18n";
import { tokens as T } from "../theme/tokens";
import { colorOf } from "./Plate";

const ORDER: Drawn[] = ["p", "c", "f", "w"];
const l = (ml: number) => (ml / 1000).toFixed(1).replace(".", ",");

export function Figures({ parts, selected, onSelect, t }: { parts: Record<Drawn, Part>; selected: Drawn | "kcal"; onSelect: (m: Drawn) => void; t: Texts }) {
  const c = T.color;
  const name = { p: t.figP, c: t.figC, f: t.figF, w: t.figW };
  // On a narrow phone (320 px) the four columns keep their words whole: less padding, and the figures without the spaces.
  const narrow = useWindowDimensions().width < 350;
  const sep = narrow ? "/" : " / ";
  return (
    <View style={{ flexDirection: "row", gap: narrow ? 2 : 4, paddingHorizontal: narrow ? 6 : 12 }}>
      {ORDER.map((m) => {
        const p = parts[m];
        const value = m === "w" ? `${l(p.eaten)}${sep}${l(p.goal)} l` : `${Math.round(p.eaten)}${sep}${p.goal} g`;
        const on = selected === m;
        return (
          <Pressable key={m} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${name[m]}: ${value}`} onPress={() => onSelect(m)}
            style={{ flex: 1, minWidth: 0, minHeight: T.size.touch, paddingVertical: 5, paddingHorizontal: narrow ? 3 : 6, borderRadius: 14, borderWidth: 1.5,
              borderColor: on ? c.ink : "transparent", backgroundColor: on ? c.surface : "transparent" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: colorOf(m), borderWidth: 1, borderColor: T.color.grainEdge }} />
              <Text numberOfLines={1} style={{ ...T.type.microStrong, color: c.onSurface }}>{name[m]}</Text>
            </View>
            <Text numberOfLines={1} style={{ fontFamily: T.face.bold, fontSize: T.font.micro, color: c.onSurface, ...T.numeric }}>{value}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
