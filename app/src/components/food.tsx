import { Pressable, Text, View } from "react-native";
import { tokens as T } from "../theme/tokens";
import { FoodIcon, type FoodCategory } from "./icons";

const c = T.color;

export interface Option {
  rank: number;
  name: string;
  category: FoodCategory;
  kcal: number;
  carbs: number;
  protein: number;
  fat?: number;
  reason?: string;
  ingredients?: string[];
}

// US-01m3rwa0cvrtcapqk0k3h6mqvc (Ask what to eat to catch up): tapping a card is the choice. The top pick is yellow, so that red
// stays the brand and the "behind" signal.
export function OptionCard({ option, primary = false, onChoose, labels }: { option: Option; primary?: boolean; onChoose: (o: Option) => void; labels: { choose: string; protein: string; fat: string } }) {
  const fg = primary ? c.onPrimaryContainer : c.onSurface;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${labels.choose} ${option.name}`} onPress={() => onChoose(option)}
      style={{ backgroundColor: primary ? c.primaryContainer : c.surfaceLow, borderRadius: T.radius.card, padding: T.space.m, gap: T.space.s }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: T.space.m }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: c.ink }}>
          <Text style={{ fontFamily: T.face.bold, color: "#fff" }}>{option.rank}</Text>
        </View>
        <Text style={{ flex: 1, fontSize: 18, fontFamily: T.face.display, letterSpacing: -0.3, color: fg }}>{option.name}</Text>
        <FoodIcon category={option.category} size={26} color={fg} />
      </View>
      <Text style={{ fontFamily: T.face.body, fontSize: T.font.body, color: fg }}>
        {option.kcal} kcal · {option.protein} g {labels.protein}{option.fat !== undefined ? ` · ${option.fat} g ${labels.fat}` : ""}
      </Text>
      {option.reason ? <Text style={{ fontFamily: T.face.body, fontSize: T.font.body, color: fg }}>{option.reason}</Text> : null}
    </Pressable>
  );
}
