// US-01m3w51bs6krjxa2rgb86qkft7 (Open on a full-screen home that shows the day): the app after sign-in is one screen. On top a plate
// and a glass that fill as the person logs (Plate.tsx, Glass.tsx), with the calories in the centre and one line under it that says
// where they stand; then the four figures, today's entries and "What should I eat now?"; at the bottom the dock with the usual items,
// the camera and the text field (US-01m3w51bzh8h6t8npn6k80r782). The conversation with the assistant is on a sheet behind the button
// at the top (EX-01m6m433rar1k0esrnq1ekhjmd); while it is open, or the keyboard is, the plate folds into one line
// (EX-01m3y1pvkekmsy4pdbw3w46qk1). EX-01m3w51cz41qvfw0mfa79pbphx (The home shows the day as a plate and a glass): no large figure,
// no chart of the day, and the dock is visible without scrolling. The options of "What should I eat now?" are on a sheet under the figures, so that the plate shows
// the picked one above it (EX-01m6m4332s0zwsvq9103fp9ff2). The chat is assistant-ui's local runtime with our own adapter.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, AppState, FlatList, Image, Linking, Platform, Pressable, ScrollView, Text, TextInput, View, type ViewStyle } from "react-native";
import { AssistantRuntimeProvider, ThreadPrimitive, useAui, useAuiState, useLocalRuntime, type ChatModelAdapter, type ChatModelRunResult } from "@assistant-ui/react-native";
import { ApiError, connectHealthUrl, warmUp, type ChatEvent, type DayEntry, type DayState, type EntryPatch, type Usual } from "../api/client";
import { backend } from "../backend";
import { ActionBar, type BarAction } from "../components/ActionBar";
import { Button, Chip } from "../components/ui";
import { ConfirmDelete, type DeleteAsk } from "../components/ConfirmDelete";
import { DayStrip, shortName } from "../components/DayStrip";
import { EditSheet } from "../components/EditSheet";
import { Figures } from "../components/Figures";
import type { Option } from "../components/food";
import { Glass } from "../components/Glass";
import { UiIcon } from "../components/icons";
import { Logo } from "../components/Logo";
import { Mark } from "../components/Mark";
import { Plate } from "../components/Plate";
import { Suggestions } from "../components/Suggestions";
import { judgeHero, minutesOf, type DayInput } from "../day";
import { amountText, lineWords } from "../lineText";
import { isLang, useT, type Lang, type Texts } from "../i18n";
import { dayFraction } from "../pace";
import { nextShown, partOf, type Drawn } from "../plate";
import { BUILD, isNewer, onComeBack, publishedBuild } from "../update";
import { canSendAgain, intentOf, photoTurns, startSide, switchShown, type Side } from "../dock";
import { blocksOf } from "../rich";
import { applyLine, emptyLive, stepLabel, stepSummary, type Live, type Step, type StepWords, type StreamLine } from "../stream";
import { cacheGet, cacheSet } from "../cache";
import { takePhoto, type Photo, type PhotoSource } from "../photo";
import { tokens as T } from "../theme/tokens";
import { useScheme } from "../theme/scheme";
import { netStatus, subscribe } from "../net";
import { Splash } from "./SignInScreen";

const c = T.color;

/** The adapter lives outside React, so the current texts, the language switch and the event sink reach it through this box. */
const box: { t: Texts | null; setLang: (l: Lang) => void; onEvents: (events: ChatEvent[]) => void; onLogged: () => void } = { t: null, setLang: () => undefined, onEvents: () => undefined, onLogged: () => undefined };

interface Meta { replies?: string[]; needsConsent?: boolean; onboarded?: boolean; failedPhoto?: boolean; failed?: boolean; retry?: boolean; intent?: Side; stopped?: boolean }
type Img = { mediaType: "image/jpeg"; dataBase64: string };

/** Our /api/app/chat as an assistant-ui model: events become message parts, the rest rides along as metadata. */
const adapter: ChatModelAdapter = {
  // BR-01m6pmf9avbbgd373z1jcvvaqw (A reply arrives as it is written, with its steps): each line of the streamed reply redraws the
  // message: its steps, the cards it made, its text so far. Stop aborts the stream and keeps what was done.
  async *run({ messages, abortSignal }) {
    const last = messages[messages.length - 1];
    const text = last?.content.filter((p) => p.type === "text").map((p) => (p as { text: string }).text).join(" ") ?? "";
    const imagesOf = (m: { content: readonly { type: string }[] }): Img[] => (m.content.filter((p) => p.type === "image") as unknown as { image: string }[])
      .filter((p) => p.image.startsWith("data:")).map((p) => ({ mediaType: "image/jpeg" as const, dataBase64: p.image.split(",")[1]! }));
    const images: Img[] = last ? imagesOf(last) : [];
    const intent = (last?.metadata?.custom as Meta | undefined)?.intent;
    // EX-01m6ph6eawez8cc1g4kd33xszg: the photos of the last two earlier user messages come along, so a question about them still sees them.
    const earlier = messages.slice(0, -1);
    const withPhotos = photoTurns(earlier.flatMap((m, i) => (m.role === "user" ? [i] : [])));
    const history = earlier.flatMap((m, i) => {
      const tx = m.content.filter((p) => p.type === "text").map((p) => (p as { text: string }).text).join(" ");
      const pics = withPhotos.has(i) ? imagesOf(m) : [];
      return tx ? [{ role: m.role === "user" ? ("user" as const) : ("assistant" as const), text: tx, ...(pics.length ? { images: pics } : {}) }] : [];
    });
    let live = emptyLive();
    let fresh = false;
    let wake: (() => void) | null = null;
    const onLine = (l: StreamLine) => {
      live = applyLine(live, l);
      fresh = true;
      if (l.type === "event" && (l.event.type === "logged" || l.event.type === "logged_water" || l.event.type === "updated")) box.onLogged();
      wake?.();
    };
    let r: Awaited<ReturnType<typeof backend.chatStream>> | undefined;
    let failure: unknown;
    let finished = false;
    const work = backend.chatStream({ message: text || box.t!.photoQuestion, history, ...(images.length ? { images } : {}), ...(intent ? { intent } : {}) }, onLine, abortSignal)
      .then((x) => { r = x; }, (e: unknown) => { failure = e; })
      .finally(() => { finished = true; wake?.(); });
    while (!finished) {
      if (!fresh) { await new Promise<void>((res) => { wake = res; }); wake = null; continue; }
      fresh = false;
      yield { content: liveParts(live, false) };
    }
    await work;
    try {
      if (!r) throw failure;
      const steps = live.steps.length ? [stepsPart(live.steps, true)] : [];
      const parts = [...steps, ...partsOf(r.events)];
      if (isLang(r.language)) box.setLang(r.language);
      box.onEvents(r.events);
      const replies = [...r.events].reverse().find((e): e is Extract<ChatEvent, { type: "replies" }> => e.type === "replies")?.replies;
      yield { content: parts.length ? parts : [{ type: "text" as const, text: "…" }], metadata: { custom: { replies, needsConsent: r.needsConsent, onboarded: r.onboarded } satisfies Meta } };
    } catch (e) {
      // EX-01m6pmf9zhdr5wntczz8ncfdrj: Stop keeps what was written and logged.
      if (abortSignal.aborted || (e instanceof ApiError && e.code === "stopped")) { yield { content: liveParts(live, true), metadata: { custom: { stopped: true } satisfies Meta } }; return; }
      const tx = box.t!;
      const msg = e instanceof ApiError && e.code === "timeout" ? tx.errTimeout : e instanceof ApiError && e.code === "daily_limit" ? tx.errDailyLimit : e instanceof ApiError && e.code === "ai_unavailable" ? tx.errUnavailable : images.length ? tx.photoFailed : tx.errGeneric;
      // EX-01m6ph6eh98wgvrjw6gyy2r9tr: a message that did not go out says so, and "Újra" sends it again; nothing is sent by itself.
      yield { content: [{ type: "text" as const, text: msg }], metadata: { custom: { failedPhoto: images.length > 0, failed: true, retry: canSendAgain(e instanceof ApiError ? e.code : undefined) } satisfies Meta } };
    }
  },
};

