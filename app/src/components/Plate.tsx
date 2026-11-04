// BR-01m6m432cqp8fkhggthg8a6720 (The plate fills each third by area, one layer per entry) and BR-01m6m4323nzt0ma6qf6j5a0yxa (Each
// macro has its own colour, and words state the situation): the plate of the home, seen from above. Three equal thirds for protein,
// carbs and fat around a hub with the calories; each entry is a layer, the dashed arc is the plan for now, the hatching the lag, the
// fat third has a thick rim for its cap and spills onto the rim of the plate above it. A tap on a third chooses what the home shows
// (US-01m3y1prd5e73v389tvmmk9nm7); a highlighted entry keeps its layers strong (EX-01m6m433e1t8zq2qycthkx9e6e); a previewed
// suggestion is a dashed layer on top (EX-01m6m4332s0zwsvq9103fp9ff2).
import { useEffect, useId, useRef, useState } from "react";
import { AccessibilityInfo } from "react-native";
import Svg, { Circle, Defs, G, Line, Path, Pattern, Text as SvgText } from "react-native-svg";
import { radiusAt, spillRadius, type Drawn, type Layer, type Part, type Third } from "../plate";
import { tokens as T } from "../theme/tokens";

const c = T.color;
export const colorOf = (m: Drawn): string => ({ p: c.protein, c: c.carbs, f: c.fat, w: c.water })[m];

const SECT: { m: Third; a1: number; a2: number }[] = [{ m: "p", a1: -150, a2: -30 }, { m: "c", a1: -30, a2: 90 }, { m: "f", a1: 90, a2: 210 }];
const CX = 120, CY = 120, R = 99, R0 = 35, RIM = 13, GAP = 1.7;

const pt = (r: number, a: number) => { const t = (a * Math.PI) / 180; return `${(CX + r * Math.cos(t)).toFixed(2)} ${(CY + r * Math.sin(t)).toFixed(2)}`; };
const ann = (r1: number, r2: number, a1: number, a2: number) => {
  const L = a2 - a1 > 180 ? 1 : 0;
  return `M${pt(r2, a1)} A${r2} ${r2} 0 ${L} 1 ${pt(r2, a2)} L${pt(r1, a2)} A${r1} ${r1} 0 ${L} 0 ${pt(r1, a1)} Z`;
};
const arc = (r: number, a1: number, a2: number) => `M${pt(r, a1)} A${r} ${r} 0 0 1 ${pt(r, a2)}`;
const rad = (f: number) => radiusAt(f, R0, R);

