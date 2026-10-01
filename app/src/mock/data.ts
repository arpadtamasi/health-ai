// Sample data while there is no backend. Replace with the real API behind the same shapes.
import type { Option } from "../components/food";

export const goals = { calories: 1900, carbs: 230, protein: 110, window: { startHour: 7, endHour: 22 } };

export const eatenToday = { calories: 720, carbs: 62, protein: 41 };

export const usuals = [
  { label: "Glass", category: "water" as const },
  { label: "Cappuccino", category: "coffee" as const },
  { label: "Oat bran", category: "grain" as const },
  { label: "Apple", category: "fruit" as const },
];

export const suggestions: Option[] = [
  { rank: 1, name: "Chicken with rice", category: "grain", kcal: 560, carbs: 62, protein: 38, reason: "Closes most of the carb gap." },
  { rank: 2, name: "Wholegrain sandwich", category: "bread", kcal: 430, carbs: 48, protein: 24 },
  { rank: 3, name: "Egg salad", category: "egg", kcal: 310, carbs: 12, protein: 26 },
];
