// One grammar for the bars (US "See where I am against the day's pace"): a minimum (protein, carbs, water) says how much is still to
// go, with a tick where the plan stands now and a hatched part for the lag; fat is a limit: how much is left under the cap, whose end
// is the thick end of the bar. Shape carries the state and colour only helps. Tapping a bar chooses what the hero shows.
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Defs, Line, Pattern, Rect } from "react-native-svg";
import type { BarModel, Metric } from "../day";
import { tokens as T } from "../theme/tokens";

const c = T.color;

export interface BarLabels { name: string; value: string }

function Bar({ bar, label, value, selected, onPress }: { bar: BarModel; label: string; value: string; selected: boolean; onPress: () => void }) {
  const [w, setW] = useState(160);   // a first guess, so the bar never waits for the layout
  const H = 12;
  const tight = bar.limit && bar.fill >= 85;
  const fillColor = bar.limit ? (tight ? c.behind : c.good) : bar.behind ? c.behind : c.good;
  const textColor = bar.limit ? (tight ? c.warn : c.onSurfaceVariant) : bar.behind ? c.warn : bar.done ? c.goodText : c.onSurfaceVariant;
  const px = (pct: number) => (pct / 100) * w;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={`${label}: ${value}`} onPress={onPress}
      style={{ flex: 1, minHeight: T.size.touch, paddingHorizontal: 10, paddingVertical: 8, margin: -8, borderRadius: 16, backgroundColor: selected ? c.surface : "transparent", borderWidth: 2, borderColor: selected ? c.ink : "transparent" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontFamily: selected ? T.face.bold : T.face.body, fontSize: T.font.meta, color: c.onSurface }}>{label}</Text>
        <Text style={{ fontFamily: T.face.bold, fontSize: T.font.meta, color: textColor, ...T.numeric }}>{value}</Text>
      </View>
      <View style={{ marginTop: 6, height: H }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {w > 0 ? (
          <Svg width={w} height={H}>
            <Defs>
              <Pattern id="hatch" patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
                <Line x1={0} y1={0} x2={0} y2={6} stroke={c.behind} strokeOpacity={0.45} strokeWidth={3} />
              </Pattern>
            </Defs>
            <Rect x={0} y={0} width={w} height={H} rx={6} fill={c.surfaceHigh} />
            <Rect x={0} y={0} width={px(bar.limit ? Math.min(bar.fill, 96) : bar.fill)} height={H} rx={6} fill={fillColor} />
            {bar.behind ? <Rect x={px(bar.fill)} y={0} width={Math.max(0, px(bar.tick - bar.fill))} height={H} fill="url(#hatch)" /> : null}
            {bar.limit ? <Rect x={w - 5} y={0} width={5} height={H} rx={2} fill={c.ink} /> : <Rect x={Math.min(w - 3, px(bar.tick) - 1)} y={0} width={3} height={H} fill={c.ink} />}
          </Svg>
        ) : null}
      </View>
    </Pressable>
  );
}

export function PaceBars({ bars, labels, selected, onSelect }: { bars: BarModel[]; labels: Record<Metric, BarLabels>; selected: Metric; onSelect: (m: Metric) => void }) {
  const rows = [bars.slice(0, 2), bars.slice(2, 4)];
  return (
    <View style={{ backgroundColor: c.surfaceLow, borderRadius: 24, paddingVertical: 16, paddingHorizontal: 18, gap: 18 }}>
      {rows.map((row, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 24 }}>
          {row.map((b) => <Bar key={b.metric} bar={b} label={labels[b.metric].name} value={labels[b.metric].value} selected={selected === b.metric} onPress={() => onSelect(b.metric)} />)}
        </View>
      ))}
    </View>
  );
}
