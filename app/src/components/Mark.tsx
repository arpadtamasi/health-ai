// BR-01m6m4323nzt0ma6qf6j5a0yxa: the drawn mark beside the line under the plate. The shape carries the state (an arrow down for under
// the plan, up for ahead, a dot for on the plan, a tick for done); the colour only helps.
import Svg, { Circle, Path } from "react-native-svg";
import type { Mark as MarkKind } from "../lineText";
import { tokens as T } from "../theme/tokens";

export function Mark({ kind, size = 22 }: { kind: MarkKind; size?: number }) {
  const c = T.color;
  const col = kind === "behind" ? c.warn : kind === "none" ? c.onSurfaceVariant : c.good;
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none" accessibilityElementsHidden importantForAccessibility="no">
      <Circle cx={11} cy={11} r={9} stroke={col} strokeWidth={2} />
      {kind === "behind" ? <Path d="M11 6.5v8M7.5 11.5 11 15l3.5-3.5" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /> : null}
      {kind === "ahead" ? <Path d="M11 15.5v-8M7.5 10.5 11 7l3.5 3.5" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /> : null}
      {kind === "on" ? <Circle cx={11} cy={11} r={3.2} fill={col} /> : null}
      {kind === "done" ? <Path d="m7 11.5 2.8 2.8L15.2 8.5" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /> : null}
    </Svg>
  );
}
