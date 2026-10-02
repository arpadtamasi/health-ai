// The top of the home: one figure and one picture of the day (US "Open on a full-screen home that shows the day"). The picture is a
// chart from the start to the end of the eating window: the plan is the dashed diagonal (or the cap, for fat), what was logged is a
// staircase with a dot per item, the area between them is the gap, a line marks now. The colour states the situation (BR "The
// hero's colour states the situation"): red behind the plan, yellow on track, ink once the day is done.
import { useState } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
import type { ChartModel, Hero as HeroModel, Tone } from "../day";
import { tokens as T } from "../theme/tokens";

const c = T.color;
/** Built on every call, from the palette of the moment (light or dark). */
export const tones = (): Record<Tone, { bg: string; fg: string; plan: string; line: string; dot: string; dotStroke: string; wedge: string }> => ({
  behind: { bg: c.primary, fg: "#ffffff", plan: "#ffffffd9", line: "#ffffff", dot: c.primaryContainer, dotStroke: "#ffffff", wedge: "#ffffff38" },
  ok: { bg: c.primaryContainer, fg: c.onPrimaryContainer, plan: "#2a1c00b3", line: c.onPrimaryContainer, dot: c.primary, dotStroke: c.onPrimaryContainer, wedge: "#2a1c0018" },
  done: { bg: c.strong, fg: c.onStrong, plan: `${c.onStrong}b3`, line: c.primaryContainer, dot: c.primaryContainer, dotStroke: c.strong, wedge: `${c.onStrong}22` },
});

const H = 112;
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export interface HeroProps {
  tone: Tone;
  big: string;
  text: string;
  chart: ChartModel | null;
  minutes: number;
  window: { startHour: number; endHour: number };
  labels: { metric: string; plan: string; you: string; cap: string; aria: string };
  compact?: boolean;
}

export function Hero({ tone, big, text, chart, minutes, window, labels, compact = false }: HeroProps) {
  const t = tones()[tone];
  if (compact) {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: t.bg, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16 }}>
        <Text style={{ fontFamily: T.face.display, fontSize: T.font.title, letterSpacing: -0.4, color: t.fg }}>{big}</Text>
        <Text style={{ fontFamily: T.face.body, fontSize: T.font.meta, color: t.fg }}>{hhmm(minutes)}</Text>
      </View>
    );
  }
  return (
    <View accessibilityLiveRegion="polite" style={{ backgroundColor: t.bg, borderRadius: 28, paddingTop: 16, paddingHorizontal: 18, paddingBottom: 12 }}>
      <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: T.face.display, fontSize: T.font.hero, letterSpacing: -0.8, color: t.fg, ...T.numeric }}>{big}</Text>
      <Text style={{ fontFamily: T.face.body, fontSize: T.font.body, color: t.fg, marginTop: 4 }}>{text}</Text>
      {chart ? <Chart chart={chart} tone={tone} minutes={minutes} window={window} labels={labels} /> : null}
    </View>
  );
}

function Chart({ chart, tone, minutes, window, labels }: { chart: ChartModel; tone: Tone; minutes: number; window: HeroProps["window"]; labels: HeroProps["labels"] }) {
  const t = tones()[tone];
  const [W, setW] = useState(314);   // the width the hero really has, so that the chart fills it
  const X = (x: number) => x * W;
  const Y = (v: number) => H - Math.min(1, v / chart.goal) * H;
  let path = `M0 ${H}`;
  let prev = 0;
  for (const s of chart.steps) { path += ` L${X(s.x)} ${Y(prev)} L${X(s.x)} ${Y(s.total)}`; prev = s.total; }
  const nx = X(chart.nowX);
  path += ` L${nx} ${Y(chart.total)}`;
  const wedge = chart.planNow !== undefined ? `${path} L${nx} ${Y(chart.planNow)} L0 ${H} Z` : "";
  const endNear = nx > W - 50;
  const font = T.face.bold;
  return (
    <View style={{ marginTop: 10 }} accessible accessibilityRole="image" accessibilityLabel={labels.aria} onLayout={(e) => setW(Math.max(200, Math.round(e.nativeEvent.layout.width)))}>
      <Svg width={W} height={H + 22} style={{ overflow: "visible" }}>
        {wedge ? <Path d={wedge} fill={t.wedge} /> : null}
        <Line x1={0} y1={H} x2={W} y2={H} stroke={t.fg} strokeOpacity={0.4} />
        {chart.limit
          ? <>
              <Line x1={0} y1={1.5} x2={W} y2={1.5} stroke={t.fg} strokeWidth={5} strokeLinecap="round" />
              <SvgText x={W * 0.3} y={22} fontSize={T.font.micro} fontFamily={font} fill={t.fg} textAnchor="middle">{labels.cap}</SvgText>
            </>
          : <>
              <Line x1={0} y1={H} x2={W} y2={0} stroke={t.plan} strokeWidth={2.5} strokeDasharray="2 6" strokeLinecap="round" />
              <SvgText x={W * 0.3} y={Y(0.3 * chart.goal) - 12} fontSize={T.font.micro} fontFamily={font} fill={t.fg} textAnchor="middle">{labels.plan}</SvgText>
            </>}
        <Line x1={nx} y1={0} x2={nx} y2={H} stroke={t.fg} strokeOpacity={0.45} />
        <Path d={path} fill="none" stroke={t.line} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
        {chart.steps.map((s, i) => <Circle key={i} cx={X(s.x)} cy={Y(s.total)} r={5.5} fill={t.dot} stroke={t.dotStroke} strokeWidth={2} />)}
        <SvgText x={0} y={12} fontSize={T.font.micro} fontFamily={font} fill={t.fg}>{labels.metric}</SvgText>
        {chart.steps.length ? (
          <SvgText x={endNear ? nx - 8 : nx + 8} y={endNear ? Math.max(12, Y(chart.total) - 12) : Math.min(H - 6, Y(chart.total) + 18)} fontSize={T.font.micro} fontFamily={font} fill={t.fg} textAnchor={endNear ? "end" : "start"}>{labels.you}</SvgText>
        ) : null}
        {nx < 40 ? null : <SvgText x={0} y={H + 17} fontSize={T.font.micro} fontFamily={T.face.body} fill={t.fg}>{`${window.startHour}:00`}</SvgText>}
        {nx > W - 40 ? null : <SvgText x={W} y={H + 17} fontSize={T.font.micro} fontFamily={T.face.body} fill={t.fg} textAnchor="end">{`${window.endHour}:00`}</SvgText>}
        <SvgText x={Math.min(W - 20, Math.max(20, nx))} y={H + 17} fontSize={T.font.micro} fontFamily={font} fill={t.fg} textAnchor="middle">{hhmm(minutes)}</SvgText>
      </Svg>
    </View>
  );
}
