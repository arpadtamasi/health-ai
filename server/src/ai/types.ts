export const FOOD_CATEGORIES = [
  "fruit", "vegetable", "bread", "grain", "meat", "fish", "egg", "dairy", "sweet",
  "drink", "water", "coffee", "soup", "salad", "snack", "other",
] as const;
export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

export interface Macros {
  calories: number;
  carbs: number;
  protein: number;
}

export interface DayState {
  goals: Macros;
  eaten: Macros;
  /** Minutes since midnight in the user's own time zone. */
  minutesNow: number;
  window: { startHour: number; endHour: number };
  /** Allergies and foods to avoid, as the user said them. */
  constraints: string[];
}

export interface Option {
  rank: number;
  name: string;
  category: FoodCategory;
  kcal: number;
  carbs: number;
  protein: number;
  ingredients: string[];
  reason?: string;
}

export interface ImageInput {
  mediaType: "image/jpeg" | "image/png" | "image/webp";
  dataBase64: string;
}

export interface Usage {
  inputTokens: number;
  outputTokens: number;
}
