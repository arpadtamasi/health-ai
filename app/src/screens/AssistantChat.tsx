// SPIKE: the same chat on assistant-ui's React Native primitives (docs: assistant-ui.com/docs/react-native), styled with our tokens.
// The runtime is a local one with a ChatModelAdapter that calls our /api/app/chat; the cards and the Undo are tool-call parts
// with our own components; the quick replies are assistant-ui suggestions that send on tap. Compare with ChatScreen.tsx.
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Platform, Pressable, Text, View } from "react-native";
import {
  AssistantRuntimeProvider, ComposerPrimitive, MessagePrimitive, ThreadPrimitive, useAui, useAuiState, useLocalRuntime,
  type ChatModelAdapter, type ChatModelRunResult,
} from "@assistant-ui/react-native";
import { ApiError, type ChatEvent, type DayState } from "../api/client";
import { backend } from "../backend";
import { Button, Chip } from "../components/ui";
import { OptionCard, type Option } from "../components/food";
import { PaceStrip, type PaceItem } from "../components/chat";
import { UiIcon } from "../components/icons";
import { pace } from "../pace";
import { tokens as T } from "../theme/tokens";
import { CameraScreen } from "./CameraScreen";

const c = T.color;
const FIRST_REPLIES = ["None", "Nuts", "Lactose", "Gluten"];

interface Meta { replies?: string[]; needsConsent?: boolean; onboarded?: boolean }

/** Our /api/app/chat as an assistant-ui model: events become message parts, the rest rides along as metadata. */
const adapter: ChatModelAdapter = {
  async run({ messages }) {
    const last = messages[messages.length - 1];
    const text = last?.content.filter((p) => p.type === "text").map((p) => (p as { text: string }).text).join(" ") ?? "";
    const imagePart = last?.content.find((p) => p.type === "image") as { image: string } | undefined;
    const history = messages.slice(0, -1).flatMap((m) => {
      const t = m.content.filter((p) => p.type === "text").map((p) => (p as { text: string }).text).join(" ");
      return t ? [{ role: m.role === "user" ? ("user" as const) : ("assistant" as const), text: t }] : [];
    });
    const base64 = imagePart?.image.startsWith("data:") ? imagePart.image.split(",")[1] : undefined;
    try {
      const r = await backend.chat({ message: text, history, ...(base64 ? { image: { mediaType: "image/jpeg" as const, dataBase64: base64 } } : {}) });
      const parts: NonNullable<ChatModelRunResult["content"]>[number][] = [];
      r.events.forEach((e: ChatEvent, i) => {
        if (e.type === "text") parts.push({ type: "text", text: e.text });
        else if (e.type === "options") parts.push({ type: "tool-call", toolCallId: `opts-${i}`, toolName: "show_options", args: {}, argsText: "{}", result: e.options });
        else if (e.type === "logged") parts.push({ type: "tool-call", toolCallId: `log-${i}`, toolName: "logged", args: {}, argsText: "{}", result: { name: e.name, kcal: e.kcal, id: e.id } });
      });
      const replies = [...r.events].reverse().find((e): e is Extract<ChatEvent, { type: "replies" }> => e.type === "replies")?.replies;
      return { content: parts.length ? parts : [{ type: "text" as const, text: "…" }], metadata: { custom: { replies, needsConsent: r.needsConsent, onboarded: r.onboarded } satisfies Meta } };
    } catch (e) {
      const msg = e instanceof ApiError && e.code === "daily_limit" ? "Daily limit reached. The chat and the camera are back tomorrow."
        : e instanceof ApiError && e.code === "ai_unavailable" ? "The chat is not available right now." : "Something went wrong. Please try again.";
      return { content: [{ type: "text" as const, text: msg }] };
    }
  },
};

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const user = role === "user";
  return (
    <View style={{ alignSelf: user ? "flex-end" : "flex-start", maxWidth: "86%", paddingVertical: 10, paddingHorizontal: 14, backgroundColor: user ? c.primary : c.surfaceLow,
      borderRadius: 18, borderBottomRightRadius: user ? 4 : 18, borderBottomLeftRadius: user ? 18 : 4 }}>
      {children}
    </View>
  );
}

