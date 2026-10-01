// The app after sign-in: two states, Status and Chat ("kb 2 állapot: chat vagy státusz"). Both stay mounted so the conversation
// survives a look at the Status; the camera is a third, full-screen step that returns to the Chat with the photo.
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Linking, Platform } from "react-native";
import { ApiError, connectHealthUrl, type DayState, type Usual } from "../api/client";
import { backend } from "../backend";
import { useT } from "../i18n";
import { tokens as T } from "../theme/tokens";
import { AssistantChat } from "./AssistantChat";
import { CameraScreen } from "./CameraScreen";
import { StatusScreen, type Toast } from "./StatusScreen";

type View_ = "status" | "chat";

export function Home({ onboarded, healthConnected, onSignedOut }: { onboarded: boolean; healthConnected: boolean; onSignedOut: () => void }) {
  const { t } = useT();
  const [ready, setReady] = useState(onboarded);
  const [view, setView] = useState<View_>(onboarded ? "status" : "chat");
  const [state, setState] = useState<DayState | null>(null);
  const [usuals, setUsuals] = useState<Usual[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photo, setPhoto] = useState<{ uri: string; base64: string } | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const load = useCallback(async () => {
    try {
      const [s, u] = await Promise.all([backend.state(), backend.usuals().catch(() => [] as Usual[])]);
      setState(s);
      setUsuals(u);
    } catch (e) { if (e instanceof ApiError && e.status === 401) onSignedOut(); }
  }, [onSignedOut]);
  useEffect(() => { if (ready) void load(); }, [ready, load]);

  const reload = useCallback(() => { void load(); }, [load]);
  const onReady = useCallback(() => { setReady(true); setView("status"); }, []);
  const onPhotoHandled = useCallback(() => setPhoto(null), []);

  const frequent = async (u: Usual) => {
    try {
      if (u.kind === "water") {
        const { id } = await backend.water(u.ml ?? 250);
        setToast({ text: t.waterLogged(u.ml ?? 250), entryId: id });
      } else {
        const { id } = await backend.log({ rank: 0, name: u.name, category: "other", kcal: u.kcal, carbs: u.carbs, protein: u.protein });
        setToast({ text: t.logged(u.name, u.kcal), entryId: id });
      }
      await load();
    } catch { /* the Status stays as it is; the person can tap again */ }
  };
  const undoToast = async () => {
    if (toast?.entryId) { try { await backend.unlog(toast.entryId); } catch { return; } }
    setToast(null);
    await load();
  };

  const connect = () => {
    if (Platform.OS === "web") window.location.href = connectHealthUrl;
    else void Linking.openURL(connectHealthUrl);
  };

  if (cameraOpen) {
    return <CameraScreen onCapture={(p) => { setCameraOpen(false); setPhoto(p); setView("chat"); }} onCancel={() => setCameraOpen(false)} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: T.color.surface }}>
      {ready ? (
        <View style={{ flex: 1, display: view === "status" ? "flex" : "none" }}>
          <StatusScreen state={state} usuals={usuals} toast={toast} healthConnected={healthConnected} onConnect={connect} onLog={() => setView("chat")} onPhoto={() => setCameraOpen(true)} onFrequent={(u) => void frequent(u)} onUndo={() => void undoToast()} />
        </View>
      ) : null}
      <View style={{ flex: 1, display: view === "chat" ? "flex" : "none" }}>
        <AssistantChat onboarded={onboarded} usuals={usuals} photo={photo} onPhotoHandled={onPhotoHandled} onCamera={() => setCameraOpen(true)}
          onStatus={() => { setView("status"); void load(); }} onChanged={reload} onReady={onReady} />
      </View>
    </View>
  );
}
