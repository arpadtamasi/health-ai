// The app after sign-in is one screen (US "Open on a full-screen home that shows the day"): the day against its pace on top (the hero
// with its chart, and a bar for each of protein, carbs, fat and water; a tap on a bar chooses what the hero shows), under it one
// thread of today's entries and the conversation with the assistant, and a dock with the usual items, the camera and the text field
// (US "Start logging from one button on the home"). The chat is assistant-ui's local runtime with our own adapter; the thread is
// drawn here so that the day's entries and the messages can share it, in time order.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Image, Platform, Pressable, Text, View } from "react-native";
import { AssistantRuntimeProvider, ComposerPrimitive, ThreadPrimitive, useAui, useAuiState, useLocalRuntime, type ChatModelAdapter, type ChatModelRunResult } from "@assistant-ui/react-native";
import { ApiError, connectHealthUrl, type ChatEvent, type DayEntry, type DayState, type EntryPatch, type Usual } from "../api/client";
import { backend } from "../backend";
import { Button, Chip } from "../components/ui";
import { ConfirmDelete, type DeleteAsk } from "../components/ConfirmDelete";
import { EditSheet } from "../components/EditSheet";
import { EntryCard } from "../components/EntryCard";
import { OptionCard, type Option } from "../components/food";
import { Hero } from "../components/Hero";
import { UiIcon } from "../components/icons";
import { PaceBars } from "../components/PaceBars";
import { barOf, chartOf, judgeHero, METRIC_GOAL, type DayInput, type Metric } from "../day";
import { heroWords, amountText } from "../heroText";
import { isLang, useT, type Lang, type Texts } from "../i18n";
import { takePhoto, type Photo } from "../photo";
import { tokens as T } from "../theme/tokens";
import { Linking } from "react-native";
import { Splash } from "./SignInScreen";

const c = T.color;

/** The adapter lives outside React, so the current texts, the language switch and the event sink reach it through this box. */
const box: { t: Texts | null; setLang: (l: Lang) => void; onEvents: (events: ChatEvent[]) => void } = { t: null, setLang: () => undefined, onEvents: () => undefined };

interface Meta { replies?: string[]; needsConsent?: boolean; onboarded?: boolean; failedPhoto?: boolean }
type Img = { mediaType: "image/jpeg"; dataBase64: string };

/** Our /api/app/chat as an assistant-ui model: events become message parts, the rest rides along as metadata. */
const adapter: ChatModelAdapter = {
  async run({ messages }) {
    const last = messages[messages.length - 1];
    const text = last?.content.filter((p) => p.type === "text").map((p) => (p as { text: string }).text).join(" ") ?? "";
    const images: Img[] = (last?.content.filter((p) => p.type === "image") as { image: string }[] | undefined ?? [])
      .filter((p) => p.image.startsWith("data:")).map((p) => ({ mediaType: "image/jpeg" as const, dataBase64: p.image.split(",")[1]! }));
    const history = messages.slice(0, -1).flatMap((m) => {
      const tx = m.content.filter((p) => p.type === "text").map((p) => (p as { text: string }).text).join(" ");
      return tx ? [{ role: m.role === "user" ? ("user" as const) : ("assistant" as const), text: tx }] : [];
    });
    try {
      const r = await backend.chat({ message: text || box.t!.photoQuestion, history, ...(images.length ? { images } : {}) });
      const parts: NonNullable<ChatModelRunResult["content"]>[number][] = [];
      r.events.forEach((e: ChatEvent, i) => {
        if (e.type === "text") parts.push({ type: "text", text: e.text });
        else if (e.type === "options") parts.push({ type: "tool-call", toolCallId: `opts-${i}`, toolName: "show_options", args: {}, argsText: "{}", result: e.options });
        else if (e.type === "confirm_delete") parts.push({ type: "tool-call", toolCallId: `del-${i}`, toolName: "confirm_delete", args: {}, argsText: "{}", result: { ids: e.ids, all: e.all, labels: e.labels } });
      });
      if (isLang(r.language)) box.setLang(r.language);
      box.onEvents(r.events);
      const replies = [...r.events].reverse().find((e): e is Extract<ChatEvent, { type: "replies" }> => e.type === "replies")?.replies;
      return { content: parts.length ? parts : [{ type: "text" as const, text: "…" }], metadata: { custom: { replies, needsConsent: r.needsConsent, onboarded: r.onboarded } satisfies Meta } };
    } catch (e) {
      const tx = box.t!;
      const msg = e instanceof ApiError && e.code === "daily_limit" ? tx.errDailyLimit : e instanceof ApiError && e.code === "ai_unavailable" ? tx.errUnavailable : images.length ? tx.photoFailed : tx.errGeneric;
      return { content: [{ type: "text" as const, text: msg }], metadata: { custom: { failedPhoto: images.length > 0 } satisfies Meta } };
    }
  },
};

