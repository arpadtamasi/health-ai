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
      <Text style={{ color: primary ? c.onPrimary : c.primary, fontWeight: "600", fontSize: T.font.base }}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, icon, selected = false, onPress }: { label: string; icon?: FoodCategory; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}
      style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: T.radius.chip, borderWidth: 1, borderColor: selected ? c.primary : c.outline,
        backgroundColor: selected ? c.primaryContainer : c.surface }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {icon ? <FoodIcon category={icon} size={16} color={selected ? c.onPrimaryContainer : c.onSurface} /> : null}
        <Text style={{ fontSize: T.font.body, color: selected ? c.onPrimaryContainer : c.onSurface }}>{label}</Text>
      </View>
    </Pressable>
  );
}

