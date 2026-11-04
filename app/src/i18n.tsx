// The app's own texts in the languages it speaks. The chat answers in the person's language by itself; when it saves a language
// (the first time they write in Hungarian, say) the app switches too. Until one is saved, the phone's language decides.
import { createContext, useContext, type ReactNode } from "react";
import { Platform } from "react-native";
import { TEXTS, type Lang, type Texts } from "./texts";

export type { Lang, Texts };


/** The phone's language, when the person has not saved one: Hungarian if the phone is Hungarian, otherwise English. */
export function detectLang(): Lang {
  const raw = Platform.OS === "web" && typeof navigator !== "undefined" ? navigator.language : Intl.DateTimeFormat().resolvedOptions().locale;
  return raw?.toLowerCase().startsWith("hu") ? "hu" : "en";
}

export function isLang(x: unknown): x is Lang {
  return x === "en" || x === "hu";
}

const LangContext = createContext<{ lang: Lang; t: Texts; setLang: (l: Lang) => void }>({ lang: "en", t: TEXTS.en, setLang: () => undefined });

export function LangProvider({ lang, setLang, children }: { lang: Lang; setLang: (l: Lang) => void; children: ReactNode }) {
  return <LangContext.Provider value={{ lang, t: TEXTS[lang], setLang }}>{children}</LangContext.Provider>;
}

export const useT = () => useContext(LangContext);