type Part0 = NonNullable<ChatModelRunResult["content"]>[number];
/** What happened in a reply, as parts of the message: text, the options of the sheet, a delete to confirm, and a card for every entry
 * logged in it (EX-01m6ph6eqsv1wt33vqx395z7nn: what was logged stays in the conversation as a card). */
function partsOf(events: ChatEvent[]): Part0[] {
  const parts: Part0[] = [];
  events.forEach((e: ChatEvent, i) => {
    if (e.type === "text") parts.push({ type: "text", text: e.text });
    else if (e.type === "options") parts.push({ type: "tool-call", toolCallId: `opts-${i}`, toolName: "show_options", args: {}, argsText: "{}", result: e.options });
    else if (e.type === "confirm_delete") parts.push({ type: "tool-call", toolCallId: `del-${i}`, toolName: "confirm_delete", args: {}, argsText: "{}", result: { ids: e.ids, all: e.all, labels: e.labels } });
    else if (e.type === "logged" && e.id) parts.push({ type: "tool-call", toolCallId: `log-${i}`, toolName: "logged", args: {}, argsText: "{}", result: { id: e.id, name: e.name, kcal: e.kcal } satisfies LoggedInfo });
    else if (e.type === "logged_water" && e.id) parts.push({ type: "tool-call", toolCallId: `log-${i}`, toolName: "logged", args: {}, argsText: "{}", result: { id: e.id, name: "Water", kcal: 0, ml: e.ml } satisfies LoggedInfo });
  });
  return parts;
}
interface LoggedInfo { id: string; name: string; kcal: number; ml?: number }

/** The steps of a reply as one message part: a list while it is written, one quiet line once it is done. */
const stepsPart = (steps: Step[], done: boolean): Part0 => ({ type: "tool-call", toolCallId: "steps", toolName: "steps", args: {}, argsText: "{}", result: { steps, done } });
/** The reply while it is written: its steps, the cards it made so far, its text so far. */
function liveParts(live: Live, done: boolean): Part0[] {
  return [
    ...(live.steps.length ? [stepsPart(live.steps, done)] : []),
    ...partsOf(live.events.filter((e) => e.type !== "text") as unknown as ChatEvent[]),
    ...(live.text ? [{ type: "text" as const, text: live.text }] : []),
  ];
}
const stepWords = (t: Texts): StepWords => ({
  photo: t.stepPhoto, today: t.stepToday, log: t.stepLog, water: t.stepWater, options: t.stepOptions, update: t.stepUpdate,
  entries: t.stepEntries, delete: t.stepDelete, settings: t.stepSettings, estimate: t.stepEstimate, other: t.stepOther,
});

const bubble = (user: boolean): ViewStyle => ({
  alignSelf: user ? ("flex-end" as const) : ("flex-start" as const), maxWidth: "86%" as const, paddingVertical: 10, paddingHorizontal: 14,
  backgroundColor: user ? c.strong : c.surface, borderWidth: user ? 0 : 1, borderColor: c.outline,
  borderRadius: 18, borderBottomRightRadius: user ? 4 : 18, borderBottomLeftRadius: user ? 18 : 4,
});

interface Pending { tid: string; entry: DayEntry; status: "pending" | "failed"; run: () => Promise<string | null> }
type Part = { type: string; text?: string; image?: string; toolName?: string; result?: unknown };
interface Item { key: string; time: number; node: React.ReactNode }
type Mode = "home" | "talk" | "whatnow";
type Shown = Drawn | "kcal";

export interface TodayProps { onboarded: boolean; healthConnected: boolean; onSignedOut: () => void }
type Initial = ({ role: "user"; content: { type: "text"; text: string }[]; createdAt: Date } | { role: "assistant"; content: Part0[]; createdAt: Date })[];

