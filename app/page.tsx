"use client";
import { useState } from "react";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);

  const createSession = async (mealType: string) => {
    setLoading(true);
    await fetch("/api/meal-sessions/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealType }),
    });
    setLoading(false);
    alert(`New ${mealType} session created!`);
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={() => createSession("lunch")}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Create Lunch Session
      </button>

      <button
        onClick={() => createSession("dinner")}
        disabled={loading}
        className="px-4 py-2 bg-green-500 text-white rounded-lg"
      >
        Create Dinner Session
      </button>
    </div>
  );
}
