import { Recipe } from "@/lib/types";

export function buildPrompt(
  preferences: {
    cuisine: "Any (Indian, global, vegetarian-friendly)",
    diet: "Vegetarian, high-protein, balanced for both weight gain and fat loss with muscle building",
    avoid: [],
    spiceLevel: "medium",
    mealType: "Lunch and Dinner (with optional snacks/prep suggestions)",
    timeLimit?: 60; // Default values not applicable for timeLimit due to varying conditions
  } | null
): string {
  let prefText = "";
  if (preferences) {
    prefText = `
STRICT USER PREFERENCES (must be followed exactly):
- Cuisine: ${preferences.cuisine || "any"}
- Diet: ${preferences.diet || "any"}
- Avoid ingredients (must NOT appear in recipe): ${preferences.avoid?.join(", ") || "none"}
- Spice level: ${preferences.spiceLevel || "any"}
- Meal type: ${preferences.mealType || "any"}
- Maximum prep/cook time: ${preferences.timeLimit || "any"} minutes
`;
  }

  return `
You are a recipe generator. Output ONLY one JSON object (no commentary).

The generated recipes MUST strictly respect ALL user preferences above.
- Absolutely avoid restricted/forbidden ingredients.
- Ensure cuisine, diet, meal type, and spice level align exactly with the preferences.
- Ensure prep_time_minutes does not exceed the specified limit (if provided).
- Use realistic ingredients and steps that are cookable in a home kitchen.

Schema (return exactly this shape):
Each recipe must include:
- "title": string
- "videoUrl": string
- "ingredients": an array of 3-5 items, each with { "name": string, "quantity": number, "unit": one of "g" | "ml" | "tsp" | "tbsp" | "cup" | "piece" }
- "servings": integer
- "prep_time_minutes": integer
- "steps": array of 3-5 strings

Return ONLY valid JSON in this exact format (no commentary, no extra text):

{
  "recipes": [
    {
      "title": "...",
      "videoUrl": "...",
      "ingredients": [
        { "name": "...", "quantity": 200, "unit": "g" }
      ],
      "servings": 2,
      "prep_time_minutes": 20,
      "steps": ["...", "..."]
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
    typeof recipe.preparedCount === "number" &&
    typeof recipe.createdAt === "string"
  );
}