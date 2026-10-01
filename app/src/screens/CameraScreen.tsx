import { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Button } from "../components/ui";
import { tokens as T } from "../theme/tokens";

// US-01m3rvr6am99nrrbycxfw4r6v4 (Choose food and quantity with the camera): nothing to choose before the photo,
// the model reads whether it is a fridge, a menu, a counter or a plate. "Type instead" goes back to the chat.
export function CameraScreen({ onCapture, onCancel }: { onCapture: (photo: { uri: string; base64: string }) => void; onCancel: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);
  const c = T.color;

  if (!permission) return <View style={{ flex: 1, backgroundColor: c.surface }} />;

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: c.surface, padding: T.space.xl, justifyContent: "center", gap: T.space.l }}>
        <Text style={{ fontSize: T.font.title, fontWeight: "600", color: c.onSurface }}>Camera access</Text>
        <Text style={{ fontSize: T.font.base, color: c.onSurfaceVariant }}>
          I read what you can choose from (a fridge, a menu, a counter, a plate) from a photo. Photos are kept for 14 days during the test so the estimates can be checked.
        </Text>
        <Button label="Allow the camera" onPress={() => void requestPermission()} />
        <Button label="Type instead" kind="text" onPress={onCancel} />
      </View>
    );
  }

  const shoot = async () => {
    if (busy || !camera.current) return;
    setBusy(true);
    try {
      const picture = await camera.current.takePictureAsync({ quality: 0.5, base64: true });
      if (picture?.uri && picture.base64) onCapture({ uri: picture.uri, base64: picture.base64 });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView ref={camera} style={{ flex: 1 }} facing="back" />
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: T.space.xl, gap: T.space.m, alignItems: "center" }}>
        <Text style={{ color: "#fff", fontSize: T.font.body }}>Point at the fridge, a menu, the counter, a plate, anything</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Take the photo" onPress={() => void shoot()} disabled={busy}
          style={{ width: 68, height: 68, borderRadius: 34, borderWidth: 4, borderColor: "#fff", backgroundColor: busy ? "#ffffff55" : "#ffffff33" }} />
        <Pressable accessibilityRole="button" onPress={onCancel}><Text style={{ color: "#fff", fontSize: T.font.base }}>Type instead</Text></Pressable>
      </View>
    </View>
  );
}