const hm = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** The dock's text field, the photos waiting beside it (up to four: one meal can take several) and Send. */
function Composer({ t, running, placeholder, onSend, onFocus, onDraft, onStop, autoFocus = false, focusSignal = 0 }:
  { t: Texts; running: boolean; placeholder: string; onSend: (text: string, photos: Photo[]) => void; onFocus?: () => void; onDraft?: (typing: boolean) => void; onStop?: () => void; autoFocus?: boolean; focusSignal?: number }) {
  const input = useRef<TextInput>(null);
  useEffect(() => { if (focusSignal) input.current?.focus(); }, [focusSignal]);
  const [tray, setTray] = useState<Photo[]>([]);
  const [draft, setDraft] = useState("");
  const typing = draft.trim().length > 0 || tray.length > 0;
  useEffect(() => { onDraft?.(typing); }, [typing, onDraft]);
  // EX-01m6ph6e4bcenyjywdahg41g4r: the camera button offers a photo now or one from the gallery, so a meal can be logged afterwards.
  const [menu, setMenu] = useState(false);
  const camera = async (from: PhotoSource) => { setMenu(false); const p = await takePhoto(from); if (p) setTray((x) => [...x, p].slice(0, 4)); };
  const canSend = (draft.trim().length > 0 || tray.length > 0) && !running;
  const send = () => { if (!canSend) return; onSend(draft.trim(), tray); setTray([]); setDraft(""); };
  return (
    <View style={{ gap: 8 }}>
      {tray.length ? (
        <View style={{ flexDirection: "row", gap: 8 }}>
          {tray.map((p, i) => (
            <View key={i} style={{ width: 64, height: 64 }}>
              <Image source={{ uri: p.uri }} style={{ width: 64, height: 64, borderRadius: 14 }} />
              <Pressable accessibilityRole="button" accessibilityLabel={t.removePhoto} onPress={() => setTray((x) => x.filter((_, j) => j !== i))}
                style={{ position: "absolute", top: -8, right: -8, width: 28, height: 28, borderRadius: 14, backgroundColor: c.onSurface, alignItems: "center", justifyContent: "center" }}>
                <UiIcon name="x" size={14} color={c.table} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
      {menu ? (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Chip ui="camera" label={t.photoNow} onPress={() => void camera("camera")} />
          <Chip ui="image" label={t.photoGallery} onPress={() => void camera("gallery")} />
        </View>
      ) : null}
      <View style={{ flexDirection: "row", alignItems: "center", gap: T.space.s }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t.openCamera} accessibilityState={{ expanded: menu }} onPress={() => setMenu((m) => !m)}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}>
          <UiIcon name="camera" size={21} color={c.onPrimary} />
        </Pressable>
        <TextInput ref={input} value={draft} onChangeText={setDraft} placeholder={tray.length ? t.placeholderPhoto : placeholder} multiline placeholderTextColor={c.onSurfaceVariant}
          autoFocus={autoFocus} onFocus={() => { onFocus?.(); warmUp(); }}
          onKeyPress={(e) => { const k = e.nativeEvent as unknown as { key: string; shiftKey?: boolean }; if (Platform.OS === "web" && k.key === "Enter" && !k.shiftKey) { (e as unknown as { preventDefault?: () => void }).preventDefault?.(); send(); } }}
          style={[{ flex: 1, backgroundColor: c.surfaceLow, borderWidth: 1, borderColor: c.outline, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 11, minHeight: 44, maxHeight: 120, fontFamily: T.face.body, fontSize: T.font.body, color: c.onSurface }, Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : null]} />
        {/* EX-01m6pmf9zhdr5wntczz8ncfdrj: while a reply is written, Stop stands in place of Send. */}
        {running && onStop ? (
          <Pressable accessibilityRole="button" accessibilityLabel={t.stop} onPress={onStop}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.strong, alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: 13, height: 13, borderRadius: 2, backgroundColor: c.onStrong }} />
          </Pressable>
        ) : canSend ? (
          <Pressable accessibilityRole="button" accessibilityLabel={t.send} onPress={send}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}>
            <UiIcon name="arrow-up" size={20} color={c.onPrimary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function Inner({ onboarded, healthConnected, onSignedOut }: TodayProps) {
  const { t, lang, setLang } = useT();
  const scheme = useScheme();
  box.t = t;
  box.setLang = setLang;
  const aui = useAui();
  const messages = useAuiState((s) => s.thread.messages) as unknown as { id: string; role: string; createdAt: Date; content: Part[]; metadata?: { custom?: Meta } }[];
  const running = useAuiState((s) => s.thread.isRunning);
  const lastMeta = (messages[messages.length - 1]?.metadata?.custom ?? {}) as Meta;

  const [ready, setReady] = useState(onboarded);
  const [consented, setConsented] = useState(false);
  // The last day the device knew is drawn at once and confirmed by the server afterwards (EX-01m3y2snsqw3e3th7rfs0n7r08).
  const cached = useMemo(() => {
    const c0 = cacheGet<{ state: DayState; entries: DayEntry[]; usuals: Usual[]; at: number }>("day");
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: c0?.state.timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    return c0 && (!c0.state.date || c0.state.date === today) ? c0 : undefined;
  }, []);
  const [state, setState] = useState<DayState | null>(cached?.state ?? null);
  const [loadedAt, setLoadedAt] = useState(cached?.at ?? Date.now());
  const [now, setNow] = useState(Date.now());
  const [entries, setEntries] = useState<DayEntry[]>(cached?.entries ?? []);
  const [usuals, setUsuals] = useState<Usual[]>(cached?.usuals ?? []);
  const [pending, setPending] = useState<Pending[]>([]);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [overrides, setOverrides] = useState<Record<string, DayEntry>>({});
  const [slow, setSlow] = useState(netStatus().slow);
  const [metric, setMetric] = useState<Shown>("kcal");
  const [editing, setEditing] = useState<DayEntry | null>(null);
  const [recent, setRecent] = useState<{ id: string; note?: string } | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>(onboarded ? "home" : "talk");
  const [sheetFrom, setSheetFrom] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [dismissedConnect, setDismissedConnect] = useState(false);
  const [width, setWidth] = useState(390);
  const [height, setHeight] = useState(800);
  const [loadFailed, setLoadFailed] = useState(false);
  const [failNote, setFailNote] = useState<string | null>(null);
  const [focusSignal, setFocusSignal] = useState(0);
  // BR-01m6ph6dgw3qxzxjjy1sh3t0yz: the dock's switch, on the side used last; its one-line explanation is shown the first time only.
  const [side, setSide] = useState<Side>(() => startSide(cacheGet("dockSide")));
  const pickSide = (s: Side) => { setSide(s); cacheSet("dockSide", s); };
  const [hint] = useState(() => !cacheGet<boolean>("sideHintSeen"));
  useEffect(() => { if (hint && ready) cacheSet("sideHintSeen", true); }, [hint, ready]);
  const [armed, setArmed] = useState(false);
  const list = useRef<FlatList<Item>>(null);

  const load = useCallback(async () => {
    try {
      const [s, u, e] = await Promise.all([backend.state(), backend.usuals().catch(() => [] as Usual[]), backend.entriesToday().catch(() => [] as DayEntry[])]);
      setState(s); setUsuals(u); setEntries(e); setLoadedAt(Date.now()); setLoadFailed(false);
      cacheSet("day", { state: s, usuals: u, entries: e, at: Date.now() });
    } catch (err) { if (err instanceof ApiError && err.status === 401) onSignedOut(); else setLoadFailed(true); }
  }, [onSignedOut]);
  useEffect(() => { if (ready) void load(); }, [ready, load]);
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(id); }, []);
  useEffect(() => subscribe((s) => setSlow(s.slow)), []);
  // The bar above the dock says what was just logged or changed for a few seconds.
  useEffect(() => { if (!recent) return; const id = setTimeout(() => setRecent(null), 6000); return () => clearTimeout(id); }, [recent]);

  // What the chat did (a logged meal, a change) may have changed the day: read it again when the model stops. The events say which
  // entry is new or changed, so that the bar above the dock can offer Edit and Undo for it (EX-01m3y1psa8q9g7vq4b5ra1sxhn, a label read
  // from a photo; EX-01m3rvsqvrfkzhj564c066ev2b, a plate logged at once with Edit for the portion) or say what changed
  // (EX-01m3y1psnt7qhveb7gcng4mx53).
  const loadRef = useRef(load);
  loadRef.current = load;
  // A card made while the reply is written gets its entry (macros, Edit, Undo) at once, not after the reply (BR-01m6pmf9avbbgd373z1jcvvaqw).
  useEffect(() => { box.onLogged = () => void loadRef.current(); }, []);
  useEffect(() => {
    box.onEvents = (events) => {
      for (const e of events) {
        if ((e.type === "logged" || e.type === "logged_water") && e.id) setRecent({ id: e.id });
        if (e.type === "updated") setRecent({ id: e.id, note: box.t!.cardChanged(`${e.name}, ${e.kcal} kcal`) });
      }
    };
  }, []);
  const wasRunning = useRef(false);
  useEffect(() => { if (wasRunning.current && !running && ready) void loadRef.current(); wasRunning.current = running; }, [running, ready]);
  // BR-01m6p2r4vmgte1n2wkwjx0q28w: coming back to the front loads the day again (EX-01m6p2r5ggm7nvtshx8yn4t4xs), or the newest version
  // when nothing would be lost by it (EX-01m6p2r52g2z53nsyd9g8ney8y); a typed message, an open sheet or a waiting write keeps the page
  // (EX-01m6p2r597gw7850rrrcnnfhvx). No button and no bar.
  const typingRef = useRef(false);
  const onDraft = useCallback((typing: boolean) => { typingRef.current = typing; }, []);
  const busyRef = useRef({ sheetOpen: false, writing: false, ready: false });
  busyRef.current = { sheetOpen: mode !== "home" || editing !== null, writing: pending.length > 0 || running, ready };
  useEffect(() => {
    let last = AppState.currentState;
    const sub = AppState.addEventListener("change", (next) => {
      const back = last !== "active" && next === "active";
      last = next;
      if (!back) return;
      void (async () => {
        const b = busyRef.current;
        const busy = { typing: typingRef.current, sheetOpen: b.sheetOpen || !b.ready, writing: b.writing || netStatus().pending > 0 };
        const newer = Platform.OS === "web" && isNewer(BUILD, await publishedBuild());
        if (onComeBack(newer, busy) === "reload") { globalThis.location?.reload(); return; }
        if (busyRef.current.ready) void loadRef.current();
      })();
    });
    return () => sub.remove();
  }, []);
  useEffect(() => { if (lastMeta.onboarded && !ready) { setReady(true); setMetric("kcal"); setMode("home"); } }, [lastMeta.onboarded, ready]);

  // Asking "what should I eat?" in the text field opens the same sheet as the button, with the options it got.
  const lastOptionsAt = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) if (messages[i]!.content.some((p) => p.type === "tool-call" && p.toolName === "show_options")) return i;
    return -1;
  }, [messages]);
  const seenOptions = useRef(lastOptionsAt);
  useEffect(() => {
    if (lastOptionsAt > seenOptions.current && ready) { if (mode !== "whatnow") { setMode("whatnow"); setSheetFrom(lastOptionsAt); } setPicked(null); }
    seenOptions.current = lastOptionsAt;
  }, [lastOptionsAt, ready, mode]);

  // ---- what is shown: the server's entries, with what the person just did applied at once (the answer may take seconds) ----
  const shown: DayEntry[] = useMemo(() => {
    const own = entries.filter((e) => !hidden.has(e.id)).map((e) => overrides[e.id] ?? e);
    return [...own, ...pending.map((p) => p.entry)].sort((a, b) => a.at - b.at);
  }, [entries, hidden, overrides, pending]);

  const day: DayInput | null = useMemo(() => {
    if (!state) return null;
    const elapsed = Math.floor((now - loadedAt) / 60000);
    // The server's totals, corrected by what changed on the screen since they were read.
    const delta = { calories: 0, carbs: 0, protein: 0, fat: 0, waterMl: 0 };
    const add = (e: DayEntry, sign: 1 | -1) => { delta.calories += sign * e.kcal; delta.carbs += sign * e.carbs; delta.protein += sign * e.protein; delta.fat += sign * e.fat; delta.waterMl += sign * (e.ml ?? 0); };
    for (const e of entries) {
      if (hidden.has(e.id)) add(e, -1);
      else if (overrides[e.id]) { add(e, -1); add(overrides[e.id]!, 1); }
    }
    for (const p of pending) add(p.entry, 1);
    return {
      goals: { calories: state.goals.calories, carbs: state.goals.carbs, protein: state.goals.protein, fat: state.goals.fat, waterMl: state.water.goalMl },
      eaten: { calories: state.eaten.calories + delta.calories, carbs: state.eaten.carbs + delta.carbs, protein: state.eaten.protein + delta.protein, fat: state.eaten.fat + delta.fat, waterMl: state.water.ml + delta.waterMl },
      minutes: Math.min(24 * 60 - 1, state.minutes + Math.max(0, elapsed)), window: state.window,
    };
  }, [state, now, loadedAt, entries, hidden, overrides, pending]);

  const view = useMemo(() => {
    if (!day) return null;
    const parts = { p: partOf(day, shown, "p"), c: partOf(day, shown, "c"), f: partOf(day, shown, "f"), w: partOf(day, shown, "w") };
    const line = lineWords(judgeHero(day, shown, metric), day, t, day.goals.calories * dayFraction(day.minutes, day.window));
    return { parts, line };
  }, [day, shown, metric, t]);

  // ---- actions: each one shows its result at once and confirms with the server afterwards ----
  const refresh = async (id?: string | null, note?: string) => { if (id) setRecent(note ? { id, note } : { id }); await load(); };
  /**
   * A new entry appears at once, dimmed while it saves, and the plate already counts it; the server's answer replaces it, or the bar
   * says it failed and offers a retry (EX-01m3y2sndaek9kpja0zp4n8py6, EX-01m3y2snkn5ckbaackcpjvzysf).
   */
  const addPending = (entry: DayEntry, run: () => Promise<string | null>) => {
    const p: Pending = { tid: entry.id, entry, status: "pending", run };
    setPending((x) => [...x, p]);
    void settle(p);
  };
  const settle = async (p: Pending) => {
    setPending((x) => x.map((q) => (q.tid === p.tid ? { ...q, status: "pending" } : q)));
    try {
      const id = await p.run();
      await refresh(id);
      setPending((x) => x.filter((q) => q.tid !== p.tid));
    } catch { setPending((x) => x.map((q) => (q.tid === p.tid ? { ...q, status: "failed" } : q))); }
  };
  const retry = (p: Pending, again: boolean) => { if (again) void settle(p); else setPending((x) => x.filter((q) => q.tid !== p.tid)); };
  const tempEntry = (o: Partial<DayEntry> & { name: string }): DayEntry => ({
    id: `tmp-${Date.now()}-${Math.round(Math.random() * 1e6)}`, kind: "meal", kcal: 0, carbs: 0, protein: 0, fat: 0, at: Date.now(), source: "button", estimate: false, ingredients: [], ...o,
  });
  const choose = (o: Option) => addPending(tempEntry({ name: o.name, kcal: o.kcal, carbs: o.carbs, protein: o.protein, fat: o.fat ?? 0, source: "photo", estimate: true }), async () => (await backend.log(o)).id);
  const logUsual = (u: Usual) => {
    if (u.kind === "water") addPending(tempEntry({ name: "Water", kind: "water", ml: u.ml ?? 250 }), async () => (await backend.water(u.ml ?? 250)).id);
    else addPending(tempEntry({ name: u.name, kcal: u.kcal, carbs: u.carbs, protein: u.protein, fat: u.fat }), async () => (await backend.log({ rank: 0, name: u.name, category: "other", kcal: u.kcal, carbs: u.carbs, protein: u.protein, fat: u.fat })).id);
  };
  const hide = (id: string, on: boolean) => setHidden((h) => { const n = new Set(h); if (on) n.add(id); else n.delete(id); return n; });
  const undo = async (e: DayEntry) => {
    hide(e.id, true); setRecent(null); setHighlight(null);
    try { await backend.unlog(e.id); await load(); hide(e.id, false); return true; } catch { hide(e.id, false); setFailNote(t.undoFailed); return false; }
  };
  // EX-01m6ph6eqsv1wt33vqx395z7nn: a card undone in the conversation says so and stays.
  const [undone, setUndone] = useState<Set<string>>(new Set());
  const undoCard = async (e: DayEntry) => { if (await undo(e)) setUndone((s) => new Set(s).add(e.id)); };
  const save = async (patch: EntryPatch) => {
    const before = editing;
    setEditing(null);
    if (before) {
      const { id: _id, time, mealType, ...vals } = patch;
      let at = before.at;
      if (time && state) { const [h, m] = time.split(":").map(Number); at = before.at + (((h ?? 0) * 60 + (m ?? 0)) - minutesOf(before.at, state.timeZone)) * 60000; }
      setOverrides((o) => ({ ...o, [before.id]: { ...before, ...vals, ...(mealType ? { mealType } : {}), at } }));
    }
    try {
      await backend.updateEntry(patch);
      const what = [patch.kcal !== undefined && before ? `${before.kcal} → ${patch.kcal} kcal` : "", patch.time ?? "", patch.mealType ? t[`meal${patch.mealType}` as const] : "", patch.name ?? ""].filter(Boolean).join(", ");
      await refresh(patch.id, t.cardChanged(what));
    } catch { setFailNote(t.editFailed); /* the entry is as it was */ }
    setOverrides((o) => { const { [patch.id]: _, ...rest } = o; return rest; });
  };
  const remove = async (e: DayEntry) => {
    setEditing(null); setHighlight(null); hide(e.id, true);
    try { await backend.deleteEntries([e.id]); await load(); hide(e.id, false); } catch { hide(e.id, false); setFailNote(t.deleteFailed); }
  };
  const deleteEntries = async (a: DeleteAsk): Promise<boolean> => { try { if (a.all) await backend.deleteAll(); else await backend.deleteEntries(a.ids); await load(); return true; } catch { return false; } };
  const send = (text: string, photos: Photo[], prefix = "", intent?: Side) => {
    const body = [prefix, text].filter(Boolean).join(" ") || t.photoQuestion;
    aui.thread().append({ role: "user", content: [...photos.map((p) => ({ type: "image" as const, image: `data:image/jpeg;base64,${p.base64}` })), { type: "text" as const, text: body }],
      ...(intent ? { metadata: { custom: { intent } } } : {}) });
  };
  // "Fotó a hűtőről" on the "Ennék" side: the photo goes straight to the sheet as the choices (BR-01m3y1prykkz2yqtf6g5fgz0ne).
  const fridge = async () => { const p = await takePhoto("camera"); if (p) { openWhatNow(); send("", [p], t.whatNow, "would"); } };
  const connect = () => { if (Platform.OS === "web") window.location.href = connectHealthUrl; else void Linking.openURL(connectHealthUrl); };
  const select = (m: Shown) => setMetric((cur) => nextShown(cur, m));
  const openWhatNow = () => { setMode("whatnow"); setSheetFrom(messages.length); setPicked(null); setHighlight(null); };
  // US-01m3s789qmvs4jx8e93nb2j61n (Record what was suggested and what was chosen): each answer of the sheet is recorded once, with
  // the option that was logged, or with none when the sheet is closed without one (EX-01m3s789wxqpqankpfp30newfx).
  const recorded = useRef(new Set<string>());
  const sheetAnswer = (): { id: string; options: Option[] } | null => {
    for (let i = messages.length - 1; i >= sheetFrom && i >= 0; i--) {
      const part = messages[i]!.content.find((p) => p.type === "tool-call" && p.toolName === "show_options");
      if (part) return { id: messages[i]!.id, options: (part.result as Option[] | undefined) ?? [] };
    }
    return null;
  };
  const record = (chosenRank: number | null) => {
    const a = sheetAnswer();
    if (!a || !a.options.length || recorded.current.has(a.id)) return;
    recorded.current.add(a.id);
    void backend.choice(a.options, chosenRank).catch(() => undefined);
  };
  const tapOption = (o: Option) => {
    if (picked !== o.rank) { setPicked(o.rank); return; }
    record(o.rank);
    setPicked(null); setMode("home"); choose(o);
  };

  // ---- the conversation: the messages in time order ----
  // The switch is there on the home and while typing from it; never after the eating window (EX-01m6nzdzz3r239egz1c4s68a98).
  const withSwitch = switchShown({ ready, afterWindow: !!day && day.minutes >= day.window.endHour * 60, mode, armed });
  useEffect(() => { if (mode === "home") setArmed(false); }, [mode]);
  const items: Item[] = useMemo(() => {
    const out: Item[] = [];
    if (!ready) out.push({ key: "greet", time: 0, node: <View style={bubble(false)}><Text style={{ fontFamily: T.face.body, fontSize: T.font.body, color: c.onSurface }}>{t.greetSetup}</Text></View> });
    else if (messages.length === 0) out.push({ key: "empty", time: 0, node: <View style={bubble(false)}><Text style={{ fontFamily: T.face.body, fontSize: T.font.body, color: c.onSurface }}>{t.threadEmpty}</Text></View> });
    // Ordered by place in the thread, not by the clock: messages sent within one millisecond (or under a fixed test clock) keep their order.
    messages.forEach((m, mi) => {
      const time = 1 + mi * 1000;
      const user = m.role === "user";
      const pics = m.content.filter((p) => p.type === "image" && p.image);
      if (pics.length) out.push({ key: `m-${m.id}-img`, time, node: (
        <View style={{ ...bubble(true), padding: 6, flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "flex-end" }}>
          {pics.map((p, i) => <Image key={i} source={{ uri: p.image }} style={{ width: pics.length === 1 ? 190 : 90, height: pics.length === 1 ? 110 : 90, borderRadius: 14 }} />)}
        </View>) });
      m.content.forEach((p, i) => {
        const key = `m-${m.id}-${i}`;
        const meta = m.metadata?.custom;
        if (p.type === "text" && p.text && !user && meta?.failed) out.push({ key, time: time + i, node: <NotSent reason={p.text} retry={meta.retry !== false && !running} t={t} onRetry={() => aui.thread().message({ id: m.id }).reload()} /> });
        else if (p.type === "text" && p.text && !user) out.push({ key, time: time + i, node: <RichText text={p.text} /> });
        else if (p.type === "text" && p.text && !(user && p.text === t.photoQuestion && m.content.some((q) => q.type === "image"))) out.push({ key, time: time + i, node: <View style={bubble(user)}><Text style={{ fontFamily: T.face.body, fontSize: T.font.body, lineHeight: 23, color: c.onStrong }}>{p.text}</Text></View> });
        else if (p.type === "tool-call" && p.toolName === "steps") {
          const st = p.result as { steps: Step[]; done: boolean };
          // A reply that is no longer written (done, or stopped) shows its steps folded.
          out.push({ key, time: time + i, node: <Steps steps={st.steps} done={st.done || !(running && mi === messages.length - 1)} t={t} /> });
        }
        else if (p.type === "tool-call" && p.toolName === "logged") {
          const info = p.result as LoggedInfo;
          const entry = shown.find((e) => e.id === info.id);
          out.push({ key, time: time + i, node: <LoggedCard info={info} entry={entry} undone={undone.has(info.id)} t={t} onEdit={(e) => setEditing(e)} onUndo={(e) => void undoCard(e)} /> });
        }
        else if (p.type === "tool-call" && p.toolName === "confirm_delete") out.push({ key, time: time + i, node: <ConfirmDelete ask={p.result as DeleteAsk} onConfirm={deleteEntries} /> });
      });
      if (m.metadata?.custom?.failedPhoto) out.push({ key: `f-${m.id}`, time: time + 500, node: <View style={{ flexDirection: "row", gap: 8 }}><Chip label={t.describe} onPress={() => setFocusSignal((n) => n + 1)} /></View> });
    });
    const lastMsg = messages[messages.length - 1];
    if (running && (!lastMsg || lastMsg.role === "user" || lastMsg.content.length === 0)) out.push({ key: "thinking", time: Number.MAX_SAFE_INTEGER, node: <Text style={{ fontFamily: T.face.body, fontSize: T.font.body, color: c.onSurfaceVariant }}>{t.thinking}</Text> });
    return out.sort((a, b) => a.time - b.time);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, ready, t, running, scheme, shown, undone]);
  useEffect(() => { const id = setTimeout(() => list.current?.scrollToEnd({ animated: false }), 120); return () => clearTimeout(id); }, [items.length, mode]);

  const replies = lastMeta.replies?.length ? lastMeta.replies : ready ? [] : t.firstReplies;
  const showConsent = lastMeta.needsConsent && !consented;
  const tz = state?.timeZone ?? "UTC";
  const dateText = cap(new Intl.DateTimeFormat(lang === "hu" ? "hu-HU" : "en-GB", { weekday: "long", month: "long", day: "numeric", timeZone: tz }).format(new Date(now)));
  const status: Record<string, "pending" | "failed"> = Object.fromEntries(pending.map((p) => [p.tid, p.status]));
  // The plate takes what is left once the line, the figures, today's entries, the button and the dock are placed: on a short screen
  // the plate shrinks rather than the dock falling below the fold (EX-01m3w51cz41qvfw0mfa79pbphx, "visible without scrolling").
  const plateSize = Math.max(170, Math.min(300, width - 32 - 76, height - 505));
  const pickedOption = mode === "whatnow" && picked !== null ? (() => {
    for (let i = messages.length - 1; i >= sheetFrom && i >= 0; i--) {
      const part = messages[i]!.content.find((p) => p.type === "tool-call" && p.toolName === "show_options");
      if (part) return ((part.result as Option[] | undefined) ?? []).find((o) => o.rank === picked) ?? null;
    }
    return null;
  })() : null;

  // ---- the bar above the dock: a failure first, then the chosen entry, then what was just logged or changed ----
  const failed = pending.find((p) => p.status === "failed");
  const barEntry = highlight ? shown.find((e) => e.id === highlight) : recent ? shown.find((e) => e.id === recent.id) : undefined;
  const editable = (e: DayEntry) => e.kind === "meal" && e.source !== "google" && !status[e.id];
  const amountOf = (e: DayEntry) => (e.kind === "water" ? `${e.ml}\u00a0ml` : `${e.kcal}\u00a0kcal`);
  const carded = new Set(messages.flatMap((m) => m.content.filter((p) => p.type === "tool-call" && p.toolName === "logged").map((p) => (p.result as LoggedInfo).id)));
  let bar: { text: string; error?: boolean; actions: BarAction[] } | null = null;
  if (failNote) bar = { text: failNote, error: true, actions: [{ label: t.close, onPress: () => setFailNote(null) }] };
  else if (failed) bar = { text: `${t.failedSave} ${failed.entry.kind === "water" ? t.waterLabel : shortName(failed.entry.name)}`, error: true, actions: [{ label: t.retry, onPress: () => retry(failed, true) }, { label: t.discard, onPress: () => retry(failed, false) }] };
  else if (barEntry && highlight) bar = { text: `${hm(minutesOf(barEntry.at, tz))} · ${barEntry.kind === "water" ? t.waterLabel : barEntry.name} · ${amountOf(barEntry)}`, actions: editable(barEntry) ? [{ label: t.cardEdit, onPress: () => setEditing(barEntry) }] : [] };
  // In the conversation an entry it logged has its own card (EX-01m6ph6eqsv1wt33vqx395z7nn), so the short bar would only repeat it.
  else if (barEntry && recent && !(mode === "talk" && !recent.note && carded.has(barEntry.id))) bar = { text: recent.note ?? t.loggedBar(barEntry.kind === "water" ? t.waterLabel : shortName(barEntry.name), amountOf(barEntry)),
    actions: [...(editable(barEntry) ? [{ label: t.cardEdit, onPress: () => setEditing(barEntry) }] : []), ...(barEntry.source !== "google" && !status[barEntry.id] ? [{ label: t.cardUndo, onPress: () => void undo(barEntry) }] : [])] };

  const top = (closing: boolean) => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 18, paddingTop: 6, minHeight: 48 }}>
      <Text style={{ flex: 1, fontFamily: T.face.semi, fontSize: 13, color: c.onSurfaceVariant }}>{dateText}</Text>
      {day && !closing ? <Text style={{ fontFamily: T.face.semi, fontSize: 13, color: c.onSurfaceVariant, ...T.numeric }}>{hm(day.minutes)}</Text> : null}
      <Pressable accessibilityRole="button" accessibilityLabel={closing ? t.backToPlate : t.conversation} onPress={() => setMode(closing ? "home" : "talk")}
        style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: c.outline, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}>
        <UiIcon name={closing ? "x" : "message"} size={19} color={c.onSurface} />
      </Pressable>
    </View>
  );

  // ---- onboarding: the first conversation, before there is a day to show ----
  const talk = (
    <ThreadPrimitive.Root style={{ flex: 1 }}>
      <FlatList ref={list} data={items} keyExtractor={(i) => i.key} renderItem={({ item }) => <View style={{ paddingVertical: 4 }}>{item.node}</View>}
        style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: T.space.l, paddingTop: 8, paddingBottom: 8, flexGrow: 1, justifyContent: "flex-end" }}
        onContentSizeChange={() => list.current?.scrollToEnd({ animated: false })} />
      {showConsent ? (
        <View style={{ marginHorizontal: T.space.l, marginBottom: 8, gap: T.space.s, backgroundColor: c.surface, borderWidth: 1, borderColor: c.outline, borderRadius: T.radius.card, padding: T.space.l }}>
          <Text style={{ fontFamily: T.face.body, fontSize: T.font.meta, color: c.onSurface }}>{t.consentText}</Text>
          <Button label={t.consentButton} onPress={() => void backend.consent().then(() => { setConsented(true); setReady(true); })} />
        </View>
      ) : null}
    </ThreadPrimitive.Root>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.table }} onLayout={(e) => { setWidth(e.nativeEvent.layout.width); setHeight(e.nativeEvent.layout.height); }}>
      {!ready ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: T.space.m, height: 48, paddingHorizontal: T.space.xl }}>
          <Logo size={30} />
          <Text style={{ fontFamily: T.face.display, fontSize: T.font.title, letterSpacing: -0.4, color: c.onSurface }}>{t.appName}</Text>
        </View>
      ) : top(mode === "talk")}
      {slow ? <View style={{ marginHorizontal: T.space.l, marginBottom: 6, alignSelf: "flex-start", backgroundColor: c.surface, borderRadius: T.radius.chip, paddingVertical: 6, paddingHorizontal: 14 }}><Text accessibilityLiveRegion="polite" style={{ fontFamily: T.face.semi, fontSize: T.font.meta, color: c.onSurfaceVariant }}>{t.slowNet}</Text></View> : null}

      {!ready ? talk : null}

      {ready && !view ? (
        <View style={{ alignItems: "center", paddingTop: 12, gap: 16 }}>
          <View style={{ width: plateSize, height: plateSize, borderRadius: plateSize / 2, backgroundColor: c.stone, opacity: 0.35 }} />
          {loadFailed ? (
            <View style={{ alignItems: "center", gap: 10, paddingHorizontal: 24 }}>
              <Text style={{ fontFamily: T.face.body, fontSize: T.font.body, color: c.onSurface, textAlign: "center" }}>{t.loadFailed}</Text>
              <Chip label={t.retry} selected onPress={() => void load()} />
            </View>
          ) : null}
        </View>
      ) : null}

      {ready && view && day && mode === "talk" ? (
        <>
          <FoldedPlate parts={view.parts} line={view.line} kcal={day.eaten.calories} goal={day.goals.calories} minutes={day.minutes} t={t} onOpen={() => setMode("home")} />
          {talk}
        </>
      ) : null}

      {ready && view && day && mode !== "talk" ? (
        <>
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 2, paddingTop: 8, paddingHorizontal: 14 }}>
            <Plate parts={view.parts} kcal={{ eaten: day.eaten.calories, goal: day.goals.calories }} selected={metric} highlight={highlight} size={plateSize}
              preview={pickedOption ? { p: pickedOption.protein, c: pickedOption.carbs, f: pickedOption.fat ?? 0 } : null}
              onSelect={select} labels={{ p: t.nameP, c: t.nameC, f: t.nameF }} />
            <Glass part={view.parts.w} width={Math.max(46, Math.round(plateSize * 0.24))} selected={metric === "w"} dim={metric !== "kcal" && metric !== "w"} highlight={highlight} onSelect={() => select("w")} label={t.nameW} />
          </View>
          <View style={{ gap: 12, paddingTop: 12 }}>
            <View accessibilityLiveRegion="polite" style={{ flexDirection: "row", gap: 8, paddingHorizontal: 20 }}>
              <View style={{ paddingTop: 1 }}><Mark kind={view.line.mark} /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: T.face.displaySemi, fontSize: T.font.line, lineHeight: 24, letterSpacing: -0.2, color: c.onSurface, ...T.numeric }}>{view.line.text}</Text>
                {view.line.sub ? <Text style={{ fontFamily: T.face.body, fontSize: T.font.meta, color: c.onSurfaceVariant, marginTop: 2 }}>{view.line.sub}</Text> : null}
              </View>
            </View>
            <Figures parts={view.parts} selected={metric} onSelect={select} t={t} />
            {/* EX-01m6nze05k4np1swbj179esg8j: the legend names the food of each third. */}
            <Text style={{ fontFamily: T.face.body, fontSize: 12, color: c.onSurfaceVariant, textAlign: "center", marginTop: -4 }}>{t.legend}</Text>
          </View>

          {mode === "whatnow" ? (
            <WhatNow t={t} messages={messages} from={sheetFrom} running={running} picked={picked} onTap={tapOption}
              onClose={() => { record(null); setMode("home"); setPicked(null); }} onSend={(x, p) => send(x, p, messages.length === sheetFrom ? t.whatNow : "", "would")} onStop={() => aui.thread().cancelRun()} />
          ) : (
            <>
              <View style={{ flex: 1, minHeight: 16 }} />
              {!healthConnected && !dismissedConnect ? (
                <View style={{ marginHorizontal: 16, marginBottom: 12, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: c.surface, borderWidth: 1, borderColor: c.outline, borderRadius: 16, padding: 10, paddingLeft: 14 }}>
                  <Text style={{ flex: 1, fontFamily: T.face.body, fontSize: 13, color: c.onSurfaceVariant }}>{t.connectText}</Text>
                  <Chip label={t.connectButton} selected onPress={connect} />
                  <Pressable accessibilityRole="button" accessibilityLabel={t.connectDismiss} onPress={() => setDismissedConnect(true)} style={{ width: 36, height: 44, alignItems: "center", justifyContent: "center" }}><UiIcon name="x" size={16} color={c.onSurfaceVariant} /></Pressable>
                </View>
              ) : null}
              <View style={{ gap: 10, paddingBottom: 12 }}>
                <DayStrip entries={shown} timeZone={tz} metric={metric} highlight={highlight} status={status} t={t}
                  onTap={(e) => { setRecent(null); setHighlight((h) => (h === e.id ? null : e.id)); }} />
                {/* The "What should I eat now?" button is the dock's "Ennék" side now (US-01m3rwa0cvrtcapqk0k3h6mqvc). */}
              </View>
            </>
          )}
        </>
      ) : null}
      {mode !== "whatnow" || !ready ? (
        <Dock bar={mode === "talk" && highlight ? null : bar} t={t} running={running} focusSignal={focusSignal} onDraft={onDraft}
          side={withSwitch ? side : null} onSide={pickSide} hint={hint} onStop={() => aui.thread().cancelRun()}
          placeholder={withSwitch ? (side === "would" ? t.placeholderWould : t.placeholderAte) : t.placeholder}
          chips={!ready || mode === "talk"
            ? replies.map((r) => <Chip key={r} label={r} onPress={() => send(r, [])} />)
            : side === "would" && withSwitch
              ? [<Chip key="now" ui="utensils" label={day && day.minutes < 10 * 60 && !shown.some((e) => e.kind === "meal") ? t.whatNowBreakfast : t.whatNow} onPress={openWhatNow} />,
                 <Chip key="fridge" ui="camera" label={t.fridgeChip} onPress={() => void fridge()} />]
              : usuals.slice(0, 6).map((u) => <Chip key={`${u.kind}-${u.name}`} icon={u.kind === "water" ? "water" : undefined} label={u.kind === "water" ? `${u.ml} ml` : shortName(u.name)} onPress={() => logUsual(u)} />)}
          onSend={(x, p) => {
            const intent = intentOf(withSwitch, side);
            if (intent === "would") { openWhatNow(); send(x, p, t.whatNow, "would"); return; }
            send(x, p, "", intent); if (ready) setMode("talk");
          }}
          onFocus={() => { if (ready) { setArmed(mode === "home" || armed); setMode("talk"); setHighlight(null); } }} />
      ) : null}
      {editing && state ? <EditSheet entry={editing} timeZone={state.timeZone} t={t} onSave={(p) => void save(p)} onDelete={(e) => void remove(e)} onClose={() => setEditing(null)} /> : null}
    </View>
  );
}

