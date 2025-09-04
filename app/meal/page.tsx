"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function MealSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSessions() {
      const snap = await getDocs(collection(db, "mealSessions"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
                  ✅ Confirmed: {s.confirmedMeal}
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
