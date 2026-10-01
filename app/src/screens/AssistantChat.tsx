// The chat, on assistant-ui's React Native primitives (docs: assistant-ui.com/docs/react-native), styled with our tokens.
// The runtime is a local one with a ChatModelAdapter that calls our /api/app/chat; the cards and the Undo are tool-call parts
// with our own components; the quick replies are assistant-ui suggestions that send on tap.
import { useEffect, useRef, useState } from "react";
import { Image, Platform, Pressable, Text, View } from "react-native";
import {
  AssistantRuntimeProvider, ComposerPrimitive, MessagePrimitive, ThreadPrimitive, useAui, useAuiState, useLocalRuntime,
  type ChatModelAdapter, type ChatModelRunResult,
} from "@assistant-ui/react-native";
import { ApiError, type ChatEvent, type Usual } from "../api/client";
import { backend } from "../backend";
import { Button, Chip } from "../components/ui";
import { OptionCard, type Option } from "../components/food";
import { UiIcon } from "../components/icons";
import { isLang, useT, type Lang, type Texts } from "../i18n";
import { tokens as T } from "../theme/tokens";

const c = T.color;

/** The adapter lives outside React, so the current texts and the language switch reach it through this box. */
const box: { t: Texts | null; setLang: (l: Lang) => void } = { t: null, setLang: () => undefined };

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
      if (isLang(r.language)) box.setLang(r.language);
      const replies = [...r.events].reverse().find((e): e is Extract<ChatEvent, { type: "replies" }> => e.type === "replies")?.replies;
      return { content: parts.length ? parts : [{ type: "text" as const, text: "…" }], metadata: { custom: { replies, needsConsent: r.needsConsent, onboarded: r.onboarded } satisfies Meta } };
    } catch (e) {
      const tx = box.t!;
      const msg = e instanceof ApiError && e.code === "daily_limit" ? tx.errDailyLimit : e instanceof ApiError && e.code === "ai_unavailable" ? tx.errUnavailable : tx.errGeneric;
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
  const { t } = useT();
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
            return <Bubble role="assistant"><Text style={{ color: c.onSurface, fontSize: T.font.base }}>{t.logged(r.name, r.kcal)}</Text><View style={{ marginTop: 6, alignSelf: "flex-start" }}><Chip label={t.undo} onPress={() => onUndo(r.id)} /></View></Bubble>;
          }
          return null;
        }}
      </MessagePrimitive.Parts>
    </MessagePrimitive.Root>
  );
}

export interface ChatProps {
  onboarded: boolean;
  usuals: Usual[];
  /** A photo taken on the Status (or from the chat's camera button): sent as the next message. */
  photo: { uri: string; base64: string } | null;
  onPhotoHandled: () => void;
  onCamera: () => void;
  /** Back to the Status. Only offered once the person is set up. */
  onStatus: () => void;
  /** Something was logged or undone: the Status has to read the day again. */
  onChanged: () => void;
  /** The first conversation finished and the person is set up. */
  onReady: () => void;
}

