import { useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { Chip } from "../components/ui";
import { CameraInput, ChatBubble } from "../components/chat";
import { defaultGoals, parseCalories, parseConstraints, parseWindow } from "../onboarding";
import { backend } from "../backend";
import { tokens as T } from "../theme/tokens";

type Step = "constraints" | "calories" | "window" | "consent" | "saving";
interface Bubble { id: number; from: "assistant" | "user"; text: string }

// US-01m3rw2bqxkqp6v1hg9g02t1zr: a short first chat sets the foods to avoid, the goal and the eating window, then asks for consent.
export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [bubbles, setBubbles] = useState<Bubble[]>([{ id: 0, from: "assistant", text: "Hi! Before I suggest food, two quick things. Is there anything I should never suggest, like an allergy or something you dislike?" }]);
  const [step, setStep] = useState<Step>("constraints");
  const [draft, setDraft] = useState("");
  const answers = useRef<{ constraints: string[]; calories: number; window: { startHour: number; endHour: number } }>({ constraints: [], calories: 0, window: { startHour: 7, endHour: 22 } });
  const next = useRef(1);
  const scroller = useRef<ScrollView>(null);

  const push = (...b: Omit<Bubble, "id">[]) => {
    setBubbles((prev) => [...prev, ...b.map((x) => ({ ...x, id: next.current++ }))]);
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 50);
  };

  const submit = (text: string) => {
    const t = text.trim();
    if (!t && step !== "constraints") return;
    setDraft("");
    if (step === "constraints") {
      answers.current.constraints = parseConstraints(t);
      const said = answers.current.constraints.length ? `no ${answers.current.constraints.join(", no ")}` : "nothing to avoid";
      push({ from: "user", text: t || "None" }, { from: "assistant", text: `Got it: ${said}. You can change this any time by telling me. What is your calorie goal for a day?` });
      setStep("calories");
    } else if (step === "calories") {
      const calories = parseCalories(t);
      if (!calories) { push({ from: "user", text: t }, { from: "assistant", text: "I need a number between 500 and 10,000 kcal, for example 1900." }); return; }
      answers.current.calories = calories;
      push({ from: "user", text: t }, { from: "assistant", text: "And between which hours do you usually eat? For example 7 to 22." });
      setStep("window");
    } else if (step === "window") {
      const w = parseWindow(t);
      if (!w) { push({ from: "user", text: t }, { from: "assistant", text: "I need two hours, the start before the end, for example 7 to 22." }); return; }
      answers.current.window = w;
      const g = defaultGoals(answers.current.calories);
      push({ from: "user", text: t }, { from: "assistant", text: `Set: ${g.calories} kcal, ${w.startHour}:00 to ${w.endHour}:00, and roughly half carbs (${g.carbs} g) and a quarter protein (${g.protein} g). You can change any of it by chat.\n\nI am a tracker and suggestion aid for adults, not medical advice. By continuing you agree that your chat and photos go to the AI provider, and photos are kept 14 days during the test.` });
      setStep("consent");
    }
  };

  const agree = async () => {
    setStep("saving");
    try {
      await backend.saveSettings({ goals: defaultGoals(answers.current.calories), window: answers.current.window, constraints: answers.current.constraints, consent: true });
      onDone();
    } catch {
      push({ from: "assistant", text: "I could not save that. Please try again." });
      setStep("consent");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.color.surface, paddingHorizontal: T.space.xl, paddingTop: T.space.m, gap: T.space.m }}>
      <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={{ gap: T.space.m }}>
        {bubbles.map((b) => <ChatBubble key={b.id} from={b.from} text={b.text} />)}
      </ScrollView>
      <View style={{ gap: T.space.s }}>
        {step === "constraints" ? <View style={{ flexDirection: "row", gap: T.space.s }}><Chip label="None" onPress={() => submit("none")} /></View> : null}
        {step === "window" ? <View style={{ flexDirection: "row", gap: T.space.s }}><Chip label="7 to 22" onPress={() => submit("7 to 22")} /></View> : null}
        {step === "consent" ? <View style={{ flexDirection: "row", gap: T.space.s }}><Chip label="Agree and continue" selected onPress={() => void agree()} /></View> : null}
        <CameraInput value={draft} onChangeText={setDraft} onSend={() => submit(draft)} onCamera={() => undefined} disabled={step === "consent" || step === "saving"} placeholder="Write your answer…" />
      </View>
    </View>
  );
}
