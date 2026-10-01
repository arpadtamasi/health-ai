import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { backend } from "./src/backend";
import { Home } from "./src/screens/Home";
import { SignInScreen, Splash } from "./src/screens/SignInScreen";
import { detectLang, isLang, LangProvider, type Lang } from "./src/i18n";
import { tokens as T } from "./src/theme/tokens";

type Phase = { name: "loading" } | { name: "signedOut" } | { name: "chat"; onboarded: boolean; healthConnected: boolean };

export default function App() {
  const [phase, setPhase] = useState<Phase>({ name: "loading" });
  const [lang, setLang] = useState<Lang>(detectLang());

  useEffect(() => {
    backend.me().then((me) => { if (isLang(me.language)) setLang(me.language); setPhase({ name: "chat", onboarded: me.onboarded, healthConnected: me.healthConnected }); }).catch(() => setPhase({ name: "signedOut" }));
  }, []);

  return (
    <LangProvider lang={lang} setLang={setLang}>
    <View style={{ flex: 1, backgroundColor: T.color.surface, alignItems: "center" }}>
      <View style={{ flex: 1, width: "100%", maxWidth: 480, paddingTop: 36, paddingBottom: 12 }}>
        {phase.name === "loading" ? <Splash /> : null}
        {phase.name === "signedOut" ? <SignInScreen /> : null}
        {phase.name === "chat" ? <Home onboarded={phase.onboarded} healthConnected={phase.healthConnected} onSignedOut={() => setPhase({ name: "signedOut" })} /> : null}
      </View>
      <StatusBar style="dark" />
    </View>
    </LangProvider>
  );
}
