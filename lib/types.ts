// lib/types.ts

// Allowed units for ingredients (expand later if needed)
export type Unit = "piece" | "g" | "ml" | "tsp" | "tbsp" | "cup" | "pcs";

export interface Ingredient {
  name: string;
  quantity: number;
  unit: Unit;
}

// Recipe structure
export interface Recipe {
  id: string; // Firestore doc id
  title: string;
  videoUrl?: string;
  ingredients: {
    name: string;
    quantity: number;
    unit: Unit;
  }[];
  servings: number;
  prep_time_minutes: number;
  steps: string[];
  createdAt?: string; // ISO string or Firestore timestamp
  preparedCount: number; // how many times cooked
  lastPreparedAt?: string; // ISO string, updated when meal confirmed
}

export type User = {
  id: string;
  name: string;
  phone?: string; // E.164 format, e.g., +919876543210
};

// Vote mapping → userId → chosen recipeId
export type VoteMap = {
  [userId: string]: string; // maps to recipe.id
};

// Meal session structure
export interface MealSession {
  id?: string; // Firestore doc id
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  date: string; // YYYY-MM-DD
  options: Recipe[]; // 3 recipes to choose from
  votes: VoteMap;
  confirmedMeal: Recipe | null;
  invited: boolean;
  invitedTo: string[]; // phone numbers
  createdAt: string; // ISO string
}

export type Preferences = {
  cuisine: string;
  diet: string;
  avoid: string[];
  spiceLevel: string;
  mealType: string;
  timeLimit?: number;
};