function OptionsPart({ result, onChoose }: { result: unknown; onChoose: (o: Option) => void }) {
  const options = (result as Option[] | undefined) ?? [];
  return <View style={{ gap: T.space.s, alignSelf: "stretch" }}>{options.map((o) => <OptionCard key={o.rank} option={o} primary={o.rank === 1} onChoose={onChoose} />)}</View>;
}

function Message({ onChoose, onUndo }: { onChoose: (o: Option) => void; onUndo: (id: string | null) => void }) {
  const role = useAuiState((s) => s.message.role);
  return (
    <MessagePrimitive.Root style={{ paddingVertical: T.space.xs, gap: T.space.s }}>
      <MessagePrimitive.Parts>
        {({ part }) => {
          if (part.type === "text") return <Bubble role={role === "user" ? "user" : "assistant"}><Text style={{ color: role === "user" ? c.onPrimary : c.onSurface, fontSize: T.font.base }}>{part.text}</Text></Bubble>;
          if (part.type === "image") return <Bubble role="user"><Image source={{ uri: part.image }} style={{ width: 200, height: 120, borderRadius: 14 }} /></Bubble>;
          if (part.type === "tool-call" && part.toolName === "show_options") return <OptionsPart result={part.result} onChoose={onChoose} />;
          if (part.type === "tool-call" && part.toolName === "logged") {
            const r = part.result as { name: string; kcal: number; id: string | null };
            return <Bubble role="assistant"><Text style={{ color: c.onSurface, fontSize: T.font.base }}>Logged {r.name} ({r.kcal} kcal).</Text><View style={{ marginTop: 6, alignSelf: "flex-start" }}><Chip label="Undo" onPress={() => onUndo(r.id)} /></View></Bubble>;
          }
          return null;
        }}
      </MessagePrimitive.Parts>
    </MessagePrimitive.Root>
  );
}

