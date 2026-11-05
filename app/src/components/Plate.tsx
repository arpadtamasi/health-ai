// BR-01m6m432cqp8fkhggthg8a6720 (Each third of the plate fills with its own food, one portion per entry) and BR-01m6m4323nzt0ma6qf6j5a0yxa
// (Each macro has its own colour, and words state the situation): the plate of the home, a dark speckled stoneware plate seen from
// above, divided into three thirds by raised ridges. Protein fills with red lentils, carbs with rice, fat with pumpkin seeds, from
// the middle of each third outwards, a shade per entry; a dashed contour marks how far they should reach by now. Above a goal the
// grains spill onto the rim (BR-01m6nzdyz40bdbmtbn9ffze1v5). The calories sit on the hub. A tap on a third chooses what the home
// shows (US-01m3y1prd5e73v389tvmmk9nm7); a highlighted entry keeps its grains strong (EX-01m6m433e1t8zq2qycthkx9e6e); a previewed
// suggestion shows as outlined grains (EX-01m6m4332s0zwsvq9103fp9ff2).
import { memo, useEffect, useId, useMemo, useRef, useState } from "react";
import { AccessibilityInfo } from "react-native";
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Line, Path, RadialGradient, Stop, Text as SvgText } from "react-native-svg";
import { contourOf, grainsOf, spillSpotsOf, spotsOf, THIRD_ANGLE, type Drawn, type Geometry, type Grain, type Layer, type Part, type Third } from "../plate";
import { tokens as T } from "../theme/tokens";

const c = T.color;
export const colorOf = (m: Drawn): string => ({ p: c.protein, c: c.carbs, f: c.fat, w: c.water })[m];
const shadeOf = (m: Third, s: 0 | 1): string => (s ? { p: c.protein2, c: c.carbs2, f: c.fat2 }[m] : { p: c.protein, c: c.carbs, f: c.fat }[m]);

const CX = 120, CY = 120, R = 99, HUB = 30, RIM = 113;
const GEO: Geometry = { cx: CX, cy: CY, r: R, hub: HUB };
const THIRDS: Third[] = ["p", "c", "f"];
const SPOTS: Record<Third, ReturnType<typeof spotsOf>> = { p: spotsOf("p", GEO), c: spotsOf("c", GEO), f: spotsOf("f", GEO) };

const pt = (r: number, a: number) => [CX + r * Math.cos((a * Math.PI) / 180), CY + r * Math.sin((a * Math.PI) / 180)] as const;
const sector = (a: number) => { const [x1, y1] = pt(R, a - 60), [x2, y2] = pt(R, a + 60); return `M${CX} ${CY} L${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`; };
const tapArea = (a: number) => { const [x1, y1] = pt(RIM, a - 60), [x2, y2] = pt(RIM, a + 60); return `M${CX} ${CY} L${x1.toFixed(1)} ${y1.toFixed(1)} A${RIM} ${RIM} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`; };

/** The speckles of the stoneware: fixed, so the plate never changes between renders. */
const SPECKS = (() => { let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647); return Array.from({ length: 220 }, () => { const rr = Math.sqrt(r()) * (RIM - 2), aa = r() * 360; const [x, y] = pt(rr, aa); return { x, y, r: 0.4 + r() * 0.8, o: 0.25 + r() * 0.45 }; }); })();

/** The newest entry grows in from nothing, unless the phone asks for less motion. */
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
        const k = Math.min(1, (Date.now() - t0) / 700);
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

/** One grain of its food: a round lentil, an oblong rice grain, a pointed pumpkin seed. */
function grainShape(m: Third, g: Grain, fill: string, opacity: number, key: string, outline = false) {
  const x = g.x, y = g.y, edge = outline ? fill : c.grainEdge, fillC = outline ? "none" : fill, sw = outline ? 0.9 : 0.5;
  if (m === "p") { const jx = x + (g.j - 0.5) * 1.6, jy = y + (g.rot / 180 - 0.5) * 1.6; return <Circle key={key} cx={jx} cy={jy} r={2.35 + g.j * 0.4} fill={fillC} stroke={edge} strokeWidth={sw} opacity={opacity} />; }
  if (m === "c") return <Ellipse key={key} cx={x} cy={y} rx={3.4} ry={1.75} rotation={g.rot} origin={`${x}, ${y}`} fill={fillC} stroke={edge} strokeWidth={sw + 0.05} opacity={opacity} />;
  return <Path key={key} d={`M${(x - 3.6).toFixed(1)} ${y.toFixed(1)} Q${x.toFixed(1)} ${(y - 2.6).toFixed(1)} ${(x + 3.6).toFixed(1)} ${y.toFixed(1)} Q${x.toFixed(1)} ${(y + 2.6).toFixed(1)} ${(x - 3.6).toFixed(1)} ${y.toFixed(1)} Z`}
    rotation={g.rot} origin={`${x}, ${y}`} fill={fillC} stroke={edge} strokeWidth={sw} opacity={opacity} />;
}

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
  /** The small plate of the one-line status: the share of each third as a tint, no grains, no taps. */
  mini?: boolean;
}

