import type React from "react";
import { Pressable, Text, View } from "react-native";
import { tokens as T } from "../theme/tokens";
import { FoodIcon, UiIcon, type FoodCategory, type UiIconName } from "./icons";

const c = T.color;

/** BR-01m6pmf9avbbgd373z1jcvvaqw and the dock: the 44 px round control (camera, Send, Stop, the conversation, steppers). `primary` is
 * an action (green), `strong` stops something, `quiet` is a ceramic circle with a hairline. */
export function RoundButton({ label, onPress, tone = "primary", icon, expanded, children }:
  { label: string; onPress: () => void; tone?: "primary" | "strong" | "quiet"; icon?: UiIconName; expanded?: boolean; children?: React.ReactNode }) {
  const fg = tone === "quiet" ? c.onSurface : tone === "strong" ? c.onStrong : c.onPrimary;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} {...(expanded !== undefined ? { accessibilityState: { expanded } } : {})} onPress={onPress}
      style={{ width: T.size.touch, height: T.size.touch, borderRadius: T.size.touch / 2, alignItems: "center", justifyContent: "center",
        backgroundColor: tone === "primary" ? c.primary : tone === "strong" ? c.strong : c.surface, borderWidth: tone === "quiet" ? 1 : 0, borderColor: c.outline }}>
      {icon ? <UiIcon name={icon} size={20} color={fg} /> : children}
    </Pressable>
  );
}

/** A ceramic card on the cloth: a logged entry, a notice, the folded plate. A function, because the palette switches in place. */
export const cardStyle = () => ({ backgroundColor: c.surface, borderWidth: 1, borderColor: c.outline, borderRadius: 16 }) as const;

export function Button({ label, onPress, kind = "primary", disabled = false }: { label: string; onPress?: () => void; kind?: "primary" | "text"; disabled?: boolean }) {
  const primary = kind === "primary";
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
      style={{ minHeight: T.size.button, borderRadius: T.radius.button, alignItems: "center", justifyContent: "center", paddingHorizontal: T.space.xl,
        backgroundColor: primary ? c.primary : "transparent", opacity: disabled ? 0.5 : 1 }}>
      <Text style={{ color: primary ? c.onPrimary : c.primary, fontFamily: T.face.semi, fontSize: T.font.body }}>{label}</Text>
    </Pressable>
  );
}

/** A pill, at least 44 px tall: the dock and the card actions are what a thumb hits ten times a day. */
export function Chip({ label, icon, ui, selected = false, onPress, tone = "neutral" }: { label: string; icon?: FoodCategory; ui?: UiIconName; selected?: boolean; onPress?: () => void; tone?: "neutral" | "danger" }) {
  const fg = selected ? c.onPrimaryContainer : tone === "danger" ? c.error : c.onSurface;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress}
      style={{ minHeight: T.size.touch, maxWidth: 220, flexShrink: 0, paddingHorizontal: 16, borderRadius: T.radius.chip, borderWidth: 1, justifyContent: "center",
        borderColor: selected ? c.primaryContainer : c.outline, backgroundColor: selected ? c.primaryContainer : c.surface }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {icon ? <FoodIcon category={icon} size={16} color={fg} /> : ui ? <UiIcon name={ui} size={16} color={fg} /> : null}
        <Text numberOfLines={1} style={{ fontFamily: selected ? T.face.semi : T.face.body, fontSize: T.font.meta, color: fg }}>{label}</Text>
      </View>
    </Pressable>
  );
}
