import type { FoodCategory } from "./icons";

export interface Option {
  rank: number;
  name: string;
  category: FoodCategory;
  kcal: number;
  carbs: number;
  protein: number;
  fat?: number;
  reason?: string;
  ingredients?: string[];
}
