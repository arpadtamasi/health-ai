// The app's own texts in the languages it speaks. The chat answers in the person's language by itself; when it saves a language
// (the first time they write in Hungarian, say) the app switches too. Until one is saved, the phone's language decides.
import { createContext, useContext, type ReactNode } from "react";
import { Platform } from "react-native";

export type Lang = "en" | "hu";

const en = {
  appName: "Health AI",
  greetSetup: "Hi! I help you decide what to eat, from what you already ate today. First, a short setup: is there anything I should never suggest, like an allergy or something you dislike?",
  greetReady: "Hi! Ask me what to eat, tell me what you ate, or show me a photo.",
  firstReplies: ["None", "Nuts", "Lactose", "Gluten"],
  whatNow: "What should I eat now?",
  photoQuestion: "What can I eat from this?",
  placeholder: "Write or speak…",
  openCamera: "Open the camera",
  undo: "Undo",
  undone: "Undone.",
  undoFailed: "I could not undo that.",
  logged: (name: string, kcal: number) => `Logged ${name} (${kcal} kcal).`,
  calories: "Calories",
  carbs: "Carbs",
  protein: "Protein",
  consentText: "I am a tracker and suggestion aid for adults, not medical advice. By continuing you agree that your chat and photos go to the AI provider. Photos are not stored by us; the chat stays on your device.",
  consentButton: "Agree and continue",
  errDailyLimit: "Daily limit reached. The chat and the camera are back tomorrow.",
  errUnavailable: "The chat is not available right now.",
  errGeneric: "Something went wrong. Please try again.",
  signInTitle: "What should I eat now?",
  signInText: "I know what you ate today and where you should be by now, and I tell you what to eat next. Sign in with Google to start. Google Health is optional.",
  signInButton: "Sign in with Google",
  cameraTitle: "Camera access",
  cameraText: "I read what you can choose from (a fridge, a menu, a counter, a plate) from a photo. The photo goes to the AI provider for the answer and is not stored by us.",
  cameraAllow: "Allow the camera",
  cameraHint: "Point at the fridge, a menu, the counter, a plate, anything",
  typeInstead: "Type instead",
  takePhoto: "Take the photo",
  status: "Status",
  chat: "Chat",
  log: "Log",
  photo: "Photo",
  water: "Water",
  ofGoal: (goal: string) => `of ${goal}`,
  under: (v: string) => `${v} under`,
  over: (v: string) => `${v} over`,
  heroOverline: (time: string, behind: boolean) => (behind ? `${time} · BEHIND THE PLAN` : `${time} · ON THE PLAN`),
  heroBig: (label: string, gap: string) => `${label} −${gap}`,
  heroOnPlan: "On the plan",
  heroUnder: (under: number, left: number) => `${under} kcal under the plan for now. ${left} kcal left today.`,
  heroOver: (over: number, left: number) => `${over} kcal over the plan for now. ${left} kcal left today.`,
  toastUndo: "Undo",
  loading: "Loading…",
  waterLogged: (ml: number) => `Logged ${ml} ml of water.`,
  waterLabel: "Water",
  waterOf: (goal: number) => `of ${goal} ml`,
  waterLeft: (ml: number) => `${ml} ml to go`,
  waterDone: "Goal reached",
  deleteTitle: "Delete from your history?",
  deleteAllTitle: "Delete your whole history?",
  deleteAllText: "Every meal and glass of water kept by this service is deleted. Copies in Google Health stay as they are.",
  deleteConfirm: "Delete",
  deleteCancel: "Keep",
  deleted: "Deleted.",
  deleteFailed: "I could not delete that.",
  connectTitle: "Connect Google Health",
  connectText: "From now on your meals and water also appear in Google Health. What you logged before stays here only.",
  connectButton: "Connect",
  signInOnly: "Your meals and water are kept by this service.",
  claudeTitle: "Use it from Claude",
  claudeText: "Add this address in Claude (Settings, Connectors, Add custom connector) to ask about your sleep, heart rate and activity, and to log meals in the conversation. This needs Google Health.",
  copy: "Copy",
  copied: "Copied",
};

