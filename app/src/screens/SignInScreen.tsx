// The front door of the app (US-01m3w51ccdyb7xfbtes6729sct): what you see when you are signed out. It says what the app does, offers the
// Google sign-in, and, for people who use Claude, the address of the connector.
import { useState } from "react";
import { Linking, Platform, ScrollView, Text, View } from "react-native";
import { API_BASE, signInUrl } from "../api/client";
import { Button, Chip } from "../components/ui";
import { UiIcon } from "../components/icons";
import { useT } from "../i18n";
import { tokens as T } from "../theme/tokens";

const c = T.color;

/** The connector address for Claude: this site's own origin on the web. */
function mcpUrl(): string {
  const origin = Platform.OS === "web" && typeof window !== "undefined" ? window.location.origin : API_BASE;
  return `${origin}/mcp`;
}

export function SignInScreen() {
  const { t } = useT();
  const [copied, setCopied] = useState(false);
  const go = () => {
    if (Platform.OS === "web") window.location.href = signInUrl;
    else void Linking.openURL(signInUrl);
  };
  const copy = () => {
    try {
      if (Platform.OS === "web") void navigator.clipboard.writeText(mcpUrl()).then(() => setCopied(true));
    } catch { /* the address is selectable; the person can copy it by hand */ }
  };
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: c.surface, padding: T.space.xl, justifyContent: "center", gap: T.space.l }}>
      <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}>
        <UiIcon name="heart" size={28} color={c.onPrimary} filled />
      </View>
      <Text style={{ fontSize: 30, fontWeight: "700", color: c.onSurface }}>{t.signInTitle}</Text>
      <Text style={{ fontSize: T.font.base, color: c.onSurfaceVariant }}>{t.signInText}</Text>
      <Button label={t.signInButton} onPress={go} />
      <Text style={{ fontSize: T.font.body, color: c.onSurfaceVariant }}>{t.signInOnly}</Text>

      <View style={{ backgroundColor: c.surfaceLow, borderRadius: T.radius.card, padding: T.space.l, gap: T.space.s }}>
        <Text style={{ fontSize: T.font.base, fontWeight: "600", color: c.onSurface }}>{t.claudeTitle}</Text>
        <Text style={{ fontSize: T.font.body, color: c.onSurfaceVariant }}>{t.claudeText}</Text>
        <Text selectable style={{ fontSize: T.font.body, color: c.onSurface, fontFamily: Platform.OS === "web" ? "monospace" : undefined }}>{mcpUrl()}</Text>
        {Platform.OS === "web" ? <View style={{ alignSelf: "flex-start" }}><Chip label={copied ? t.copied : t.copy} onPress={copy} /></View> : null}
      </View>
    </ScrollView>
  );
}

/** The splash while the app finds out whether the person is signed in. */
export function Splash() {
  return (
    <View style={{ flex: 1, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: 72, height: 72, borderRadius: 18, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}>
        <UiIcon name="heart" size={36} color={c.onPrimary} filled />
      </View>
    </View>
  );
}