/**
 * The dock (EX-01m3w51d5bqfv5qhk9smp3yxyj): the bar of what was just done, a row of chips, the camera and the field. On the home the
 * chips are the usual items: one logs at once and its layer grows on the plate (US-01m3w51bzh8h6t8npn6k80r782); they come from the
 * history, so the first in the morning is often yesterday's breakfast (EX-01m3y1pv8jmdbqay69dw1xzwcx). In the conversation they are
 * the assistant's quick replies. One dock serves both, so the field keeps its focus when the plate folds.
 */
function Dock({ bar, chips, t, running, onSend, onFocus, onDraft, onStop, focusSignal, side, onSide, hint, placeholder }:
  { bar: { text: string; error?: boolean; actions: BarAction[] } | null; chips: React.ReactNode[]; t: Texts; running: boolean; onSend: (text: string, photos: Photo[]) => void; onFocus: () => void; onDraft: (typing: boolean) => void; focusSignal: number;
    side: Side | null; onSide: (s: Side) => void; hint: boolean; placeholder: string; onStop: () => void }) {
  return (
    <>
      {bar ? <ActionBar {...bar} /> : null}
      <View style={{ paddingTop: 10, paddingBottom: 14, paddingHorizontal: 14, gap: 8, borderTopWidth: 1, borderTopColor: c.outline, backgroundColor: c.surface }}>
        {side ? <SideSwitch side={side} onSide={onSide} t={t} /> : null}
        {side && hint ? <Text style={{ fontFamily: T.face.body, fontSize: 12.5, color: c.onSurfaceVariant, textAlign: "center" }}>{t.sideHint}</Text> : null}
        {chips.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 14 }} style={{ marginHorizontal: -14 }}>{chips}</ScrollView> : null}
        <Composer t={t} running={running} placeholder={placeholder} onSend={onSend} onFocus={onFocus} onDraft={onDraft} onStop={onStop} focusSignal={focusSignal} />
      </View>
    </>
  );
}

