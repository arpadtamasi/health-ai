// Drawn icons: Lucide line icons (ISC), the same set as the design kit (docs/designs/what-now-ui-variants/candy/food-icons.js),
// so every glyph shares one stroke. The model picks one of 16 food categories per food; this table maps a category to an icon.
// To change the icon set, change this table (or the two components); the categories stay the same.
import type { ComponentType } from "react";
import {
  Apple, ArrowLeft, ArrowUp, Camera, Candy, Carrot, Coffee, CupSoda, Croissant, Drumstick, Egg, Fish, GlassWater, Heart, Milk, Popcorn,
  Salad, Soup, Utensils, Wheat, X,
} from "lucide-react-native";
import { tokens as T } from "../theme/tokens";

interface IconProps { size?: number; color?: string; strokeWidth?: number }
type IconComponent = ComponentType<IconProps & { fill?: string }>;

export type FoodCategory =
  | "fruit" | "vegetable" | "bread" | "grain" | "meat" | "fish" | "egg" | "dairy" | "sweet"
  | "drink" | "water" | "coffee" | "soup" | "salad" | "snack" | "other";

const FOOD: Record<FoodCategory, IconComponent> = {
  fruit: Apple, vegetable: Carrot, bread: Croissant, grain: Wheat, meat: Drumstick, fish: Fish, egg: Egg, dairy: Milk, sweet: Candy,
  drink: CupSoda, water: GlassWater, coffee: Coffee, soup: Soup, salad: Salad, snack: Popcorn, other: Utensils,
};

const UI = { camera: Camera, "arrow-up": ArrowUp, "arrow-left": ArrowLeft, x: X, heart: Heart } as const;
export type UiIconName = keyof typeof UI;

export function FoodIcon({ category, size = 24, color = T.color.onSurface }: { category: FoodCategory; size?: number; color?: string }) {
  const Icon = FOOD[category] ?? FOOD.other;
  return <Icon size={size} color={color} strokeWidth={2} />;
}

export function UiIcon({ name, size = 22, color = T.color.onSurface, filled = false }: { name: UiIconName; size?: number; color?: string; filled?: boolean }) {
  const Icon = UI[name] as IconComponent;
  return <Icon size={size} color={color} strokeWidth={2} {...(filled ? { fill: color } : {})} />;
}
