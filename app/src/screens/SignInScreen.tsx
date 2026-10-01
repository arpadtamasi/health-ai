import { Linking, Platform, Text, View } from "react-native";
import { signInUrl } from "../api/client";
import { Button } from "../components/ui";
import { UiIcon } from "../components/icons";
import { tokens as T } from "../theme/tokens";

// The Google sign-in runs on the server; it returns to /app/ with the session cookie.
export function SignInScreen() {
  const go = () => {
    if (Platform.OS === "web") window.location.href = signInUrl;
    else void Linking.openURL(signInUrl);
  };
  return (
    <View style={{ flex: 1, backgroundColor: T.color.surface, padding: T.space.xl, justifyContent: "center", gap: T.space.l }}>
      <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: T.color.primary, alignItems: "center", justifyContent: "center" }}>
        <UiIcon name="heart" size={28} color={T.color.onPrimary} filled />
      </View>
      <Text style={{ fontSize: 28, fontWeight: "700", color: T.color.onSurface }}>What should I eat now?</Text>
      <Text style={{ fontSize: T.font.base, color: T.color.onSurfaceVariant }}>
        Sign in with the Google account that holds your Fitbit data. I read what you ate today and tell you what to take out of the fridge.
      </Text>
      <Button label="Sign in with Google" onPress={go} />
    </View>
  );
}
