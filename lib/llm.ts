import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { Preferences, Recipe } from "@/lib/types";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

import { buildPrompt, getBlockedRecipes } from "./recipeUtils";

// ✅ Define schema for recipe output
const recipeSchema = z.object({
  recipes: z.array(
    z.object({
      title: z.string(),
      ingredients: z.array(z.string()),
      instructions: z.string(),
      videoUrl: z.string().optional(),
      servings: z.number(),
      prep_time_minutes: z.number(),
      steps: z.array(z.string()),
    })
  ),
});

const parser = StructuredOutputParser.fromZodSchema(recipeSchema as any);

// 🔑 Initialize Gemini with LangChain wrapper
const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.5-flash-lite	",
  temperature: 0.7,
});

// 🔥 Simple helper: generate N recipes from preferences
export async function generateRecipes(
  preferences: Preferences,
  count: number
): Promise<Recipe[]> {
  // 1. Get blocked recipes (created yesterday, today, tomorrow)
  const blocked = await getBlockedRecipes();
  const blockedTitles = blocked.map((r) => r.title);


  const prompt = buildPrompt(preferences, blockedTitles, count);

  // 2. Run Gemini with JSON enforcement
  const response = await llm.invoke([
    {
      role: "user",
      content: `${prompt}\n\n${parser.getFormatInstructions()}`,
    },
  ]);


  if (typeof response.content === "string") {
    response.content = response.content
      .replace(/^```json/, "")
      .replace(/```$/, "")
      .trim();
  }

  const content =
    typeof response.content === "string"
      ? JSON.parse(response.content)
      : JSON.parse(JSON.stringify(response.content)); // fallback if structured parts


  // 4. Attach metadata
  return content.recipes.map((r: any) => ({
    ...r,
    preparedCount: 0,
    createdAt: new Date().toISOString(),
  }));
}

export async function POST(req: Request) {
  try {
    const { preferences } = await req.json();
    if (!preferences) {
      return NextResponse.json(
        { error: "Missing preferences" },
        { status: 400 }
      );
    }

    // 1️⃣ Generate 3 recipes from LLM
    const recipes = await generateRecipes(preferences, 3);

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
