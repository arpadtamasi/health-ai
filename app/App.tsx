import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { useFonts } from "expo-font";
import { BricolageGrotesque_600SemiBold, BricolageGrotesque_800ExtraBold } from "@expo-google-fonts/bricolage-grotesque";
import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold } from "@expo-google-fonts/figtree";
import { backend } from "./src/backend";
import { Today } from "./src/screens/Today";
import { SignInScreen, Splash } from "./src/screens/SignInScreen";
import { detectLang, isLang, LangProvider, type Lang } from "./src/i18n";
import { tokens as T } from "./src/theme/tokens";

type Phase = { name: "loading" } | { name: "signedOut" } | { name: "app"; onboarded: boolean; healthConnected: boolean };

export default function App() {
  const [phase, setPhase] = useState<Phase>({ name: "loading" });
  const [lang, setLang] = useState<Lang>(detectLang());
  const [fontsLoaded, fontError] = useFonts({ BricolageGrotesque_600SemiBold, BricolageGrotesque_800ExtraBold, Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold });

  useEffect(() => {
    backend.me().then((me) => { if (isLang(me.language)) setLang(me.language); setPhase({ name: "app", onboarded: me.onboarded, healthConnected: me.healthConnected }); }).catch(() => setPhase({ name: "signedOut" }));
  }, []);

  // The splash stays until the fonts are in (or failed: the system font then does) and the server said who is signed in.
  const waiting = phase.name === "loading" || (!fontsLoaded && !fontError);
  return (
    <LangProvider lang={lang} setLang={setLang}>
      <View style={{ flex: 1, backgroundColor: T.color.surface, alignItems: "center" }}>
        <View style={{ flex: 1, width: "100%", maxWidth: 480, paddingTop: 24, paddingBottom: 0 }}>
          {waiting ? <Splash /> : null}
          {!waiting && phase.name === "signedOut" ? <SignInScreen /> : null}
          {!waiting && phase.name === "app" ? <Today onboarded={phase.onboarded} healthConnected={phase.healthConnected} onSignedOut={() => setPhase({ name: "signedOut" })} /> : null}
        </View>
        <StatusBar style="dark" />
      </View>
    </LangProvider>
  );
}
