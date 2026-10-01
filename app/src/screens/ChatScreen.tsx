import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { ApiError, type DayState } from "../api/client";
import { backend } from "../backend";
import { Chip } from "../components/ui";
import { OptionCard, type Option } from "../components/food";
import { CameraInput, ChatBubble, PaceStrip, PhotoBubble, type PaceItem } from "../components/chat";
import { pace } from "../pace";
import { usuals } from "../data/mock";
import { foodIcons, tokens as T } from "../theme/tokens";
import { CameraScreen } from "./CameraScreen";

type Msg =
  | { id: number; kind: "text"; from: "assistant" | "user"; text: string }
  | { id: number; kind: "photo"; uri: string; text: string }
  | { id: number; kind: "options"; options: Option[] }
  | { id: number; kind: "undo"; entryId: string | null };

const MOCK = process.env.EXPO_PUBLIC_MOCK === "1";

const FLOOR_TEXT = "Your calorie goal is below 1,200 kcal, so I will not plan meals. Change the goal in chat, or ask a professional.";

export function ChatScreen({ onNeedOnboarding, onSignedOut }: { onNeedOnboarding: () => void; onSignedOut: () => void }) {
  const nextId = useRef(1);
  const id = () => nextId.current++;
  const [state, setState] = useState<DayState | null>(null);
  const [draft, setDraft] = useState("");
  const [awaitingOptions, setAwaitingOptions] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ id: 0, kind: "text", from: "assistant", text: "Hi! Ask me what to eat, tell me what you ate, or show me a photo." }]);
  const scroller = useRef<ScrollView>(null);

  const add = useCallback((...m: Msg[]) => {
    setMessages((prev) => [...prev, ...m]);
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 50);
  }, []);
  const say = (text: string): Msg => ({ id: id(), kind: "text", from: "assistant", text });

  const handleError = useCallback((e: unknown) => {
    if (e instanceof ApiError) {
      if (e.status === 401) return onSignedOut();
      if (e.code === "onboarding_required") return onNeedOnboarding();
      if (e.code === "daily_limit") return add({ id: id(), kind: "text", from: "assistant", text: "Daily limit reached. Suggestions and the camera are back tomorrow. Your pace still works." });
      if (e.code === "ai_unavailable") return add({ id: id(), kind: "text", from: "assistant", text: "Suggestions are not available right now." });
    }
    add({ id: id(), kind: "text", from: "assistant", text: "Something went wrong. Please try again." });
  }, [add, onNeedOnboarding, onSignedOut]);

  const load = useCallback(async () => {
    try { setState(await backend.state()); } catch (e) { handleError(e); }
  }, [handleError]);
  useEffect(() => { void load(); }, [load]);

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

  const runWhatNow = async (input: Parameters<typeof backend.whatNow>[0]) => {
    setBusy(true);
    setAwaitingOptions(false);
    try {
      const r = await backend.whatNow(input);
      if (r.kind === "options") {
        const worst = items.find((i) => i.highlight);
        add(say(`${worst ? `You are ${Math.abs(worst.result.gap)}${worst.unit} behind on ${worst.label.toLowerCase()}. ` : ""}Tap the one you choose:`), { id: id(), kind: "options", options: r.options });
      } else if (r.reason === "below_floor") add(say(FLOOR_TEXT));
      else if (r.reason === "nothing_fits") add(say("Nothing there fits your calories left and your avoid list. Try something else, or add more options."));
      else add(say("I could not see any food. Try another photo, or type the options."));
    } catch (e) { handleError(e); } finally { setBusy(false); }
  };

  const whatNow = () => {
    add({ id: id(), kind: "text", from: "user", text: "What should I eat now?" }, say("What can you choose from? Type it, or tap the camera and show me."));
    setAwaitingOptions(true);
  };

  const send = () => {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");
    add({ id: id(), kind: "text", from: "user", text });
    if (awaitingOptions) void runWhatNow({ optionsText: text });
    else add(say("For now I can suggest food: tap \"What should I eat now?\" first."));
  };

  const photo = (p: { uri: string; base64: string }) => {
    setCameraOpen(false);
    add({ id: id(), kind: "photo", uri: p.uri, text: "What can I eat from this?" });
    void runWhatNow({ image: { mediaType: "image/jpeg", dataBase64: p.base64 } });
  };

  const choose = async (o: Option) => {
    if (busy) return;
    setBusy(true);
    try {
      const { id: entryId } = await backend.log(o);
      add(say(`Logged ${o.name} (${o.kcal} kcal).`), { id: id(), kind: "undo", entryId });
      await load();
    } catch (e) { handleError(e); } finally { setBusy(false); }
  };

  const undo = async (entryId: string | null, msgId: number) => {
    if (entryId) { try { await backend.unlog(entryId); } catch (e) { handleError(e); return; } }
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    add(say("Undone."));
    await load();
  };

  if (cameraOpen) return <CameraScreen onCapture={photo} onCancel={() => setCameraOpen(false)} />;

  return (
    <View style={{ flex: 1, backgroundColor: T.color.surface, paddingHorizontal: T.space.xl, paddingTop: T.space.m, gap: T.space.m }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: T.space.m, height: 48 }}>
        <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: T.color.primary, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: T.color.onPrimary, fontSize: 18 }}>♥</Text>
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
        {busy ? <ChatBubble text="…" /> : null}
      </ScrollView>
      <View style={{ gap: T.space.s }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: T.space.s }}>
          <Chip label="What should I eat now?" selected onPress={whatNow} />
          {MOCK ? usuals.map((u) => <Chip key={u.label} label={u.label} icon={foodIcons[u.category]} />) : null}
        </View>
        <CameraInput value={draft} onChangeText={setDraft} onSend={send} onCamera={() => setCameraOpen(true)} disabled={busy} />
      </View>
    </View>
  );
}
