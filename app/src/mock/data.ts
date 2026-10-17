// Sample data while there is no backend (EXPO_PUBLIC_MOCK=1, design work). Never part of the deployed app.
import type { Option } from "../components/food";

export const goals = { calories: 2100, carbs: 185, protein: 160, fat: 80, waterMl: 2500, window: { startHour: 7, endHour: 22 } };

const at = (h: number, m: number) => { const d = new Date(); d.setHours(h, m, 0, 0); return d.getTime(); };
export const entries = [
  { id: "s1", kind: "meal" as const, name: "Oat bran, milk, jam", kcal: 415, carbs: 72, protein: 17, fat: 11, at: at(7, 8), source: "button" as const, estimate: false, ingredients: [] },
  { id: "s2", kind: "meal" as const, name: "2 boiled eggs", kcal: 155, carbs: 1, protein: 13, fat: 11, at: at(8, 50), source: "typed" as const, estimate: true, ingredients: [] },
  { id: "s3", kind: "water" as const, name: "Water", kcal: 0, carbs: 0, protein: 0, fat: 0, ml: 250, at: at(9, 30), source: "button" as const, estimate: false, ingredients: [] },
];

export const suggestions: Option[] = [
  { rank: 1, name: "Chicken with rice", category: "grain", kcal: 560, carbs: 62, protein: 38, fat: 9, reason: "Closes most of the protein gap." },
  { rank: 2, name: "Wholegrain sandwich", category: "bread", kcal: 430, carbs: 48, protein: 24, fat: 12 },
  { rank: 3, name: "Egg salad", category: "egg", kcal: 310, carbs: 12, protein: 26, fat: 20 },
];
