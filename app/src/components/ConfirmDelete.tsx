// The model only proposes a deletion (US "Delete my history through the chat"); this card is the person's own tap that carries it out.
import { useState } from "react";
import { Text, View } from "react-native";
import { useT } from "../i18n";
import { tokens as T } from "../theme/tokens";
import { Chip } from "./ui";

const c = T.color;
export interface DeleteAsk { ids: string[]; all: boolean; labels: string[] }

export function ConfirmDelete({ ask, onConfirm }: { ask: DeleteAsk; onConfirm: (a: DeleteAsk) => Promise<boolean> }) {
  const { t } = useT();
  const [state, setState] = useState<"ask" | "done" | "failed" | "kept">("ask");
  return (
    <View style={{ backgroundColor: c.surfaceLow, borderRadius: T.radius.card, padding: T.space.l, gap: T.space.s }}>
      <Text style={{ fontFamily: T.face.display, fontSize: T.font.base, color: c.onSurface }}>{ask.all ? t.deleteAllTitle : t.deleteTitle}</Text>
      {ask.all ? <Text style={{ fontFamily: T.face.body, fontSize: T.font.body, color: c.onSurfaceVariant }}>{t.deleteAllText}</Text> : ask.labels.map((l) => <Text key={l} style={{ fontFamily: T.face.body, fontSize: T.font.body, color: c.onSurfaceVariant }}>{l}</Text>)}
      {state === "ask" || state === "failed" ? (
        <View style={{ flexDirection: "row", gap: T.space.s }}>
          <Chip label={t.deleteConfirm} tone="danger" onPress={() => void onConfirm(ask).then((ok) => setState(ok ? "done" : "failed"))} />
          <Chip label={t.deleteCancel} onPress={() => setState("kept")} />
        </View>
      ) : null}
      {state === "done" ? <Text style={{ fontFamily: T.face.body, fontSize: T.font.body, color: c.onSurface }}>{t.deleted}</Text> : null}
      {state === "failed" ? <Text style={{ fontFamily: T.face.body, fontSize: T.font.body, color: c.error }}>{t.deleteFailed}</Text> : null}
    </View>
  );
}
