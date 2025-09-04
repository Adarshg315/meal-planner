// lib/types.ts

export type Unit = "g" | "ml" | "pcs";

export interface Ingredient {
  name: string;
  quantity: number;
  unit: Unit;
}

export type Recipe = {
  id: string;
  title: string;
  videoUrl?: string;
  ingredients: Ingredient[];
  createdAt: string; // ISO string
};


export type User = {
  id: string;
  name: string;
  phone?: string; // E.164 format, e.g., +919876543210
};

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

export type MealSession = {
  id: string;
  mealType: "Breakfast" | "Lunch" | "Dinner";
  date: string; // YYYY-MM-DD
  options: Recipe[];
  votes: Record<string, string>; // userId -> recipeId
  confirmedMeal: string | null; // recipeId or null
  invited: boolean;
  invitedTo?: string[];
  createdAt: string; // ISO string
};