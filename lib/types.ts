// lib/types.ts

export type Unit = "g" | "ml" | "pcs";

export interface Ingredient {
  name: string;
  quantity: number;
  unit: Unit;
}

export interface Recipe {
  id: string;
  title: string;
  videoUrl: string;
  ingredients: Ingredient[];
  addedBy: string;
  createdAt: Date;
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  threshold: number;
}

export interface GroceryNeed {
  name: string;
  unit: Unit;
  needed: number;
  available: number;
  buy: number;
}

export interface GrocerySummary {
  required: GroceryNeed[];
  missing: GroceryNeed[];
  computedAt?: Date;
}

export interface MealSession {
  id: string;
  mealType: string; // Breakfast | Lunch | Dinner
  date: string;
  options: { id: string; title: string }[];
  votes: Record<string, string>;
  confirmedMeal?: string;
  grocery?: GrocerySummary;
}