/** BR-01m6ph6dq7aszxhxgzz4kgr8d4: the assistant's reply across the width, without a bubble, with its bold and its lists. */
function RichText({ text }: { text: string }) {
  const base = { fontFamily: T.face.body, fontSize: T.font.body, lineHeight: 23, color: c.onSurface } as const;
  const spans = (ss: { text: string; bold: boolean }[]) => ss.map((s, i) => <Text key={i} style={s.bold ? { fontFamily: T.face.bold } : null}>{s.text}</Text>);
  return (
    <View style={{ gap: 4, paddingRight: 8 }}>
      {blocksOf(text).map((b, i) => b.kind === "p"
        ? <Text key={i} style={base}>{spans(b.spans)}</Text>
        : <View key={i} style={{ flexDirection: "row", gap: 8, paddingLeft: 4 }}><Text style={{ ...base, color: c.onSurfaceVariant }}>{b.mark}</Text><Text style={{ ...base, flex: 1 }}>{spans(b.spans)}</Text></View>)}
    </View>
  );
}

/** BR-01m6pmf9avbbgd373z1jcvvaqw: the steps of a reply, each ticked when done; once the reply is done they fold into one quiet line
 * that opens on a tap (EX-01m6pmf9repmym9yf87emkrjph). */
function Steps({ steps, done, t }: { steps: Step[]; done: boolean; t: Texts }) {
  const [open, setOpen] = useState(false);
  const w = stepWords(t);
  const meta = { fontFamily: T.face.body, fontSize: 13, color: c.onSurfaceVariant } as const;
  if (done && !open) {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={t.stepsOpen} onPress={() => setOpen(true)} style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 32 }}>
        <UiIcon name="check" size={14} color={c.good} />
        <Text numberOfLines={1} style={{ ...meta, flex: 1 }}>{stepSummary(w, steps)}</Text>
        <UiIcon name="chevron" size={14} color={c.onSurfaceVariant} />
      </Pressable>
    );
  }
  return (
    <Pressable disabled={!done} onPress={() => setOpen(false)} accessibilityLiveRegion="polite" style={{ gap: 4 }}>
      {steps.map((s) => (
        <View key={s.id} style={{ flexDirection: "row", alignItems: "center", gap: 8, minHeight: 22 }}>
          {s.done ? <UiIcon name="check" size={14} color={c.good} /> : <ActivityIndicator size="small" color={c.onSurfaceVariant} style={{ transform: [{ scale: 0.7 }], width: 14, height: 14 }} />}
          <Text style={{ ...meta, color: s.done ? c.onSurfaceVariant : c.onSurface }}>{stepLabel(w, s)}</Text>
        </View>
      ))}
    </Pressable>
  );
}