const hu: typeof en = {
  appName: "Health AI",
  greetSetup: "Szia! Segítek eldönteni, mit egyél, abból, amit ma már ettél. Először egy rövid beállítás: van valami, amit sosem szabad ajánlanom, például allergia vagy amit nem szeretsz?",
  greetReady: "Szia! Kérdezd meg, mit egyél, mondd el, mit ettél, vagy mutass egy fotót.",
  firstReplies: ["Nincs", "Mogyoró", "Laktóz", "Glutén"],
  whatNow: "Mit egyek most?",
  photoQuestion: "Mit ehetek ebből?",
  placeholder: "Írj vagy mondd…",
  openCamera: "Kamera megnyitása",
  undo: "Visszavonás",
  undone: "Visszavonva.",
  undoFailed: "Ezt nem sikerült visszavonni.",
  logged: (name, kcal) => `Naplózva: ${name} (${kcal} kcal).`,
  calories: "Kalória",
  carbs: "Szénh.",
  protein: "Fehérje",
  consentText: "Követő és javaslattevő segéd vagyok felnőtteknek, nem orvosi tanács. A folytatással elfogadod, hogy a chatet és a fotókat az AI-szolgáltató kapja. A fotókat nem tároljuk, a chat az eszközödön marad.",
  consentButton: "Elfogadom, tovább",
  errDailyLimit: "Elérted a napi limitet. A chat és a kamera holnap újra működik.",
  errUnavailable: "A chat most nem érhető el.",
  errGeneric: "Hiba történt. Próbáld újra.",
  signInTitle: "Mit egyek most?",
  signInText: "Tudom, mit ettél ma és hol kellene tartanod, és megmondom, mit egyél legközelebb. A kezdéshez lépj be Google-lel. A Google Health nem kötelező.",
  signInButton: "Belépés Google-lel",
  cameraTitle: "Kamera engedély",
  cameraText: "Fotóról olvasom le, miből választhatsz (hűtő, étlap, pult, tányér). A fotó az AI-szolgáltatóhoz kerül a válaszhoz, nálunk nem tárolódik.",
  cameraAllow: "Kamera engedélyezése",
  cameraHint: "Mutass a hűtőre, étlapra, pultra, tányérra, bármire",
  typeInstead: "Inkább beírom",
  takePhoto: "Fotó készítése",
  status: "Státusz",
  chat: "Chat",
  log: "Naplózás",
  photo: "Fotó",
  water: "Víz",
  ofGoal: (goal) => `${goal}-ból`,
  under: (v) => `${v} alatta`,
  over: (v) => `${v} felette`,
  heroOverline: (time, behind) => (behind ? `${time} · A TERV MÖGÖTT` : `${time} · A TERVEN`),
  heroBig: (label, gap) => `${label} −${gap}`,
  heroOnPlan: "A terven vagy",
  heroUnder: (under, left) => `${under} kcal a terv alatt most. Ma még ${left} kcal van hátra.`,
  heroOver: (over, left) => `${over} kcal a terv felett most. Ma még ${left} kcal van hátra.`,
  toastUndo: "Visszavonás",
  loading: "Betöltés…",
  waterLogged: (ml) => `Naplózva: ${ml} ml víz.`,
  waterLabel: "Víz",
  waterOf: (goal) => `${goal} ml-ből`,
  waterLeft: (ml) => `még ${ml} ml`,
  waterDone: "Cél elérve",
  deleteTitle: "Törlöd az előzményedből?",
  deleteAllTitle: "Törlöd az egész előzményedet?",
  deleteAllText: "Minden, a szolgáltatásnál tárolt étkezés és pohár víz törlődik. A Google Health-ben lévő másolatok maradnak.",
  deleteConfirm: "Törlés",
  deleteCancel: "Marad",
  deleted: "Törölve.",
  deleteFailed: "Ezt nem sikerült törölni.",
  connectTitle: "Google Health összekötése",
  connectText: "Mostantól az étkezéseid és a vized a Google Health-ben is megjelennek. Ami korábban volt, az csak itt marad.",
  connectButton: "Összekötés",
  signInOnly: "Az étkezéseidet és a vizedet ez a szolgáltatás őrzi.",
  claudeTitle: "Használd Claude-ból",
  claudeText: "Add hozzá ezt a címet a Claude-ban (Beállítások, Összekötők, Egyéni összekötő), és kérdezhetsz az alvásodról, pulzusodról, mozgásodról, az étkezéseket pedig a beszélgetésben naplózhatod. Ehhez Google Health kell.",
  copy: "Másolás",
  copied: "Másolva",
};

const TEXTS = { en, hu } as const;
export type Texts = typeof en;

/** The phone's language, when the person has not saved one: Hungarian if the phone is Hungarian, otherwise English. */
export function detectLang(): Lang {
  const raw = Platform.OS === "web" && typeof navigator !== "undefined" ? navigator.language : Intl.DateTimeFormat().resolvedOptions().locale;
  return raw?.toLowerCase().startsWith("hu") ? "hu" : "en";
}

export function isLang(x: unknown): x is Lang {
  return x === "en" || x === "hu";
}

const LangContext = createContext<{ lang: Lang; t: Texts; setLang: (l: Lang) => void }>({ lang: "en", t: en, setLang: () => undefined });

export function LangProvider({ lang, setLang, children }: { lang: Lang; setLang: (l: Lang) => void; children: ReactNode }) {
  return <LangContext.Provider value={{ lang, t: TEXTS[lang], setLang }}>{children}</LangContext.Provider>;
}

export const useT = () => useContext(LangContext);