/** The newest layer grows in from where the one before ended, unless the phone asks for less motion. */
export function useGrow(ids: string[]): { id: string | null; k: number } {
  const seen = useRef<Set<string> | null>(null);
  const [grow, setGrow] = useState<{ id: string | null; k: number }>({ id: null, k: 1 });
  const key = ids.join("|");
  useEffect(() => {
    const before = seen.current;
    seen.current = new Set(ids);
    const fresh = before ? ids.filter((i) => !before.has(i) && i !== "rest") : [];
    if (!fresh.length) return;
    const id = fresh[fresh.length - 1]!;
    let raf = 0, stop = false;
    void AccessibilityInfo.isReduceMotionEnabled().catch(() => false).then((reduce) => {
      if (reduce || stop) return;
      const t0 = Date.now();
      const step = () => {
        const k = Math.min(1, (Date.now() - t0) / 520);
        setGrow({ id, k: 1 - Math.pow(1 - k, 3) });
        if (k < 1 && !stop) raf = requestAnimationFrame(step); else setGrow({ id: null, k: 1 });
      };
      raf = requestAnimationFrame(step);
    });
    return () => { stop = true; cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return grow;
}
export const grown = (l: Layer, g: { id: string | null; k: number }): Layer => (l.id === g.id ? { ...l, to: l.from + (l.to - l.from) * g.k } : l);

export interface PlateProps {
  parts: Record<Third, Part>;
  kcal: { eaten: number; goal: number };
  /** What the home shows: the calories, a third, or water (the glass). */
  selected: Drawn | "kcal";
  highlight?: string | null;
  preview?: Partial<Record<Third, number>> | null;
  size: number;
  onSelect?: (m: Drawn | "kcal") => void;
  labels: Record<Third, string>;
  /** The small plate of the one-line status draws no plan, no hatching and takes no taps. */
  mini?: boolean;
}

export function Plate({ parts, kcal, selected, highlight, preview, size, onSelect, labels, mini = false }: PlateProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const g = useGrow(SECT.flatMap((s) => parts[s.m].layers.map((l) => `${s.m}:${l.id}`)));
  const fmt = (n: number) => Math.round(n).toLocaleString("hu-HU");
  const inThird = selected === "p" || selected === "c" || selected === "f";
  const hubBig = inThird ? `${Math.round(parts[selected].eaten)} g` : fmt(kcal.eaten);
  const hubSmall = inThird ? `/ ${parts[selected].goal} g` : `/ ${fmt(kcal.goal)} kcal`;
  return (
    <Svg width={size} height={size} viewBox="-8 -8 256 256" accessibilityLabel={`${hubBig} ${hubSmall}`}>
      <Defs>
        {SECT.map((s) => (
          <Pattern key={s.m} id={`h${s.m}${uid}`} patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
            <Line x1={0} y1={0} x2={0} y2={6} stroke={colorOf(s.m)} strokeOpacity={0.6} strokeWidth={2.6} />
          </Pattern>
        ))}
      </Defs>
      <Circle cx={CX + 3} cy={CY + 6} r={R + RIM + 1} fill={c.shadow} opacity={0.55} />
      <Circle cx={CX} cy={CY} r={R + RIM} fill={c.plate} />
      <Circle cx={CX} cy={CY} r={R + 3.5} fill="none" stroke={c.plateEdge} strokeWidth={2} />
      {SECT.map((s) => {
        const p = parts[s.m], a1 = s.a1 + GAP, a2 = s.a2 - GAP, col = colorOf(s.m);
        const dim = selected !== "kcal" && selected !== s.m;
        const pv = preview?.[s.m] ?? 0;
        const total = Math.min(1, p.fill);
        return (
          <G key={s.m} opacity={dim ? 0.26 : 1}>
            <Path d={ann(R0, R, a1, a2)} fill={c.well} />
            {p.layers.map((l0) => {
              const l = g.id === `${s.m}:${l0.id}` ? grown(l0, { id: l0.id, k: g.k }) : l0;
              const f0 = Math.min(1, l.from), f1 = Math.min(1, l.to);
              if (f1 <= f0) return null;
              return <Path key={l.id} d={ann(rad(f0), rad(f1), a1, a2)} fill={col} opacity={highlight && highlight !== l.id ? 0.22 : 1} stroke={c.plate} strokeWidth={1.7} strokeLinejoin="round" />;
            })}
            {pv > 0 && total < 1 ? <Path d={ann(rad(total), rad(Math.min(1, p.fill + pv / p.goal)), a1, a2)} fill={col} fillOpacity={0.28} stroke={c.ink} strokeWidth={1.4} strokeDasharray="3 3" /> : null}
            {!mini && p.behind && !pv ? <Path d={ann(rad(p.fill), rad(p.plan), a1, a2)} fill={`url(#h${s.m}${uid})`} /> : null}
            {p.limit ? <Path d={arc(R + 1, a1, a2)} fill="none" stroke={c.ink} strokeWidth={3.5} strokeLinecap="round" /> : null}
            {p.over > 0 ? <Path d={ann(R + 3.5, spillRadius(p.over, R0, R, R + 7, R + RIM), a1 + 5, a2 - 22)} fill={col} stroke={c.ink} strokeWidth={1} /> : null}
            {!mini && p.plan > 0 && !p.done ? <Path d={arc(rad(p.plan), a1 + 1, a2 - 1)} fill="none" stroke={c.ink} strokeOpacity={0.75} strokeWidth={2} strokeDasharray="1.5 4.5" strokeLinecap="round" /> : null}
            {!mini && selected === s.m ? <Path d={ann(R0, R + RIM, s.a1, s.a2)} fill="none" stroke={c.ink} strokeWidth={2} /> : null}
            {!mini && onSelect ? <Path d={ann(R0, R + RIM, s.a1, s.a2)} fill="transparent" onPress={() => onSelect(s.m)} accessibilityLabel={labels[s.m]} /> : null}
          </G>
        );
      })}
      <Circle cx={CX} cy={CY} r={R0 - 2.5} fill={c.plate} stroke={selected === "kcal" && !mini ? c.ink : c.plateEdge} strokeWidth={selected === "kcal" && !mini ? 2 : 1.5}
        {...(!mini && onSelect ? { onPress: () => onSelect("kcal") } : {})} />
      {mini ? null : (
        <>
          <SvgText x={CX} y={CY + 4} textAnchor="middle" fontFamily={T.face.display} fontSize={hubBig.length > 4 ? 18 : 20} fill={c.onSurface}>{hubBig}</SvgText>
          <SvgText x={CX} y={CY + 17} textAnchor="middle" fontFamily={T.face.semi} fontSize={9.5} fill={c.onSurfaceVariant}>{hubSmall}</SvgText>
        </>
      )}
    </Svg>
  );
}
