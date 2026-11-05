// The app's mark: a lentil, a grain of rice and a pumpkin seed on stoneware, the three foods of the plate (the "three grains" icon the
// owner chose). The same drawing makes the icons in public/ (scripts/make-icons.mjs).
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";
import { tokens as T } from "../theme/tokens";

const P = (r: number, a: number): [number, number] => [50 + r * Math.cos((a * Math.PI) / 180), 52 + r * Math.sin((a * Math.PI) / 180)];

export function Logo({ size = 30, tile = true }: { size?: number; tile?: boolean }) {
  const c = T.color;
  const k = size <= 32 ? 1.2 : 1;
  const sw = size <= 32 ? 0 : 1;
  const [lx, ly] = P(19, -90), [rx, ry] = P(19, 30), [fx, fy] = P(19, 150);
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityElementsHidden importantForAccessibility="no">
      {tile ? <Rect width={100} height={100} rx={23} fill={c.stone} /> : null}
      <Circle cx={lx} cy={ly} r={11.5 * k} fill={c.protein} stroke={c.grainEdge} strokeWidth={sw} />
      {size >= 64 ? <Circle cx={lx - 3.5} cy={ly - 3.5} r={3} fill="#fff" opacity={0.35} /> : null}
      <Ellipse cx={rx} cy={ry} rx={16.5 * k} ry={8.5 * k} transform={`rotate(-60 ${rx} ${ry})`} fill={c.carbs} stroke={c.grainEdge} strokeWidth={sw} />
      <Path d={`M${fx - 17 * k} ${fy} Q${fx} ${fy - 13 * k} ${fx + 17 * k} ${fy} Q${fx} ${fy + 13 * k} ${fx - 17 * k} ${fy} Z`}
        transform={`rotate(60 ${fx} ${fy})`} fill={c.fat} stroke={c.grainEdge} strokeWidth={sw} />
    </Svg>
  );
}