/** EX-01m6ph6eqsv1wt33vqx395z7nn: what the conversation logged stays in it, with Edit and Undo, and says so once it was undone. */
function LoggedCard({ info, entry, undone, t, onEdit, onUndo }: { info: LoggedInfo; entry: DayEntry | undefined; undone: boolean; t: Texts; onEdit: (e: DayEntry) => void; onUndo: (e: DayEntry) => void }) {
  const name = entry?.name ?? info.name;
  const water = info.ml !== undefined || entry?.kind === "water";
  const amount = water ? `${entry?.ml ?? info.ml ?? 0} ml` : `${entry?.kcal ?? info.kcal} kcal`;
  const meta = { fontFamily: T.face.body, fontSize: 12.5, color: c.onSurfaceVariant, ...T.numeric } as const;
  return (
    <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.outline, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 14, gap: 6, opacity: undone ? 0.6 : 1 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Text numberOfLines={2} style={{ flex: 1, fontFamily: T.face.bold, fontSize: 15, color: c.onSurface, textDecorationLine: undone ? "line-through" : "none" }}>{water ? t.waterLabel : name}</Text>
        <Text style={{ fontFamily: T.face.bold, fontSize: 15, color: c.onSurface, ...T.numeric }}>{amount}</Text>
      </View>
      {entry && !water ? (
        <View style={{ flexDirection: "row", gap: 12 }}>
          {([["p", entry.protein], ["c", entry.carbs], ["f", entry.fat]] as const).map(([k, g]) => (
            <View key={k} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: k === "p" ? c.protein : k === "c" ? c.carbs : c.fat, borderWidth: k === "c" ? 1 : 0, borderColor: c.grainEdge }} />
              <Text style={meta}>{k === "p" ? t.nameP : k === "c" ? t.nameC : t.nameF} {Math.round(g)} g</Text>
            </View>
          ))}
        </View>
      ) : null}
      {undone ? <Text style={meta}>{t.undone}</Text> : entry ? (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Chip label={t.editEntry} onPress={() => onEdit(entry)} />
          <Chip label={t.undo} onPress={() => onUndo(entry)} />
        </View>
      ) : null}
    </View>
  );
}

