import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { backend } from "./src/backend";
import { AssistantChat } from "./src/screens/AssistantChat";
import { ChatScreen } from "./src/screens/ChatScreen";
import { SignInScreen } from "./src/screens/SignInScreen";
import { tokens as T } from "./src/theme/tokens";

type Phase = { name: "loading" } | { name: "signedOut" } | { name: "chat"; onboarded: boolean };

export default function App() {
  const [phase, setPhase] = useState<Phase>({ name: "loading" });

  useEffect(() => {
    backend.me().then((me) => setPhase({ name: "chat", onboarded: me.onboarded })).catch(() => setPhase({ name: "signedOut" }));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: T.color.surface, alignItems: "center" }}>
      <View style={{ flex: 1, width: "100%", maxWidth: 480, paddingTop: 36, paddingBottom: 12 }}>
        {phase.name === "signedOut" ? <SignInScreen /> : null}
        {phase.name === "chat" && process.env.EXPO_PUBLIC_UI === "assistant"
          ? <AssistantChat onboarded={phase.onboarded} onSignedOut={() => setPhase({ name: "signedOut" })} /> : null}
        {phase.name === "chat" && process.env.EXPO_PUBLIC_UI !== "assistant"
          ? <ChatScreen onboarded={phase.onboarded} onSignedOut={() => setPhase({ name: "signedOut" })} /> : null}
      </View>
      <StatusBar style="dark" />
    </View>
  );
}