function Inner({ onboarded, usuals, photo, onPhotoHandled, onCamera, onStatus, onChanged, onReady }: ChatProps) {
  const { t, setLang } = useT();
  box.t = t;
  box.setLang = setLang;
  const aui = useAui();
  const meta = useAuiState((s) => {
    const m = s.thread.messages[s.thread.messages.length - 1];
    return (m?.metadata?.custom ?? {}) as Meta;
  });
  const [ready, setReady] = useState(onboarded);
  const [consented, setConsented] = useState(false);

  useEffect(() => { if (meta.onboarded && !ready) { setReady(true); onReady(); } }, [meta.onboarded, ready, onReady]);
  // Whatever the chat did (a logged meal, a saved setting) may have changed the day: the Status reads it again. The callback is
  // kept in a ref so that a new function from the parent cannot retrigger this effect.
  const count = useAuiState((st) => st.thread.messages.length);
  const changed = useRef(onChanged);
  changed.current = onChanged;
  useEffect(() => { if (ready && count > 1) changed.current(); }, [count, ready]);

  useEffect(() => {
    if (!photo) return;
    aui.thread().append({ role: "user", content: [{ type: "image", image: `data:image/jpeg;base64,${photo.base64}` }, { type: "text", text: t.photoQuestion }] });
    onPhotoHandled();
  }, [photo, aui, t, onPhotoHandled]);

  const choose = async (o: Option) => {
    try {
      const { id } = await backend.log(o);
      aui.thread().append({ role: "assistant", content: [{ type: "tool-call", toolCallId: `log-${Date.now()}`, toolName: "logged", args: {}, argsText: "{}", result: { name: o.name, kcal: o.kcal, id } }] });
      onChanged();
    } catch { /* the card stays; the person can tap again */ }
  };
  const undo = async (id: string | null) => {
    if (!id) return;
    try {
      await backend.unlog(id);
      aui.thread().append({ role: "assistant", content: [{ type: "text", text: t.undone }] });
      onChanged();
    } catch { aui.thread().append({ role: "assistant", content: [{ type: "text", text: t.undoFailed }] }); }
  };

  const replies = meta.replies?.length ? meta.replies : (ready ? [] : t.firstReplies);
  const showConsent = meta.needsConsent && !consented;

  return (
    <View style={{ flex: 1, backgroundColor: c.surface, paddingHorizontal: T.space.xl, paddingTop: T.space.m, gap: T.space.m }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 48 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: T.space.m }}>
          {ready ? (
            <Pressable accessibilityRole="button" accessibilityLabel={t.status} onPress={onStatus}><UiIcon name="arrow-left" size={22} color={c.onSurface} /></Pressable>
          ) : (
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}><UiIcon name="heart" size={18} color={c.onPrimary} filled /></View>
          )}
          <Text style={{ fontSize: 18, fontWeight: "600", color: c.onSurface }}>{ready ? t.chat : t.appName}</Text>
        </View>
        {ready ? (
          <Pressable accessibilityRole="button" onPress={onStatus} style={{ backgroundColor: c.surfaceLow, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: c.onSurface }}>{t.status}</Text>
          </Pressable>
        ) : null}
      </View>
      <ThreadPrimitive.Root style={{ flex: 1 }}>
        <ThreadPrimitive.MessagesFlatList autoScroll style={{ flex: 1 }} contentContainerStyle={{ gap: T.space.s, paddingBottom: T.space.m }}>
          {() => <Message onChoose={(o) => void choose(o)} onUndo={(id) => void undo(id)} />}
        </ThreadPrimitive.MessagesFlatList>
        {showConsent ? (
          <View style={{ gap: T.space.s, backgroundColor: c.surfaceLow, borderRadius: T.radius.card, padding: T.space.l }}>
            <Text style={{ fontSize: T.font.body, color: c.onSurface }}>{t.consentText}</Text>
            <Button label={t.consentButton} onPress={() => void backend.consent().then(() => { setConsented(true); setReady(true); onReady(); })} />
          </View>
        ) : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: T.space.s, paddingVertical: T.space.s }}>
          {replies.map((r) => (
            <ThreadPrimitive.Suggestion key={r} prompt={r} send style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: T.radius.chip, borderWidth: 1, borderColor: c.outline, backgroundColor: c.surface }}>
              <Text style={{ fontSize: T.font.body, color: c.onSurface }}>{r}</Text>
            </ThreadPrimitive.Suggestion>
          ))}
          {ready && !replies.length ? (
            <ThreadPrimitive.Suggestion prompt={t.whatNow} send style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: T.radius.chip, borderWidth: 1, borderColor: c.primary, backgroundColor: c.primaryContainer }}>
              <Text style={{ fontSize: T.font.body, color: c.onPrimaryContainer }}>{t.whatNow}</Text>
            </ThreadPrimitive.Suggestion>
          ) : null}
          {ready && !replies.length ? usuals.map((u) => <Chip key={u.name} label={u.name} onPress={() => void choose({ rank: 0, name: u.name, category: "other", kcal: u.kcal, carbs: u.carbs, protein: u.protein })} />) : null}
        </View>
        <ComposerPrimitive.Root style={{ flexDirection: "row", alignItems: "flex-end", gap: T.space.s }}>
          <Pressable accessibilityRole="button" accessibilityLabel={t.openCamera} onPress={onCamera}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.primaryContainer, alignItems: "center", justifyContent: "center" }}>
            <UiIcon name="camera" size={22} color={c.onPrimaryContainer} />
          </Pressable>
          <ComposerPrimitive.Input placeholder={t.placeholder} multiline placeholderTextColor={c.onSurfaceVariant}
            style={[{ flex: 1, backgroundColor: c.surfaceHigh, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, minHeight: 44, maxHeight: 120, fontSize: T.font.base, color: c.onSurface }, Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : null]} />
          <ComposerPrimitive.Send style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}>
            <UiIcon name="arrow-up" size={20} color={c.onPrimary} />
          </ComposerPrimitive.Send>
        </ComposerPrimitive.Root>
      </ThreadPrimitive.Root>
    </View>
  );
}

export function AssistantChat(props: ChatProps) {
  const { t } = useT();
  box.t = t;
  const runtime = useLocalRuntime(adapter, {
    initialMessages: [{ role: "assistant", content: [{ type: "text", text: props.onboarded ? t.greetReady : t.greetSetup }] }],
  });
  return <AssistantRuntimeProvider runtime={runtime}><Inner {...props} /></AssistantRuntimeProvider>;
}
