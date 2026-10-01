import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { backend } from "./src/backend";
import { ChatScreen } from "./src/screens/ChatScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { SignInScreen } from "./src/screens/SignInScreen";
import { tokens as T } from "./src/theme/tokens";

type Phase = "loading" | "signedOut" | "onboarding" | "ready";

export default function App() {
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    backend.me()
      .then((me) => setPhase(me.onboarded ? "ready" : "onboarding"))
      .catch(() => setPhase("signedOut"));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: T.color.surface, alignItems: "center" }}>
      <View style={{ flex: 1, width: "100%", maxWidth: 480, paddingTop: 36, paddingBottom: 12 }}>
        {phase === "signedOut" ? <SignInScreen /> : null}
        {phase === "onboarding" ? <OnboardingScreen onDone={() => setPhase("ready")} /> : null}
        {phase === "ready" ? <ChatScreen onNeedOnboarding={() => setPhase("onboarding")} onSignedOut={() => setPhase("signedOut")} /> : null}
      </View>
      <StatusBar style="dark" />
    </View>
  );
}
