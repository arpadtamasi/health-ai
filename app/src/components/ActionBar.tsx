// The short bar above the dock: what was just logged or changed, with Edit and Undo (US-01m3w51bzh8h6t8npn6k80r782 and
// US-01m3rvr6vsnzps8jrdz05gja1y), or that something could not be saved, with Try again and Drop it (EX-01m3y2snkn5ckbaackcpjvzysf).
import { Pressable, Text, View } from "react-native";
import { tokens as T } from "../theme/tokens";

export interface BarAction { label: string; onPress: () => void }

export function ActionBar({ text, error = false, actions }: { text: string; error?: boolean; actions: BarAction[] }) {
  const c = T.color;
  return (
    <View accessibilityLiveRegion="polite" style={{ marginHorizontal: 14, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 16,
      paddingLeft: 14, paddingRight: 6, minHeight: 48, backgroundColor: error ? c.error : c.onSurface }}>
      <Text numberOfLines={2} style={{ flex: 1, fontFamily: T.face.medium, fontSize: T.font.meta, color: c.table, ...T.numeric }}>{text}</Text>
      {actions.map((a) => (
        <Pressable key={a.label} accessibilityRole="button" onPress={a.onPress} style={{ minHeight: T.size.touch, justifyContent: "center", paddingHorizontal: 8 }}>
          <Text style={{ fontFamily: T.face.bold, fontSize: T.font.meta, color: c.table, textDecorationLine: "underline" }}>{a.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
