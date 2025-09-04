import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { mealType } = await req.json(); // e.g., "lunch" or "dinner"

    // 1. Fetch recipes
    const snapshot = await getDocs(collection(db, "recipes"));
    const recipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Pick 3 random recipes
    const options = recipes.sort(() => 0.5 - Math.random()).slice(0, 3);

    // 3. Create new meal session
    const docRef = await addDoc(collection(db, "mealSessions"), {
      mealType,
      options,
      votes: {},
      confirmedMeal: null,
      notified: false,
      createdAt: Date.now(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err: unknown) {
    let errorMessage = "An unknown error occurred";
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