function Inner({ onboarded, onSignedOut }: { onboarded: boolean; onSignedOut: () => void }) {
  const aui = useAui();
  const [state, setState] = useState<DayState | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const meta = useAuiState((s) => {
    const m = s.thread.messages[s.thread.messages.length - 1];
    return (m?.metadata?.custom ?? {}) as Meta;
  });
  const [ready, setReady] = useState(onboarded);
  const [consented, setConsented] = useState(false);

  const loadState = useCallback(async () => {
    try { setState(await backend.state()); } catch (e) { if (e instanceof ApiError && e.status === 401) onSignedOut(); }
  }, [onSignedOut]);
  useEffect(() => { if (ready) void loadState(); }, [ready, loadState]);
  useEffect(() => { if (meta.onboarded) setReady(true); }, [meta.onboarded]);

  const items: PaceItem[] = useMemo(() => {
    if (!state) return [];
    const raw = [
      { label: "Calories", unit: "", goal: state.goals.calories, result: pace(state.goals.calories, state.eaten.calories, state.minutes, state.window) },
      { label: "Carbs", unit: " g", goal: state.goals.carbs, result: pace(state.goals.carbs, state.eaten.carbs, state.minutes, state.window) },
      { label: "Protein", unit: " g", goal: state.goals.protein, result: pace(state.goals.protein, state.eaten.protein, state.minutes, state.window) },
    ];
    const rel = (i: (typeof raw)[number]) => i.result.gap / i.goal;
    const worst = [...raw].sort((a, b) => rel(a) - rel(b))[0]!;
    return raw.map(({ goal: _goal, ...i }) => ({ ...i, highlight: i === worst && i.result.behind }));
  }, [state]);

  const choose = async (o: Option) => {
    try {
      const { id } = await backend.log(o);
      aui.thread().append({ role: "assistant", content: [{ type: "tool-call", toolCallId: `log-${Date.now()}`, toolName: "logged", args: {}, argsText: "{}", result: { name: o.name, kcal: o.kcal, id } }] });
      await loadState();
    } catch { /* the card stays; the person can tap again */ }
  };
  const undo = async (id: string | null) => { if (id) { try { await backend.unlog(id); await loadState(); } catch { /* ignore */ } } };

  const photo = (p: { uri: string; base64: string }) => {
    setCameraOpen(false);
    aui.thread().append({ role: "user", content: [{ type: "image", image: `data:image/jpeg;base64,${p.base64}` }, { type: "text", text: "What can I eat from this?" }] });
  };

  if (cameraOpen) return <CameraScreen onCapture={photo} onCancel={() => setCameraOpen(false)} />;

  const replies = meta.replies?.length ? meta.replies : (ready ? [] : FIRST_REPLIES);
  const showConsent = meta.needsConsent && !consented;

  return (
    <View style={{ flex: 1, backgroundColor: c.surface, paddingHorizontal: T.space.xl, paddingTop: T.space.m, gap: T.space.m }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: T.space.m, height: 48 }}>
        <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}><UiIcon name="heart" size={18} color={c.onPrimary} filled /></View>
        <Text style={{ fontSize: 18, fontWeight: "600", color: c.onSurface }}>Health AI</Text>
      </View>
      {items.length ? <PaceStrip items={items} /> : null}
      <ThreadPrimitive.Root style={{ flex: 1 }}>
        <ThreadPrimitive.MessagesFlatList autoScroll style={{ flex: 1 }} contentContainerStyle={{ gap: T.space.s, paddingBottom: T.space.m }}>
          {() => <Message onChoose={(o) => void choose(o)} onUndo={(id) => void undo(id)} />}
        </ThreadPrimitive.MessagesFlatList>
        {showConsent ? (
          <View style={{ gap: T.space.s, backgroundColor: c.surfaceLow, borderRadius: T.radius.card, padding: T.space.l }}>
            <Text style={{ fontSize: T.font.body, color: c.onSurface }}>I am a tracker and suggestion aid for adults, not medical advice. By continuing you agree that your chat and photos go to the AI provider.</Text>
            <Button label="Agree and continue" onPress={() => void backend.consent().then(() => { setConsented(true); setReady(true); })} />
          </View>
        ) : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: T.space.s, paddingVertical: T.space.s }}>
          {replies.map((r) => (
            <ThreadPrimitive.Suggestion key={r} prompt={r} send style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: T.radius.chip, borderWidth: 1, borderColor: c.outline, backgroundColor: c.surface }}>
              <Text style={{ fontSize: T.font.body, color: c.onSurface }}>{r}</Text>
            </ThreadPrimitive.Suggestion>
          ))}
          {ready && !replies.length ? (
            <ThreadPrimitive.Suggestion prompt="What should I eat now?" send style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: T.radius.chip, borderWidth: 1, borderColor: c.primary, backgroundColor: c.primaryContainer }}>
              <Text style={{ fontSize: T.font.body, color: c.onPrimaryContainer }}>What should I eat now?</Text>
            </ThreadPrimitive.Suggestion>
          ) : null}
        </View>
        <ComposerPrimitive.Root style={{ flexDirection: "row", alignItems: "flex-end", gap: T.space.s }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Open the camera" onPress={() => setCameraOpen(true)}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.primaryContainer, alignItems: "center", justifyContent: "center" }}>
            <UiIcon name="camera" size={22} color={c.onPrimaryContainer} />
          </Pressable>
          <ComposerPrimitive.Input placeholder="Write or speak…" multiline placeholderTextColor={c.onSurfaceVariant}
            style={[{ flex: 1, backgroundColor: c.surfaceHigh, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 120, fontSize: T.font.base, color: c.onSurface }, Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : null]} />
          <ComposerPrimitive.Send style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}>
            <UiIcon name="arrow-up" size={20} color={c.onPrimary} />
          </ComposerPrimitive.Send>
        </ComposerPrimitive.Root>
      </ThreadPrimitive.Root>
    </View>
  );
}

export function AssistantChat({ onboarded, onSignedOut }: { onboarded: boolean; onSignedOut: () => void }) {
  const runtime = useLocalRuntime(adapter, {
    initialMessages: [{ role: "assistant", content: [{ type: "text", text: onboarded
      ? "Hi! Ask me what to eat, tell me what you ate, or show me a photo."
      : "Hi! I help you decide what to eat, from what you already ate today. First, a short setup: is there anything I should never suggest, like an allergy or something you dislike?" }] }],
  });
  return <AssistantRuntimeProvider runtime={runtime}><Inner onboarded={onboarded} onSignedOut={onSignedOut} /></AssistantRuntimeProvider>;
}
