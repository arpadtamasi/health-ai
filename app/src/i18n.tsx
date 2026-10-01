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
  consentText: "I am a tracker and suggestion aid for adults, not medical advice. By continuing you agree that your chat and photos go to the AI provider.",
  consentButton: "Agree and continue",
  errDailyLimit: "Daily limit reached. The chat and the camera are back tomorrow.",
  errUnavailable: "The chat is not available right now.",
  errGeneric: "Something went wrong. Please try again.",
  signInTitle: "What should I eat now?",
  signInText: "Sign in with the Google account that holds your Fitbit data. I read what you ate today and tell you what to take out of the fridge.",
  signInButton: "Sign in with Google",
  cameraTitle: "Camera access",
  cameraText: "I read what you can choose from (a fridge, a menu, a counter, a plate) from a photo. Photos are kept for 14 days during the test so the estimates can be checked.",
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
  consentText: "Követő és javaslattevő segéd vagyok felnőtteknek, nem orvosi tanács. A folytatással elfogadod, hogy a chatet és a fotókat az AI-szolgáltató kapja.",
  consentButton: "Elfogadom, tovább",
  errDailyLimit: "Elérted a napi limitet. A chat és a kamera holnap újra működik.",
  errUnavailable: "A chat most nem érhető el.",
  errGeneric: "Hiba történt. Próbáld újra.",
  signInTitle: "Mit egyek most?",
  signInText: "Lépj be a Google-fiókkal, amelyben a Fitbit-adataid vannak. Elolvasom, mit ettél ma, és megmondom, mit vegyél ki a hűtőből.",
  signInButton: "Belépés Google-lel",
  cameraTitle: "Kamera engedély",
  cameraText: "Fotóról olvasom le, miből választhatsz (hűtő, étlap, pult, tányér). A fotókat a teszt alatt 14 napig őrizzük, hogy ellenőrizni lehessen a becsléseket.",
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
