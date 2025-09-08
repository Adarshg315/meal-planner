import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { Recipe } from "@/lib/types";

// ---- Replace this with your chosen LLM client ----
// Example with OpenAI (you can swap with any OSS LLM like Ollama):
import OpenAI from "openai";
import { buildPrompt } from "./recipeUtils";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔥 Simple helper: generate 3 recipes from preferences
export async function generateRecipes(preferences: any): Promise<Recipe[]> {
  const prompt = buildPrompt(preferences);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini", // or your OSS LLM endpoint
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  let text = response.choices[0].message?.content ?? "{}";

  // Remove backticks to ensure valid JSON
  text = text.replace(/`/g, "");

  const parsed = JSON.parse(text);

  return parsed.recipes.map((r: any) => ({
    ...r,
    preparedCount: 0,
    createdAt: new Date().toISOString(),
  }));
}

export async function POST(req: Request) {
  try {
    const { preferences } = await req.json();
    if (!preferences) {
      return NextResponse.json({ error: "Missing preferences" }, { status: 400 });
    }

    // 1️⃣ Generate 3 recipes from LLM
    const recipes = await generateRecipes(preferences);

    // 2️⃣ Deduplication check (avoid storing duplicates by title)
    const recipesCol = collection(db, "recipes");
    const saved: Recipe[] = [];

    for (const recipe of recipes) {
      const q = query(recipesCol, where("title", "==", recipe.title));
      const existing = await getDocs(q);

      if (existing.empty) {
        const docRef = await addDoc(recipesCol, recipe);
        saved.push({ ...recipe, id: docRef.id });
      } else {
        console.log(`Skipped duplicate recipe: ${recipe.title}`);
      }
    }

    return NextResponse.json({ recipes: saved });
  } catch (err: any) {
    console.error("generate recipes error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
