import { Image, Pressable, Text, TextInput, View } from "react-native";
import { tokens as T } from "../theme/tokens";
import type { PaceResult } from "../pace";

const c = T.color;

export function ChatBubble({ text, from = "assistant" }: { text: string; from?: "assistant" | "user" }) {
  const user = from === "user";
  return (
    <View style={{ alignSelf: user ? "flex-end" : "flex-start", maxWidth: "86%", paddingVertical: 10, paddingHorizontal: 14,
      backgroundColor: user ? c.primary : c.surfaceLow, borderRadius: 18, borderBottomRightRadius: user ? 4 : 18, borderBottomLeftRadius: user ? 18 : 4 }}>
      <Text style={{ color: user ? c.onPrimary : c.onSurface, fontSize: T.font.base }}>{text}</Text>
    </View>
  );
}

export function PhotoBubble({ uri, text }: { uri: string; text: string }) {
  return (
    <View style={{ alignSelf: "flex-end", maxWidth: "78%", padding: 6, backgroundColor: c.primary, borderRadius: 18, borderBottomRightRadius: 4 }}>
      <Image source={{ uri }} accessibilityLabel="Your photo" style={{ width: 200, height: 120, borderRadius: 14 }} />
      <Text style={{ color: c.onPrimary, fontSize: T.font.base, padding: 8 }}>{text}</Text>
    </View>
  );
}

export interface PaceItem { label: string; unit: string; result: PaceResult; highlight?: boolean }

// US-01m3rvr64zrzczabckjf6crb2z: the pace strip stays on top of the chat.
export function PaceStrip({ items }: { items: PaceItem[] }) {
  return (
    <View style={{ flexDirection: "row", gap: T.space.m, backgroundColor: c.surfaceLow, borderRadius: T.radius.card, padding: T.space.m }}>
      {items.map(({ label, unit, result, highlight }) => (
        <View key={label} style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: T.font.overline, color: c.onSurfaceVariant }}>{label}</Text>
            <Text style={{ fontSize: T.font.overline, fontWeight: "700", color: highlight ? c.warn : c.onSurfaceVariant }}>
              {result.gap > 0 ? "+" : "−"}{Math.abs(result.gap)}{unit}
            </Text>
          </View>
          <View style={{ marginTop: 4, height: 6, borderRadius: 3, backgroundColor: c.surfaceHigh }}>
            <View style={{ width: `${Math.round(result.eatenFraction * 100)}%`, height: 6, borderRadius: 3, backgroundColor: highlight ? c.behind : c.good }} />
            <View style={{ position: "absolute", left: `${Math.round(result.planFraction * 100)}%`, top: -3, width: 2, height: 12, backgroundColor: c.onSurface }} />
          </View>
        </View>
      ))}
    </View>
  );
}

// US-01m3rw2bqxkqp6v1hg9g02t1zr (Ask and log through a small chat): the chat is the base, the camera button sits in its input bar.
export function CameraInput({ value, onChangeText, onSend, onCamera, placeholder = "Write or speak…", disabled = false }:
  { value: string; onChangeText: (t: string) => void; onSend: () => void; onCamera: () => void; placeholder?: string; disabled?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: T.space.s }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Open the camera" disabled={disabled} onPress={onCamera}
        style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: c.primaryContainer, opacity: disabled ? 0.5 : 1 }}>
        <Text style={{ fontSize: 22 }}>📷</Text>
      </Pressable>
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: c.surfaceHigh, borderRadius: 28, paddingLeft: 16, paddingRight: 5, paddingVertical: 5 }}>
        <TextInput value={value} onChangeText={onChangeText} onSubmitEditing={onSend} placeholder={placeholder} editable={!disabled}
          placeholderTextColor={c.onSurfaceVariant} style={{ flex: 1, fontSize: T.font.base, color: c.onSurface }} />
        <Pressable accessibilityRole="button" accessibilityLabel="Send" disabled={disabled} onPress={onSend}
          style={{ width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: disabled ? c.outline : c.primary }}>
          <Text style={{ color: c.onPrimary, fontSize: 18 }}>↑</Text>
        </Pressable>
      </View>
    </View>
  );
}