/** EX-01m6ph6eh98wgvrjw6gyy2r9tr: a message that did not go out says so under it, with "Újra"; nothing is sent again by itself. */
function NotSent({ reason, retry, t, onRetry }: { reason: string; retry: boolean; t: Texts; onRetry: () => void }) {
  return (
    <View style={{ alignSelf: "flex-end", alignItems: "flex-end", gap: 2, maxWidth: "86%" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ fontFamily: T.face.semi, fontSize: 13, color: c.warn }}>{t.notSent}</Text>
        {retry ? (
          <Pressable accessibilityRole="button" onPress={onRetry} style={{ flexDirection: "row", alignItems: "center", gap: 4, minHeight: 36, paddingHorizontal: 8 }}>
            <UiIcon name="retry" size={14} color={c.primary} />
            <Text style={{ fontFamily: T.face.bold, fontSize: 13, color: c.primary }}>{t.sendAgain}</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={{ fontFamily: T.face.body, fontSize: 12.5, color: c.onSurfaceVariant, textAlign: "right" }}>{reason}</Text>
    </View>
  );
}

/** BR-01m6ph6dgw3qxzxjjy1sh3t0yz: "Ettem" logs what is sent, "Ennék" asks for options; two halves of one pill, the chosen one filled. */
function SideSwitch({ side, onSide, t }: { side: Side; onSide: (s: Side) => void; t: Texts }) {
  const half = (s: Side, label: string) => (
    <Pressable key={s} accessibilityRole="button" accessibilityState={{ selected: side === s }} onPress={() => onSide(s)}
      style={{ flex: 1, minHeight: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: side === s ? c.strong : "transparent" }}>
      <Text style={{ fontFamily: T.face.bold, fontSize: 14.5, color: side === s ? c.onStrong : c.onSurfaceVariant }}>{label}</Text>
    </Pressable>
  );
  return (
    <View accessibilityRole="tablist" accessibilityLabel={t.sideLabel} style={{ flexDirection: "row", padding: 3, borderRadius: 22, borderWidth: 1, borderColor: c.outline, backgroundColor: c.surfaceLow }}>
      {half("ate", t.sideAte)}{half("would", t.sideWould)}
    </View>
  );
}

/** EX-01m3y1pvkekmsy4pdbw3w46qk1: while the conversation is open the plate folds into one line; a tap brings the plate back. */
function FoldedPlate({ parts, line, kcal, goal, minutes, t, onOpen }:
  { parts: Record<Drawn, ReturnType<typeof partOf>>; line: ReturnType<typeof lineWords>; kcal: number; goal: number; minutes: number; t: Texts; onOpen: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={t.backToPlate} onPress={onOpen}
      style={{ marginHorizontal: 16, marginTop: 4, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surface, borderWidth: 1, borderColor: c.outline, borderRadius: 18, paddingVertical: 6, paddingLeft: 6, paddingRight: 14, minHeight: 56 }}>
      <Plate parts={parts} kcal={{ eaten: kcal, goal }} selected="kcal" size={44} mini labels={{ p: t.nameP, c: t.nameC, f: t.nameF }} />
      <Mark kind={line.mark} size={20} />
      <Text numberOfLines={2} style={{ flex: 1, fontFamily: T.face.displaySemi, fontSize: 16, color: c.onSurface, ...T.numeric }}>{line.text}</Text>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ fontFamily: T.face.bold, fontSize: 14, color: c.onSurface, ...T.numeric }}>{amountText("kcal", kcal)}</Text>
        <Text style={{ fontFamily: T.face.body, fontSize: 12.5, color: c.onSurfaceVariant, ...T.numeric }}>{hm(minutes)}</Text>
      </View>
    </Pressable>
  );
}