import type { ViewStyle } from "react-native";
const bubble = (user: boolean): ViewStyle => ({
  alignSelf: user ? ("flex-end" as const) : ("flex-start" as const), maxWidth: "86%" as const, paddingVertical: 10, paddingHorizontal: 14,
  backgroundColor: user ? c.ink : c.surfaceLow, borderRadius: 18, borderBottomRightRadius: user ? 4 : 18, borderBottomLeftRadius: user ? 18 : 4,
});

type Part = { type: string; text?: string; image?: string; toolName?: string; result?: unknown };
interface Item { key: string; time: number; node: React.ReactNode }

export interface TodayProps { onboarded: boolean; healthConnected: boolean; onSignedOut: () => void }
type Initial = { role: "user" | "assistant"; content: { type: "text"; text: string }[]; createdAt: Date }[];

function Inner({ onboarded, healthConnected, onSignedOut }: TodayProps) {
  const { t, setLang } = useT();
  box.t = t;
  box.setLang = setLang;
  const aui = useAui();
  const messages = useAuiState((s) => s.thread.messages) as unknown as { id: string; role: string; createdAt: Date; content: Part[]; metadata?: { custom?: Meta } }[];
  const running = useAuiState((s) => s.thread.isRunning);
  const lastMeta = (messages[messages.length - 1]?.metadata?.custom ?? {}) as Meta;

  const [ready, setReady] = useState(onboarded);
  const [consented, setConsented] = useState(false);
  const [state, setState] = useState<DayState | null>(null);
  const [loadedAt, setLoadedAt] = useState(Date.now());
  const [now, setNow] = useState(Date.now());
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [usuals, setUsuals] = useState<Usual[]>([]);
  const [metric, setMetric] = useState<Metric>("kcal");
  const [editing, setEditing] = useState<DayEntry | null>(null);
  const [fresh, setFresh] = useState<Record<string, string>>({});
  const [typing, setTyping] = useState(false);
  const [dismissedConnect, setDismissedConnect] = useState(false);
  const list = useRef<FlatList<Item>>(null);

  const load = useCallback(async () => {
    try {
      const [s, u, e] = await Promise.all([backend.state(), backend.usuals().catch(() => [] as Usual[]), backend.entriesToday().catch(() => [] as DayEntry[])]);
      setState(s); setUsuals(u); setEntries(e); setLoadedAt(Date.now());
    } catch (err) { if (err instanceof ApiError && err.status === 401) onSignedOut(); }
  }, [onSignedOut]);
  useEffect(() => { if (ready) void load(); }, [ready, load]);
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(id); }, []);

  // What the chat did (a logged meal, a change) may have changed the day: read it again when the model stops. The events say which
  // entries are new, so that their cards show Edit and Undo.
  const loadRef = useRef(load);
  loadRef.current = load;
  useEffect(() => {
    box.onEvents = (events) => {
      const next: Record<string, string> = {};
      for (const e of events) {
        if ((e.type === "logged" || e.type === "logged_water") && e.id) next[e.id] = "";
        if (e.type === "updated") next[e.id] = box.t!.cardChanged(`${e.name}, ${e.kcal} kcal`);
      }
      if (Object.keys(next).length) setFresh((f) => ({ ...f, ...next }));
    };
  }, []);
  const wasRunning = useRef(false);
  useEffect(() => { if (wasRunning.current && !running && ready) void loadRef.current(); wasRunning.current = running; }, [running, ready]);
  useEffect(() => { if (lastMeta.onboarded && !ready) { setReady(true); setMetric("kcal"); } }, [lastMeta.onboarded, ready]);

  // ---- the day, as the top of the screen shows it ----
  const day: DayInput | null = useMemo(() => {
    if (!state) return null;
    const elapsed = Math.floor((now - loadedAt) / 60000);
    return {
      goals: { calories: state.goals.calories, carbs: state.goals.carbs, protein: state.goals.protein, fat: state.goals.fat, waterMl: state.water.goalMl },
      eaten: { calories: state.eaten.calories, carbs: state.eaten.carbs, protein: state.eaten.protein, fat: state.eaten.fat, waterMl: state.water.ml },
      minutes: Math.min(24 * 60 - 1, state.minutes + Math.max(0, elapsed)), window: state.window,
    };
  }, [state, now, loadedAt]);

  const metricLabel = (m: Metric) => ({ kcal: t.metricKcal, p: t.metricP, c: t.metricC, f: t.metricF, w: t.metricW })[m];
  const header = useMemo(() => {
    if (!day || !state) return null;
    const hero = judgeHero(day, entries, metric);
    const words = heroWords(hero, day, t);
    const chart = entries.some((e) => (metric === "w" ? e.kind === "water" : e.kind === "meal")) ? chartOf(day, entries, metric, state.timeZone) : null;
    const labels = { kcal: { name: "", value: "" }, p: { name: t.barProtein, value: "" }, c: { name: t.barCarbs, value: "" }, f: { name: t.barFat, value: "" }, w: { name: t.barWater, value: "" } };
    const bars = (["p", "c", "f", "w"] as const).map((m) => {
      const b = barOf(day, m);
      labels[m].value = b.limit ? t.barFatLeft(b.left) : b.done ? t.barDone : t.barLeft(amountText(m, b.left));
      return b;
    });
    const aria = chart ? t.chartAria(metricLabel(metric), amountText(metric, Math.round(chart.total)), chart.planNow !== undefined ? `${t.chartPlan} ${amountText(metric, Math.round(chart.planNow))}` : `${METRIC_GOAL(day.goals, metric)}`) : words.text;
    return { hero, words, chart, bars, labels, aria };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, entries, metric, state, t]);

  // ---- actions ----
  const refresh = async (id?: string | null, note = "") => { if (id) setFresh((f) => ({ ...f, [id]: note })); await load(); };
  const choose = async (o: Option) => { try { const { id } = await backend.log(o); await refresh(id); } catch { /* the card stays; tap again */ } };
  const logUsual = async (u: Usual) => {
    try {
      const { id } = u.kind === "water" ? await backend.water(u.ml ?? 250) : await backend.log({ rank: 0, name: u.name, category: "other", kcal: u.kcal, carbs: u.carbs, protein: u.protein, fat: u.fat });
      await refresh(id);
    } catch { /* tap again */ }
  };
  const undo = async (e: DayEntry) => { try { await backend.unlog(e.id); setFresh((f) => { const { [e.id]: _, ...rest } = f; return rest; }); await load(); } catch { /* the card stays */ } };
  const save = async (patch: EntryPatch) => {
    const before = editing;
    setEditing(null);
    try {
      await backend.updateEntry(patch);
      const what = [patch.kcal !== undefined && before ? `${before.kcal} → ${patch.kcal} kcal` : "", patch.time ?? "", patch.mealType ? t[`meal${patch.mealType}` as const] : "", patch.name ?? ""].filter(Boolean).join(", ");
      await refresh(patch.id, t.cardChanged(what));
    } catch { /* the entry is as it was */ }
  };
  const remove = async (e: DayEntry) => { setEditing(null); try { await backend.deleteEntries([e.id]); await load(); } catch { /* as it was */ } };
  const deleteEntries = async (a: DeleteAsk): Promise<boolean> => { try { if (a.all) await backend.deleteAll(); else await backend.deleteEntries(a.ids); await load(); return true; } catch { return false; } };
  const camera = async () => {
    const p: Photo | undefined = await takePhoto();
    if (p) aui.thread().append({ role: "user", content: [{ type: "image", image: `data:image/jpeg;base64,${p.base64}` }, { type: "text", text: t.photoQuestion }] });
  };
  const connect = () => { if (Platform.OS === "web") window.location.href = connectHealthUrl; else void Linking.openURL(connectHealthUrl); };

  // ---- the thread: entries and messages in time order ----
  const items: Item[] = useMemo(() => {
    const out: Item[] = [];
    const tz = state?.timeZone ?? "UTC";
    if (!ready) out.push({ key: "greet", time: 0, node: <View style={bubble(false)}><Text style={{ fontFamily: T.face.body, fontSize: T.font.base, color: c.onSurface }}>{t.greetSetup}</Text></View> });
    else if (entries.length === 0 && messages.length === 0) out.push({ key: "empty", time: 0, node: <View style={bubble(false)}><Text style={{ fontFamily: T.face.body, fontSize: T.font.base, color: c.onSurface }}>{t.threadEmpty}</Text></View> });
    if (ready && !healthConnected && !dismissedConnect) {
      out.push({ key: "connect", time: 1, node: (
        <View style={{ backgroundColor: c.surfaceLow, borderRadius: T.radius.card, padding: T.space.l, gap: T.space.s }}>
          <Text style={{ fontFamily: T.face.display, fontSize: 17, color: c.onSurface }}>{t.connectTitle}</Text>
          <Text style={{ fontFamily: T.face.body, fontSize: T.font.body, color: c.onSurfaceVariant }}>{t.connectText}</Text>
          <View style={{ flexDirection: "row", gap: T.space.s }}><Chip label={t.connectButton} selected onPress={connect} /><Chip label={t.connectDismiss} onPress={() => setDismissedConnect(true)} /></View>
        </View>) });
    }
    for (const e of entries) {
      out.push({ key: `e-${e.id}`, time: e.at, node: <EntryCard entry={e} timeZone={tz} t={t} fresh={e.id in fresh} note={fresh[e.id] || undefined} onEdit={setEditing} onUndo={(x) => void undo(x)} /> });
    }
    for (const m of messages) {
      const time = m.createdAt ? new Date(m.createdAt).getTime() : Date.now();
      const user = m.role === "user";
      m.content.forEach((p, i) => {
        const key = `m-${m.id}-${i}`;
        if (p.type === "text" && p.text && !(user && p.text === t.photoQuestion && m.content.some((q) => q.type === "image"))) out.push({ key, time: time + i, node: <View style={bubble(user)}><Text style={{ fontFamily: T.face.body, fontSize: T.font.base, color: user ? "#fff" : c.onSurface }}>{p.text}</Text></View> });
        else if (p.type === "image" && p.image) out.push({ key, time: time + i, node: <View style={{ ...bubble(true), padding: 6 }}><Image source={{ uri: p.image }} style={{ width: 190, height: 110, borderRadius: 14 }} /></View> });
        else if (p.type === "tool-call" && p.toolName === "show_options") {
          const opts = (p.result as Option[] | undefined) ?? [];
          out.push({ key, time: time + i, node: <View style={{ gap: T.space.s }}>{opts.map((o) => <OptionCard key={o.rank} option={o} primary={o.rank === 1} onChoose={(x) => void choose(x)} labels={{ choose: "Choose", protein: t.metricP, fat: t.metricF }} />)}</View> });
        } else if (p.type === "tool-call" && p.toolName === "confirm_delete") out.push({ key, time: time + i, node: <ConfirmDelete ask={p.result as DeleteAsk} onConfirm={deleteEntries} /> });
      });
      if (m.metadata?.custom?.failedPhoto) out.push({ key: `f-${m.id}`, time: time + 50, node: <View style={{ flexDirection: "row", gap: 8 }}><Chip label={t.newPhoto} selected onPress={() => void camera()} /><Chip label={t.describe} onPress={() => undefined} /></View> });
    }
    return out.sort((a, b) => a.time - b.time);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, messages, fresh, ready, state, t, healthConnected, dismissedConnect]);

  const hasOptions = messages[messages.length - 1]?.content.some((p) => p.type === "tool-call" && p.toolName === "show_options") ?? false;
  const compact = typing || hasOptions;
  const replies = lastMeta.replies?.length ? lastMeta.replies : ready ? [] : t.firstReplies;
  const showConsent = lastMeta.needsConsent && !consented;

  return (
    <View style={{ flex: 1, backgroundColor: c.surface }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: T.space.m, height: 48, paddingHorizontal: T.space.xl }}>
        <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}><UiIcon name="heart" size={17} color={c.onPrimary} filled /></View>
        <Text style={{ fontFamily: T.face.display, fontSize: 20, letterSpacing: -0.4, color: c.onSurface }}>{t.appName}</Text>
      </View>
      {ready && header && day && state ? (
        <View style={{ paddingHorizontal: T.space.xl, gap: 10 }}>
          <Hero tone={header.hero.tone} big={header.words.big} text={header.words.text} chart={header.chart} minutes={day.minutes} window={day.window} compact={compact}
            labels={{ metric: metricLabel(metric), plan: t.chartPlan, you: t.chartYou, cap: "max", aria: header.aria }} />
          {compact ? null : <PaceBars bars={header.bars} labels={header.labels} selected={metric} onSelect={(m) => setMetric((cur) => (cur === m ? "kcal" : m))} />}
        </View>
      ) : null}
      <ThreadPrimitive.Root style={{ flex: 1 }}>
        <FlatList ref={list} data={items} keyExtractor={(i) => i.key} renderItem={({ item }) => <View style={{ paddingVertical: 4 }}>{item.node}</View>}
          style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: T.space.xl, paddingTop: 8, paddingBottom: 8 }}
          onContentSizeChange={() => list.current?.scrollToEnd({ animated: false })} />
        {showConsent ? (
          <View style={{ marginHorizontal: T.space.xl, gap: T.space.s, backgroundColor: c.surfaceLow, borderRadius: T.radius.card, padding: T.space.l }}>
            <Text style={{ fontFamily: T.face.body, fontSize: T.font.body, color: c.onSurface }}>{t.consentText}</Text>
            <Button label={t.consentButton} onPress={() => void backend.consent().then(() => { setConsented(true); setReady(true); })} />
          </View>
        ) : null}
        <View style={{ paddingTop: 10, paddingBottom: 14, paddingHorizontal: T.space.xl, gap: 8, borderTopWidth: 1, borderTopColor: c.surfaceHigh, backgroundColor: c.surface }}>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "nowrap", overflow: "hidden" }}>
            {replies.length
              ? replies.map((r) => <ThreadPrimitive.Suggestion key={r} prompt={r} send style={{ minHeight: T.size.touch, paddingHorizontal: 16, justifyContent: "center", borderRadius: T.radius.chip, borderWidth: 1, borderColor: c.outline, backgroundColor: c.surface }}><Text style={{ fontFamily: T.face.body, fontSize: T.font.body, color: c.onSurface }}>{r}</Text></ThreadPrimitive.Suggestion>)
              : ready ? usuals.slice(0, 4).map((u, i) => <Chip key={`${u.kind}-${u.name}`} selected={i === 0} icon={u.kind === "water" ? "water" : undefined} label={u.kind === "water" ? `${u.ml} ml` : u.name} onPress={() => void logUsual(u)} />) : null}
          </View>
          <ComposerPrimitive.Root style={{ flexDirection: "row", alignItems: "center", gap: T.space.s }}>
            <Pressable accessibilityRole="button" accessibilityLabel={t.openCamera} onPress={() => void camera()}
              style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: c.primaryContainer, alignItems: "center", justifyContent: "center" }}>
              <UiIcon name="camera" size={22} color={c.onPrimaryContainer} />
            </Pressable>
            <ComposerPrimitive.Input placeholder={t.placeholder} multiline placeholderTextColor={c.onSurfaceVariant} onFocus={() => setTyping(true)} onBlur={() => setTyping(false)}
              style={[{ flex: 1, backgroundColor: c.surfaceHigh, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, minHeight: 48, maxHeight: 120, fontFamily: T.face.body, fontSize: T.font.base, color: c.onSurface }, Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : null]} />
            <ComposerPrimitive.Send style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}>
              <UiIcon name="arrow-up" size={20} color={c.onPrimary} />
            </ComposerPrimitive.Send>
          </ComposerPrimitive.Root>
        </View>
      </ThreadPrimitive.Root>
      {editing && state ? <EditSheet entry={editing} timeZone={state.timeZone} t={t} onSave={(p) => void save(p)} onDelete={(e) => void remove(e)} onClose={() => setEditing(null)} /> : null}
    </View>
  );
}

function WithRuntime(props: TodayProps & { initial: Initial }) {
  const { t } = useT();
  box.t = t;
  const runtime = useLocalRuntime(adapter, { initialMessages: props.initial });
  return <AssistantRuntimeProvider runtime={runtime}><Inner {...props} /></AssistantRuntimeProvider>;
}

/** The conversation is read back from the server (it keeps the chat during the test), so that reopening the app shows it again. */
export function Today(props: TodayProps) {
  const [initial, setInitial] = useState<Initial | null>(null);
  useEffect(() => {
    backend.chatHistory().then((turns) => {
      setInitial(turns.flatMap((x) => {
        const text = x.role === "user" ? x.text : (x.events ?? []).filter((e): e is Extract<ChatEvent, { type: "text" }> => e.type === "text").map((e) => e.text).join("\n");
        return text ? [{ role: x.role, content: [{ type: "text" as const, text }], createdAt: new Date(x.at) }] : [];
      }));
    }).catch(() => setInitial([]));
  }, []);
  return initial ? <WithRuntime {...props} initial={initial} /> : <Splash />;
}
