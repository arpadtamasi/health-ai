import { Pressable, Text, View } from "react-native";
import { tokens as T } from "../theme/tokens";
import { FoodIcon, type FoodCategory } from "./icons";

const c = T.color;

export function Button({ label, onPress, kind = "primary", disabled = false }: { label: string; onPress?: () => void; kind?: "primary" | "text"; disabled?: boolean }) {
  const primary = kind === "primary";
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
      style={{ minHeight: T.size.button, borderRadius: T.radius.button, alignItems: "center", justifyContent: "center", paddingHorizontal: T.space.xl,
        backgroundColor: primary ? c.primary : "transparent", opacity: disabled ? 0.5 : 1 }}>
      <Text style={{ color: primary ? c.onPrimary : c.primary, fontFamily: T.face.semi, fontSize: T.font.base }}>{label}</Text>
    </Pressable>
  );
}

/** A pill, at least 44 px tall: the dock and the card actions are what a thumb hits ten times a day. */
export function Chip({ label, icon, selected = false, onPress, tone = "neutral" }: { label: string; icon?: FoodCategory; selected?: boolean; onPress?: () => void; tone?: "neutral" | "danger" }) {
  const fg = selected ? c.onPrimaryContainer : tone === "danger" ? c.error : c.onSurface;
  return (
    <Pressable accessibilityRole="button" onPress={onPress}
      style={{ minHeight: T.size.touch, paddingHorizontal: 16, borderRadius: T.radius.chip, borderWidth: 1, justifyContent: "center",
        borderColor: selected ? c.primaryContainer : c.outline, backgroundColor: selected ? c.primaryContainer : c.surface }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {icon ? <FoodIcon category={icon} size={16} color={fg} /> : null}
        <Text numberOfLines={1} style={{ fontFamily: selected ? T.face.semi : T.face.body, fontSize: T.font.body, color: fg }}>{label}</Text>
      </View>
    </Pressable>
  );
}
