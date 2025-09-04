"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../../lib/firebase";
import {
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useParams } from "next/navigation";

interface MealOption {
  id: string;
  title: string;
  videoUrl?: string;
}

interface MealSession {
  id: string;
  mealType: string;
  date: string;
  options: MealOption[];
  votes?: Record<string, string>;
  confirmedMeal?: string;
}

export default function MealSessionPage() {
  const params = useParams();
  const [user] = useAuthState(auth);
  const [session, setSession] = useState<MealSession | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    const unsub = onSnapshot(doc(db, "mealSessions", params.id as string), (snap) => {
      setSession({ id: snap.id, ...snap.data() } as MealSession);
    });
    return () => unsub();
  }, [params?.id]);

  async function vote(optionId: string) {
    if (!user) {
      alert("You must login to vote.");
      return;
    }
    
    if (!session) return;

    const votes = { ...(session.votes || {}), [user.uid]: optionId };

    // Count votes
    const counts: Record<string, number> = {};
    Object.values(votes).forEach((v) => {
      counts[v] = (counts[v] || 0) + 1;
    });

    let confirmedMeal: string | null = session.confirmedMeal || null;
    for (const [opt, count] of Object.entries(counts)) {
      if (count >= 2) confirmedMeal = opt;
    }

    await updateDoc(doc(db, "mealSessions", session.id), {
      votes,
      confirmedMeal,
    });

    // 🔔 If newly confirmed, notify cook
    if (confirmedMeal && !session.confirmedMeal) {
      const recipe = session.options.find((o) => o.id === confirmedMeal);
      await fetch("/api/notify-cook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeTitle: recipe?.title,
          videoUrl: recipe?.videoUrl || "No video available",
        }),
      });
    }

    // Show success alert
    const votedRecipe = session.options.find((o) => o.id === optionId);
    alert(`You have successfully voted for ${votedRecipe?.title}`);
  }

  if (!session) return <p>Loading...</p>;

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        {session.mealType} – {session.date}
      </h2>

      {session.confirmedMeal ? (
        <p className="text-green-600 font-semibold">
          ✅ Confirmed Meal: {session.options.find((o) => o.id === session.confirmedMeal)?.title}
        </p>
      ) : (
        <div className="space-y-3">
          {session.options.map((opt) => (
            <div
              key={opt.id}
              className="border p-3 rounded shadow flex justify-between"
            >
              <span>{opt.title}</span>
              <button
                onClick={() => vote(opt.id)}
                className="px-3 py-1 bg-blue-500 text-white rounded cursor-pointer"
              >
                Vote
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