/**
 * "What should I eat now?" on a sheet under the figures: what the assistant asks or answers, its options, and the field to answer.
 * EX-01m3rwa0je7dfzm48e1f496wnr: the answer names the gap and proposes foods for it; the chosen one is previewed on the plate.
 */
function WhatNow({ t, messages, from, running, picked, onTap, onClose, onSend, onStop }:
  { t: Texts; messages: { content: Part[]; role: string }[]; from: number; running: boolean; picked: number | null; onTap: (o: Option) => void; onClose: () => void; onSend: (text: string, photos: Photo[]) => void; onStop: () => void }) {
  const since = messages.slice(from);
  const lastAssistant = [...since].reverse().find((m) => m.role !== "user");
  const said = lastAssistant?.content.filter((p) => p.type === "text" && p.text).map((p) => p.text).join(" ") ?? "";
  const options = (lastAssistant?.content.find((p) => p.type === "tool-call" && p.toolName === "show_options")?.result as Option[] | undefined) ?? [];
  return (
    <View style={{ flex: 1, marginTop: 14, backgroundColor: c.surface, borderTopLeftRadius: T.radius.sheet, borderTopRightRadius: T.radius.sheet, borderWidth: 1, borderBottomWidth: 0, borderColor: c.outline, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14, gap: 8 }}>
      <View style={{ alignSelf: "center", width: 36, height: 4, borderRadius: 2, backgroundColor: c.outline }} />
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ flex: 1, fontFamily: T.face.display, fontSize: T.font.title, color: c.onSurface }}>{t.whatNow}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={t.close} onPress={onClose} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}><UiIcon name="x" size={18} color={c.onSurfaceVariant} /></Pressable>
      </View>
      <Text style={{ fontFamily: T.face.body, fontSize: 14, color: c.onSurfaceVariant }}>{running ? t.thinking : said || t.whatNowHint}</Text>
      <View style={{ flex: 1 }}>{options.length ? <Suggestions options={options} picked={picked} onTap={onTap} t={t} /> : null}</View>
      {options.length ? null : <Composer t={t} running={running} placeholder={t.whatNowHint} onSend={onSend} onStop={onStop} />}
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
      setInitial(turns.flatMap((x): Initial => {
        if (x.role === "user") return x.text ? [{ role: "user", content: [{ type: "text" as const, text: x.text }], createdAt: new Date(x.at) }] : [];
        // The reply comes back as it was: its text and the cards of what it logged (EX-01m6ph6eqsv1wt33vqx395z7nn).
        const parts = partsOf((x.events ?? []).filter((e) => e.type === "text" || e.type === "logged" || e.type === "logged_water"));
        return parts.length ? [{ role: "assistant", content: parts, createdAt: new Date(x.at) }] : [];
      }));
    }).catch(() => setInitial([]));
  }, []);
  return initial ? <WithRuntime {...props} initial={initial} /> : <Splash />;
}
