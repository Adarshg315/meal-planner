"use client";
import { defaultPreferences } from "@/lib/constants";
import { useState } from "react";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);

  const createSession = async (mealType: string) => {
    setLoading(true);
    await fetch("/api/meal-sessions/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealType, prefs: defaultPreferences }),
    });
    setLoading(false);
    alert(`New ${mealType} session created!`);
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={() => createSession("lunch")}
        disabled={loading}
        className={`px-4 py-2 rounded-lg w-48 text-center ${
          loading ? "bg-gray-300 text-gray-500" : "bg-blue-500 text-white"
        }`}
      >
        {loading ? (
          <span className="animate-pulse inline-block w-full">Loading...</span>
        ) : (
          "Create Lunch Session"
        )}
      </button>

      <button
        onClick={() => createSession("dinner")}
        disabled={loading}
        className={`px-4 py-2 rounded-lg w-48 text-center ${
          loading ? "bg-gray-300 text-gray-500" : "bg-green-500 text-white"
        }`}
      >
        {loading ? (
          <span className="animate-pulse inline-block w-full">Loading...</span>
        ) : (
          "Create Dinner Session"
        )}
      </button>
    </div>
  );
}
