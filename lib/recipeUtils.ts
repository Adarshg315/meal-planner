import { Preferences, Recipe } from "@/lib/types";
import { getDocs, collection } from "firebase/firestore";
import { db } from "./firebase";

export function buildPrompt(
  preferences: Preferences,
  blockedTitles: string[],
  count = 3
): string {
  let prefText = "";

  if (preferences) {
    prefText = `
      STRICT USER PREFERENCES (must be followed exactly):
      - Cuisine: ${preferences.cuisine || "any"}
      - Diet: ${preferences.diet || "any"}
      - Avoid ingredients (must NOT appear in recipe): ${
        preferences.avoid?.join(", ") || "none"
      }
      - Spice level: ${preferences.spiceLevel || "any"}
      - Meal type: ${preferences.mealType || "any"}
      - Maximum prep/cook time: ${preferences.timeLimit || "any"} minutes
    `;
  }

  let blockedText = "";

  if (blockedTitles.length > 0) {
    blockedText = `
      DO NOT generate any of these recipes (avoid exact or similar names):
      ${blockedTitles.join(", ")}
    `;
  }


  return `
    You are a recipe generator. Output ONLY one JSON object (no commentary).

    The generated recipes MUST strictly respect ALL user preferences above.
    - Absolutely avoid restricted/forbidden ingredients.
    - Ensure cuisine, diet, meal type, and spice level align exactly with the preferences.
    - Ensure prep_time_minutes does not exceed the specified limit (if provided).
    - Use realistic ingredients and steps that are cookable in a home kitchen.
    - ${
      blockedTitles.length > 0
        ? "Never include or duplicate the blocked recipes listed below."
        : ""
    }

    ${blockedText}

    Schema (return exactly this shape):
    Each recipe must include:
    - "title": string
    - "videoUrl": string
    - "ingredients": an array of 3-5 items, each with { "name": string, "quantity": number, "unit": one of "g" | "ml" | "tsp" | "tbsp" | "cup" | "piece" }
    - "servings": integer
    - "prep_time_minutes": integer
    - "steps": array of 3-5 strings

    Return ONLY valid JSON in this exact format (no commentary, no extra text):
    
    **IMPORTANT**:
    - You must return exactly ${count} objects inside the "recipes" array.
    - Do not add explanations, comments, or text outside the JSON.

    {
      "recipes": [
        {
          "title": "string",
          "videoUrl": "string",
          "ingredients": [
            { "name": "string", "quantity": number, "unit": "g" | "ml" | "tsp" | "tbsp" | "cup" | "piece" }
          ],
          "servings": number,
          "prep_time_minutes": number,
          "steps": ["string", "string"]
        }
      ]
    }

    ${prefText}
`.trim();
}

// ✅ Validator for LLM-generated recipes
export function isValidRecipe(recipe: Partial<Recipe>): recipe is Recipe {
  return (
    typeof recipe.title === "string" &&
    recipe.title.trim().length > 0 &&
    typeof recipe.videoUrl === "string" &&
    Array.isArray(recipe.ingredients) &&
    recipe.ingredients.length > 0 &&
    recipe.ingredients.every(
      (ing) =>
        typeof ing.name === "string" &&
        typeof ing.quantity === "number" &&
        ["g", "ml", "tsp", "tbsp", "cup", "piece"].includes(ing.unit)
    ) &&
    typeof recipe.servings === "number" &&
    typeof recipe.prep_time_minutes === "number" &&
    Array.isArray(recipe.steps) &&
    recipe.steps.length > 0 &&
    typeof recipe.preparedCount === "number"
  );
}

export async function getBlockedRecipes(): Promise<Recipe[]> {
  const now = new Date();

  // yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  // tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const snap = await getDocs(collection(db, "recipes"));

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Recipe))
    .filter((r) => {
      if (!r.createdAt) return false;
      const createdAt = new Date(r.createdAt.seconds * 1000); // Convert Timestamp.seconds to milliseconds

      return createdAt >= yesterday && createdAt <= tomorrow;
    });
}
