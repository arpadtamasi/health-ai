import { Text, View } from "react-native";
import { tokens as T } from "../theme/tokens";
import type { PaceResult } from "../pace";

const c = T.color;

export interface PaceItem { label: string; unit: string; result: PaceResult; highlight?: boolean }

// US-01m3rvr64zrzczabckjf6crb2z: the pace strip stays on top of the chat.
export function PaceStrip({ items }: { items: PaceItem[] }) {
  return (
    <View style={{ flexDirection: "row", gap: T.space.m, backgroundColor: c.surfaceLow, borderRadius: T.radius.card, padding: T.space.m }}>
      {items.map(({ label, unit, result, highlight }) => (
        <View key={label} style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: T.font.overline, color: c.onSurfaceVariant }}>{label}</Text>
            <Text style={{ fontSize: T.font.overline, fontWeight: "700", color: highlight ? c.warn : c.onSurfaceVariant }}>
              {result.gap > 0 ? "+" : "−"}{Math.abs(result.gap)}{unit}
            </Text>
          </View>
          <View style={{ marginTop: 4, height: 6, borderRadius: 3, backgroundColor: c.surfaceHigh }}>
            <View style={{ width: `${Math.round(result.eatenFraction * 100)}%`, height: 6, borderRadius: 3, backgroundColor: highlight ? c.behind : c.good }} />
            <View style={{ position: "absolute", left: `${Math.round(result.planFraction * 100)}%`, top: -3, width: 2, height: 12, backgroundColor: c.onSurface }} />
          </View>
        </View>
      ))}
    </View>
  );
}
