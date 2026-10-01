import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { ApiError, type ChatEvent, type DayState } from "../api/client";
import { backend } from "../backend";
import { Button, Chip } from "../components/ui";
import { OptionCard, type Option } from "../components/food";
import { CameraInput, ChatBubble, PaceStrip, PhotoBubble, type PaceItem } from "../components/chat";
import { UiIcon } from "../components/icons";
import { pace } from "../pace";
import { usuals } from "../data/mock";
import { tokens as T } from "../theme/tokens";
import { CameraScreen } from "./CameraScreen";

// US-01m3rw2bqxkqp6v1hg9g02t1zr (Ask and log through a small chat): the chat is an AI conversation. The first conversation sets
// the person up (foods to avoid, the calorie goal, the eating window); after that it suggests food, logs meals and answers.
type Msg =
  | { id: number; kind: "text"; from: "assistant" | "user"; text: string }
  | { id: number; kind: "photo"; uri: string; text: string }
  | { id: number; kind: "options"; options: Option[] }
  | { id: number; kind: "undo"; entryId: string | null };

const MOCK = process.env.EXPO_PUBLIC_MOCK === "1";
const GREETING = "Hi! I help you decide what to eat, from what you already ate today. First, a short setup: is there anything I should never suggest, like an allergy or something you dislike?";
const READY = "Hi! Ask me what to eat, tell me what you ate, or show me a photo.";

