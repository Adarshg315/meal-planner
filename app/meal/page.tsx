"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { MealSession } from "@/lib/types";

export default function MealSessionsPage() {
  const [sessions, setSessions] = useState<MealSession[]>([]);

  useEffect(() => {
    async function fetchSessions() {
      const snap = await getDocs(collection(db, "mealSessions"));
      const data = snap.docs.map((d) => {
        const docData = d.data();
        return {
          id: d.id,
          mealType: docData.mealType,
          date: docData.date,
          options: docData.options,
          votes: docData.votes,
          confirmedMeal: docData.confirmedMeal,
        } as MealSession;
      });
      setSessions(data);
    }
    fetchSessions();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">🍽 Meal Sessions</h2>
      <ul className="space-y-3">
        {sessions.map((s) => (
          <li
            key={s.id}
            className="border rounded p-3  shadow flex justify-between"
          >
            <div>
              <p className="font-semibold">
                {s.mealType} – {s.date}
              </p>
              {s.confirmedMeal ? (
                <p className="text-green-600">
                  ✅ Confirmed: {s.confirmedMeal.title}
                </p>
              ) : (
                <p className="text-gray-500">Pending votes...</p>
              )}
            </div>
            <Link
              href={`/meal/${s.id}`}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              View
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
