import { Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { ringGeometry } from "../ring";
import { tokens as T } from "../theme/tokens";

const c = T.color;

export function Ring({ size = 106, stroke = 12, eaten, plan, behind = false, center, sub }:
  { size?: number; stroke?: number; eaten: number; plan: number; behind?: boolean; center: string; sub: string }) {
  const g = ringGeometry(size, stroke, eaten, plan);
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={g.mid} cy={g.mid} r={g.r} stroke={c.surfaceHigh} strokeWidth={stroke} fill="none" />
        <Circle cx={g.mid} cy={g.mid} r={g.r} stroke={behind ? c.behind : c.good} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={`${g.dash} ${g.circ}`} transform={`rotate(-90 ${g.mid} ${g.mid})`} />
        <Line x1={g.tick.x1} y1={g.tick.y1} x2={g.tick.x2} y2={g.tick.y2} stroke={c.onSurface} strokeWidth={3} strokeLinecap="round" />
      </Svg>
      <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: Math.round(size / 4.2), fontWeight: "700", color: c.onSurface }}>{center}</Text>
        <Text style={{ fontSize: 11, color: c.onSurfaceVariant }}>{sub}</Text>
      </View>
    </View>
  );
}
