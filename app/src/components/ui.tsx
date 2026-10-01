import type { ReactNode } from "react";
import { Pressable, Text, View, type ViewStyle } from "react-native";
import { tokens as T } from "../theme/tokens";

const c = T.color;

export function Card({ children, tone = "low", pad = T.space.l, style }: { children: ReactNode; tone?: "low" | "warn" | "good"; pad?: number; style?: ViewStyle }) {
  const bg = { low: c.surfaceLow, warn: c.warn, good: c.good }[tone];
  return <View style={[{ backgroundColor: bg, borderRadius: T.radius.card, padding: pad }, style]}>{children}</View>;
}

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

export function Chip({ label, icon, selected = false, onPress }: { label: string; icon?: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}
      style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: T.radius.chip, borderWidth: 1, borderColor: selected ? c.primary : c.outline,
        backgroundColor: selected ? c.primaryContainer : c.surface }}>
      <Text style={{ fontSize: T.font.body, color: selected ? c.onPrimaryContainer : c.onSurface }}>{icon ? `${icon} ` : ""}{label}</Text>
    </Pressable>
  );
}

export function Banner({ children }: { children: ReactNode }) {
  return <View style={{ backgroundColor: c.primaryContainer, borderRadius: T.radius.card, padding: T.space.m }}>{children}</View>;
}
