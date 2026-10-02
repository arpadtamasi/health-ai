// The colour scheme follows the phone (and the browser): light by day, dark when the system says so, switching by itself.
import { createContext, useContext, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { applyScheme, type Scheme } from "./tokens";

const SchemeContext = createContext<Scheme>("light");

/** Applies the system's scheme to the tokens during render, so that everything below draws with it, and lets components depend on it. */
export function SchemeProvider({ children }: { children: ReactNode }) {
  const scheme: Scheme = useColorScheme() === "dark" ? "dark" : "light";
  applyScheme(scheme);
  return <SchemeContext.Provider value={scheme}>{children}</SchemeContext.Provider>;
}

export const useScheme = (): Scheme => useContext(SchemeContext);
