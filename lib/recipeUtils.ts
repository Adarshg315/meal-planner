import { Recipe } from "@/lib/types";

export function buildPrompt(preferences: {
  cuisine?: string;
  diet?: string;
  avoid?: string[];
  spiceLevel?: "mild" | "medium" | "hot";
  mealType?: string;
  timeLimit?: number; // in minutes
} | null): string {
  let prefText = "";
  if (preferences) {
    prefText = `
User preferences:
- Cuisine: ${preferences.cuisine || "any"}
- Diet: ${preferences.diet || "any"}
- Avoid ingredients: ${preferences.avoid?.join(", ") || "none"}
- Spice level: ${preferences.spiceLevel || "any"}
- Meal type: ${preferences.mealType || "any"}
- Maximum prep/cook time: ${preferences.timeLimit || "any"} minutes
`;
  }

  return `
You are a recipe generator. Output ONLY one JSON object (no commentary).
The recipe must follow these rules:
- Respect user preferences strictly (avoid listed allergens/ingredients).
- Use realistic ingredients that can be cooked in a home kitchen.
- Ensure prep_time_minutes <= time limit if provided.
- Adapt spice level appropriately.
- The dish should fit the requested cuisine, diet, and meal type.

Schema (return exactly this shape):
{
  "title": string,
  "servings": integer,
  "prep_time_minutes": integer,
  "ingredients": [ { "name": string, "quantity": number, "unit": string } ],
  "steps": [ string ],
  "tags": [ string ],
  "videoUrl": string | null
}

${prefText}
Now generate three recipes and return ONLY the JSON object.
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