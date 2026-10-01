import { Pressable, Text, View } from "react-native";
import { foodIcons, tokens as T, type FoodCategory } from "../theme/tokens";

const c = T.color;

export function FoodIcon({ category, size = 24 }: { category: FoodCategory; size?: number }) {
  return <Text accessibilityElementsHidden style={{ fontSize: size }}>{foodIcons[category] ?? foodIcons.other}</Text>;
}

export interface Option {
  rank: number;
  name: string;
  category: FoodCategory;
  kcal: number;
  carbs: number;
  protein: number;
  reason?: string;
}

// US-01m3rwa0cvrtcapqk0k3h6mqvc (Ask what to eat to catch up): tapping a card is the choice.
export function OptionCard({ option, primary = false, onChoose }: { option: Option; primary?: boolean; onChoose: (o: Option) => void }) {
  const fg = primary ? c.onPrimary : c.onSurface;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Choose ${option.name}`} onPress={() => onChoose(option)}
      style={{ backgroundColor: primary ? c.primary : c.surfaceLow, borderRadius: T.radius.card, padding: T.space.m, gap: T.space.s }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: T.space.m }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: primary ? c.onPrimary : c.secondaryContainer }}>
          <Text style={{ fontWeight: "700", color: primary ? c.primary : c.onSecondaryContainer }}>{option.rank}</Text>
        </View>
        <Text style={{ flex: 1, fontSize: 18, fontWeight: "700", color: fg }}>{option.name}</Text>
        <FoodIcon category={option.category} />
      </View>
      <Text style={{ fontSize: T.font.body, color: fg }}>{option.kcal} kcal · {option.carbs} g carbs · {option.protein} g protein</Text>
      {option.reason ? <Text style={{ fontSize: T.font.body, color: fg, opacity: 0.9 }}>{option.reason}</Text> : null}
    </Pressable>
  );
}