function PlateView({ parts, kcal, selected, highlight, preview, size, onSelect, labels, mini = false }: PlateProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const g = useGrow(THIRDS.flatMap((m) => parts[m].layers.map((l) => `${m}:${l.id}`)));
  const grains = useMemo(() => {
    const out = {} as Record<Third, Grain[]>;
    for (const m of THIRDS) {
      const p = parts[m];
      const layers = p.layers.map((l) => (g.id === `${m}:${l.id}` ? grown(l, { id: l.id, k: g.k }) : l));
      out[m] = grainsOf({ ...p, layers }, SPOTS[m], (n) => spillSpotsOf(m, GEO, n));
    }
    return out;
  }, [parts, g.id, g.k]);
  const fmt = (n: number) => Math.round(n).toLocaleString("hu-HU");
  const inThird = selected === "p" || selected === "c" || selected === "f";
  const hubBig = inThird ? `${Math.round(parts[selected].eaten)} g` : fmt(kcal.eaten);
  const hubSmall = inThird ? `/ ${parts[selected].goal} g` : `/ ${fmt(kcal.goal)} kcal`;
  return (
    <Svg width={size} height={size} viewBox="-14 -14 268 268" accessibilityLabel={`${hubBig} ${hubSmall}`}>
      <Defs>
        <RadialGradient id={`rim${uid}`} cx="45%" cy="40%" r="65%"><Stop offset="0" stopColor={c.stone} /><Stop offset="1" stopColor={c.stone2} /></RadialGradient>
        <RadialGradient id={`well${uid}`} cx="50%" cy="50%" r="55%"><Stop offset="0.7" stopColor={c.stoneWell} /><Stop offset="1" stopColor={c.stone2} /></RadialGradient>
        {THIRDS.map((m) => <ClipPath key={m} id={`cl${m}${uid}`}><Path d={sector(THIRD_ANGLE[m])} /></ClipPath>)}
      </Defs>
      {[0, 3, 6].map((d, i) => <Circle key={d} cx={CX + 4} cy={CY + 7} r={RIM + d} fill={c.shadow} opacity={[0.5, 0.25, 0.1][i]} />)}
      <Circle cx={CX} cy={CY} r={RIM} fill={`url(#rim${uid})`} />
      <Circle cx={CX} cy={CY} r={R + 2} fill={`url(#well${uid})`} />
      {mini ? null : SPECKS.map((s, i) => <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill={c.speck} opacity={s.o} />)}
      {THIRDS.map((m) => {
        const p = parts[m], a = THIRD_ANGLE[m], dim = selected !== "kcal" && selected !== m;
        if (mini) return <Path key={m} d={sector(a)} fill={colorOf(m)} opacity={0.15 + 0.85 * Math.min(1, p.fill)} />;
        const pv = preview?.[m] ?? 0;
        const pvGrains = pv > 0 && p.fill < 1 ? SPOTS[m].slice(Math.round(Math.min(1, p.fill) * SPOTS[m].length), Math.round(Math.min(1, p.fill + pv / p.goal) * SPOTS[m].length)) : [];
        const contour = !p.done && p.plan > 0 && p.fill < 1 ? contourOf(SPOTS[m], p.plan, GEO, m) : 0;
        const [mx, my] = pt(R * 0.5, a);
        return (
          <G key={m} opacity={dim ? 0.3 : 1}>
            {grains[m].map((gr, i) => grainShape(m, gr, shadeOf(m, gr.shade), highlight && highlight !== gr.entry ? 0.25 : 1, `${m}${i}`))}
            {pvGrains.map((s, i) => grainShape(m, { ...s, entry: "preview", shade: 0, spilled: false }, colorOf(m), 0.9, `pv${m}${i}`, true))}
            {contour ? <G clipPath={`url(#cl${m}${uid})`}><Circle cx={mx} cy={my} r={contour} fill="none" stroke={c.stonePlan} strokeWidth={1.6} strokeDasharray="2 5" strokeLinecap="round" /></G> : null}
            {selected === m ? <Path d={tapArea(a)} fill="none" stroke={c.stoneInk} strokeWidth={2} /> : null}
            {onSelect ? <Path d={tapArea(a)} fill="transparent" onPress={() => onSelect(m)} accessibilityLabel={labels[m]} /> : null}
          </G>
        );
      })}
      {[-150, -30, 90].map((a) => { const [x, y] = pt(R + 2, a), [x0, y0] = pt(HUB - 8, a); return (
        <G key={a}>
          <Line x1={x0 + 1.5} y1={y0 + 2} x2={x + 1.5} y2={y + 2} stroke={c.stoneShadow} strokeWidth={mini ? 10 : 7} strokeLinecap="round" />
          <Line x1={x0} y1={y0} x2={x} y2={y} stroke={c.stoneRidge} strokeWidth={mini ? 10 : 7} strokeLinecap="round" />
        </G>); })}
      <Circle cx={CX + 1} cy={CY + 2} r={HUB - 3} fill={c.stoneShadow} />
      <Circle cx={CX} cy={CY} r={HUB - 3} fill={c.stoneRidge} stroke={selected === "kcal" && !mini ? c.stoneInk : "transparent"} strokeWidth={2}
        {...(!mini && onSelect ? { onPress: () => onSelect("kcal") } : {})} />
      {mini ? null : (
        <>
          <SvgText x={CX} y={CY + 3} textAnchor="middle" fontFamily={T.face.display} fontSize={hubBig.length > 4 ? 15 : 17} fill={c.stoneInk}>{hubBig}</SvgText>
          <SvgText x={CX} y={CY + 15} textAnchor="middle" fontFamily={T.face.semi} fontSize={8.5} fill={c.stoneMuted}>{hubSmall}</SvgText>
        </>
      )}
    </Svg>
  );
}
export const Plate = memo(PlateView);