export function ChatScreen({ onboarded, onSignedOut }: { onboarded: boolean; onSignedOut: () => void }) {
  const nextId = useRef(1);
  const id = () => nextId.current++;
  const [ready, setReady] = useState(onboarded);
  const [needsConsent, setNeedsConsent] = useState(false);
  const [state, setState] = useState<DayState | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ id: 0, kind: "text", from: "assistant", text: onboarded ? READY : GREETING }]);
  const scroller = useRef<ScrollView>(null);

  const add = useCallback((...m: Msg[]) => {
    setMessages((prev) => [...prev, ...m]);
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 50);
  }, []);
  const say = (text: string): Msg => ({ id: id(), kind: "text", from: "assistant", text });

  const loadState = useCallback(async () => {
    try { setState(await backend.state()); } catch (e) { if (e instanceof ApiError && e.status === 401) onSignedOut(); }
  }, [onSignedOut]);
  useEffect(() => { if (ready) void loadState(); }, [ready, loadState]);

  const items: PaceItem[] = useMemo(() => {
    if (!state) return [];
    const raw = [
      { label: "Calories", unit: "", goal: state.goals.calories, result: pace(state.goals.calories, state.eaten.calories, state.minutes, state.window) },
      { label: "Carbs", unit: " g", goal: state.goals.carbs, result: pace(state.goals.carbs, state.eaten.carbs, state.minutes, state.window) },
      { label: "Protein", unit: " g", goal: state.goals.protein, result: pace(state.goals.protein, state.eaten.protein, state.minutes, state.window) },
    ];
    // Highlight the one furthest behind relative to its own goal, so grams and kilocalories compare fairly.
    const rel = (i: (typeof raw)[number]) => i.result.gap / i.goal;
    const worst = [...raw].sort((a, b) => rel(a) - rel(b))[0]!;
    return raw.map(({ goal: _goal, ...i }) => ({ ...i, highlight: i === worst && i.result.behind }));
  }, [state]);

  const apply = useCallback((events: ChatEvent[]) => {
    const out: Msg[] = [];
    for (const e of events) {
      if (e.type === "text") out.push({ id: id(), kind: "text", from: "assistant", text: e.text });
      else if (e.type === "options") out.push({ id: id(), kind: "options", options: e.options });
      else if (e.type === "logged") out.push({ id: id(), kind: "undo", entryId: e.id });
    }
    if (out.length) add(...out);
  }, [add]);

  const talk = async (message: string, image?: { mediaType: "image/jpeg"; dataBase64: string }) => {
    setBusy(true);
    // The conversation so far, as text only: the cards and the photos are not sent back.
    const history = messages.flatMap((m) => (m.kind === "text" ? [{ role: m.from, text: m.text }] : []));
    try {
      const r = await backend.chat({ message, history, ...(image ? { image } : {}) });
      apply(r.events);
      setNeedsConsent(r.needsConsent);
      if (r.onboarded && !ready) setReady(true);
      if (r.events.some((e) => e.type === "settings_saved" || e.type === "logged")) await loadState();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) onSignedOut();
      else if (e instanceof ApiError && e.code === "daily_limit") add(say("Daily limit reached. The chat and the camera are back tomorrow. Your pace still works."));
      else if (e instanceof ApiError && e.code === "ai_unavailable") add(say("The chat is not available right now."));
      else add(say("Something went wrong. Please try again."));
    } finally { setBusy(false); }
  };

  const send = (text = draft) => {
    const t = text.trim();
    if (!t || busy) return;
    setDraft("");
    add({ id: id(), kind: "text", from: "user", text: t });
    void talk(t);
  };

  const photo = (p: { uri: string; base64: string }) => {
    setCameraOpen(false);
    add({ id: id(), kind: "photo", uri: p.uri, text: "What can I eat from this?" });
    void talk("What can I eat from this?", { mediaType: "image/jpeg", dataBase64: p.base64 });
  };

  const choose = async (o: Option) => {
    if (busy) return;
    setBusy(true);
    try {
      const { id: entryId } = await backend.log(o);
      add(say(`Logged ${o.name} (${o.kcal} kcal).`), { id: id(), kind: "undo", entryId });
      await loadState();
    } catch { add(say("I could not log that. Please try again.")); } finally { setBusy(false); }
  };

  const undo = async (entryId: string | null, msgId: number) => {
    if (entryId) { try { await backend.unlog(entryId); } catch { add(say("I could not undo that.")); return; } }
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    add(say("Undone."));
    await loadState();
  };

  const agree = async () => {
    try {
      await backend.consent();
      setNeedsConsent(false);
      setReady(true);
      add(say("Thanks, you are all set. Ask me what to eat, tell me what you ate, or show me a photo."));
    } catch { add(say("I could not save that. Please try again.")); }
  };

  if (cameraOpen) return <CameraScreen onCapture={photo} onCancel={() => setCameraOpen(false)} />;

  return (
    <View style={{ flex: 1, backgroundColor: T.color.surface, paddingHorizontal: T.space.xl, paddingTop: T.space.m, gap: T.space.m }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: T.space.m, height: 48 }}>
        <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: T.color.primary, alignItems: "center", justifyContent: "center" }}>
          <UiIcon name="heart" size={18} color={T.color.onPrimary} filled />
        </View>
        <Text style={{ fontSize: 18, fontWeight: "600", color: T.color.onSurface }}>Health AI</Text>
      </View>
      {items.length ? <PaceStrip items={items} /> : null}
      <ScrollView ref={scroller} contentContainerStyle={{ gap: T.space.m, paddingBottom: T.space.m }} style={{ flex: 1 }}>
        {messages.map((m) => {
          if (m.kind === "text") return <ChatBubble key={m.id} from={m.from} text={m.text} />;
          if (m.kind === "photo") return <PhotoBubble key={m.id} uri={m.uri} text={m.text} />;
          if (m.kind === "options") return <View key={m.id} style={{ gap: T.space.s }}>{m.options.map((o) => <OptionCard key={o.rank} option={o} primary={o.rank === 1} onChoose={(x) => void choose(x)} />)}</View>;
          return <View key={m.id} style={{ alignSelf: "flex-start" }}><Chip label="Undo" onPress={() => void undo(m.entryId, m.id)} /></View>;
        })}
        {needsConsent ? (
          <View style={{ gap: T.space.s, backgroundColor: T.color.surfaceLow, borderRadius: T.radius.card, padding: T.space.l }}>
            <Text style={{ fontSize: T.font.body, color: T.color.onSurface }}>
              I am a tracker and suggestion aid for adults, not medical advice. By continuing you agree that your chat and photos go to the AI provider.
            </Text>
            <Button label="Agree and continue" onPress={() => void agree()} />
          </View>
        ) : null}
        {busy ? <ChatBubble text="…" /> : null}
      </ScrollView>
      <View style={{ gap: T.space.s }}>
        {ready ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: T.space.s }}>
            <Chip label="What should I eat now?" selected onPress={() => send("What should I eat now?")} />
            {MOCK ? usuals.map((u) => <Chip key={u.label} label={u.label} icon={u.category} />) : null}
          </View>
        ) : null}
        <CameraInput value={draft} onChangeText={setDraft} onSend={() => send()} onCamera={() => setCameraOpen(true)} disabled={busy || needsConsent} />
      </View>
    </View>
  );
}
