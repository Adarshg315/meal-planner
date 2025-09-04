import { NextResponse } from "next/server";
import twilio from "twilio";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  DocumentData,
} from "firebase/firestore";
import { MealSession, Recipe } from "@/lib/types";
import { normalizeWhatsAppNumber, getBaseUrl } from "@/lib/utils";

export const runtime = "nodejs"; // Twilio needs Node runtime

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function POST(req: Request) {
  try {
    const body: { mealType?: string; recipients?: string[] } = await req
      .json()
      .catch(() => ({}));
    const mealType = (body.mealType as MealSession["mealType"]) || "Dinner";

    // 1. Load recipes from Firestore
    const recipesSnap = await getDocs(collection(db, "recipes"));
    const recipes: Recipe[] = recipesSnap.docs.map((d) => {
      const data = d.data() as DocumentData;
      return {
        id: d.id,
        title: (data.title as string) || (data.name as string) || "Recipe",
        videoUrl:
          (data.videoUrl as string) || (data.source_url as string) || "",
        ingredients: (data.ingredients as string[]) || [],
        createdAt: (data.createdAt as string) || new Date().toISOString(),
      };
    });

    if (recipes.length < 3) {
      return NextResponse.json(
        { error: "Need at least 3 recipes in DB" },
        { status: 400 }
      );
    }

    // 2. Choose 3 random recipes
    const shuffled = [...recipes].sort(() => 0.5 - Math.random());
    const chosen = shuffled.slice(0, 3);

    // 3. Create session doc
    const newSession: Omit<MealSession, "id"> = {
      mealType,
      date: new Date().toISOString().split("T")[0],
      options: chosen,
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

    // 4. Resolve recipients (body or env)
    let recipients: string[] = [];
    if (body.recipients && body.recipients.length > 0) {
      recipients = body.recipients;
    } else {
      const envList = (process.env.WHATSAPP_RECIPIENTS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      recipients = envList;
    }

    // 5. Build WhatsApp message
    const bodyText =
      `🍽 New ${mealType} session — please vote!\n\n` +
      `1) ${chosen[0].title}\n` +
      `2) ${chosen[1].title}\n` +
      `3) ${chosen[2].title}\n\n` +
      `Vote here: ${sessionUrl}`;

    // 6. Send messages
    await Promise.all(
      recipients.map((r) => {

        console.log("Sending WhatsApp to:", normalizeWhatsAppNumber(r), " | ", process.env.TWILIO_WHATSAPP_FROM!, bodyText);  

        return twilioClient.messages.create({
          from: process.env.TWILIO_WHATSAPP_FROM!,
          to: normalizeWhatsAppNumber(r),
          body: bodyText,
        });
      })
    );

    // 7. Update session with invited metadata
    await updateDoc(doc(db, "mealSessions", sessionRef.id), {
      invited: true,
      invitedTo: recipients,
      invitedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: sessionRef.id });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("create session error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    console.error("create session unknown error:", err);
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
