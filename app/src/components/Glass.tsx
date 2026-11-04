// BR-01m6m432cqp8fkhggthg8a6720 and EX-01m6m4340zqfxmgcdad670w4h9 (Water fills the glass in blue, hatched where it lags): the glass
// beside the plate fills from the bottom with a layer per glass, the dashed line is the plan for now, the gap below it is hatched.
// A tap on it shows water on the home (US-01m3y1prd5e73v389tvmmk9nm7).
import { useId } from "react";
import Svg, { ClipPath, Defs, Ellipse, G, Line, Path, Pattern, Rect } from "react-native-svg";
import type { Part } from "../plate";
import { tokens as T } from "../theme/tokens";
import { grown, useGrow } from "./Plate";

const c = T.color;
const SHAPE = "M6 10 L74 10 L66 192 Q65.5 200 58 200 L22 200 Q14.5 200 14 192 Z";
const BOTTOM = 198, H = 184;
const y = (f: number) => BOTTOM - Math.min(1, Math.max(0, f)) * H;

export function Glass({ part, selected, dim, highlight, width, onSelect, label }:
  { part: Part; selected: boolean; dim: boolean; highlight?: string | null; width: number; onSelect?: () => void; label: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const g = useGrow(part.layers.map((l) => l.id));
  return (
    <Svg width={width} height={(width * 208) / 80} viewBox="0 0 80 208" accessibilityLabel={label}>
      <Defs>
        <ClipPath id={`gc${uid}`}><Path d={SHAPE} /></ClipPath>
        <Pattern id={`gh${uid}`} patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
          <Line x1={0} y1={0} x2={0} y2={6} stroke={c.water} strokeOpacity={0.6} strokeWidth={2.6} />
        </Pattern>
      </Defs>
      {[0, 3, 6].map((d, i) => <Ellipse key={d} cx={42} cy={203} rx={30 + d} ry={4 + d / 3} fill={c.shadow} opacity={[0.7, 0.35, 0.15][i]} />)}
      <G opacity={dim ? 0.3 : 1}>
        <Path d={SHAPE} fill={c.plate} fillOpacity={0.6} />
        <G clipPath={`url(#gc${uid})`}>
          {part.layers.map((l0) => {
            const l = grown(l0, g), f0 = Math.min(1, l.from), f1 = Math.min(1, l.to);
            if (f1 <= f0) return null;
            return (
              <G key={l.id} opacity={highlight && highlight !== l.id ? 0.22 : 0.92}>
                <Rect x={0} y={y(f1)} width={80} height={y(f0) - y(f1) + (f0 === 0 ? 8 : 0)} fill={c.water} />
                <Line x1={0} x2={80} y1={y(f1)} y2={y(f1)} stroke={c.plate} strokeWidth={1.7} />
              </G>
            );
          })}
          {part.behind ? <Rect x={0} y={y(part.plan)} width={80} height={y(part.fill) - y(part.plan)} fill={`url(#gh${uid})`} /> : null}
        </G>
        <Path d="M13 22 L18 180" stroke={c.plate} strokeOpacity={0.7} strokeWidth={3} strokeLinecap="round" />
        {part.plan > 0 && !part.done ? <Line x1={11} x2={70} y1={y(part.plan)} y2={y(part.plan)} stroke={c.ink} strokeOpacity={0.75} strokeWidth={2} strokeDasharray="1.5 4.5" strokeLinecap="round" /> : null}
      </G>
      <Path d={SHAPE} fill="transparent" stroke={selected ? c.ink : c.outline} strokeWidth={selected ? 2.4 : 2} strokeLinejoin="round" {...(onSelect ? { onPress: onSelect } : {})} />
    </Svg>
  );
}
