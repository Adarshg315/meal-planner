import { NextResponse } from "next/server";
import twilio from "twilio";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { MealSession, Recipe } from "@/lib/types";
import { normalizeWhatsAppNumber, getBaseUrl } from "@/lib/utils";
import { isValidRecipe } from "@/lib/recipeUtils";
import { generateRecipes } from "@/lib/llm";
import { getTopYouTubeVideoUrl } from "@/lib/youtube";

export const runtime = "nodejs"; // Twilio needs Node runtime

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

async function generateValidRecipes(prefs: any, count: number): Promise<Recipe[]> {
  const recipes: Recipe[] = [];
  while (recipes.length < count) {
    const newRecipes = (await generateRecipes(prefs)) as Recipe[];
    for (const newRecipe of newRecipes) {
      if (
        isValidRecipe(newRecipe) &&
        !recipes.some((r) => r.title.toLowerCase() === newRecipe.title.toLowerCase())
      ) {
        const newRef = await addDoc(collection(db, "recipes"), {
          ...newRecipe,
          createdAt: serverTimestamp(),
          preparedCount: 0,
        });
        recipes.push({ ...newRecipe, id: newRef.id });
        if (recipes.length === count) break;
      }
    }
  }

  // Enrich recipes with video URLs
  const enrichedRecipes = await Promise.all(
    recipes.map(async (r) => ({
      ...r,
      videoUrl: await getTopYouTubeVideoUrl(r.title),
    }))
  );

  return enrichedRecipes;
}

async function sendWhatsAppMessages(recipients: string[], bodyText: string) {
  return Promise.all(
    recipients.map((recipient) =>
      twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM!,
        to: normalizeWhatsAppNumber(recipient),
        body: bodyText,
      })
    )
  );
}

export async function POST(req: Request) {
  try {
    const body: { mealType?: string; recipients?: string[]; prefs?: any } =
      await req.json().catch(() => ({}));
    const mealType = (body.mealType as MealSession["mealType"]) || "Dinner";
    

    // Generate and validate recipes
    const generatedRecipes = await generateValidRecipes(body.prefs || {}, 3);

    // Create session document
    const newSession: Omit<MealSession, "id"> = {
      mealType,
      date: new Date().toISOString().split("T")[0],
      options: generatedRecipes,
      votes: {},
      confirmedMeal: null,
      invited: false,
      invitedTo: [],
      createdAt: new Date().toISOString(),
    };

    const sessionRef = await addDoc(collection(db, "mealSessions"), {
      ...newSession,
      createdAt: serverTimestamp(),
    });

    const sessionUrl = `${getBaseUrl()}/meal/${sessionRef.id}`;

    // Resolve recipients
    const recipients =
      body.recipients && body.recipients.length > 0
        ? body.recipients
        : (process.env.WHATSAPP_RECIPIENTS || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

    if (!recipients || recipients.length === 0) {
      throw new Error("No recipients available to send messages.");
    }

    // Build WhatsApp message
    const bodyText =
      `🍽 New ${mealType} session — please vote!\n\n` +
      generatedRecipes.map((r, i) => `${i + 1}) ${r.title}`).join("\n") +
      `\n\nVote here: ${sessionUrl}`;

    // Send WhatsApp messages
    await sendWhatsAppMessages(recipients, bodyText);

    // Update session with invited metadata
    await updateDoc(doc(db, "mealSessions", sessionRef.id), {
      invited: true,
      invitedTo: recipients,
      invitedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: sessionRef.id });
  } catch (err: unknown) {
    console.error("create session error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
