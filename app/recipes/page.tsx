"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Recipe } from "../../lib/types";
import Link from "next/link";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    async function fetchRecipes() {
      const snap = await getDocs(collection(db, "recipes"));
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Recipe[];
      setRecipes(data);
    }
    fetchRecipes();
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">📖 Recipes</h2>
        <Link
          href="/add-recipe"
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          ➕ Add Recipe
        </Link>
      </div>

      <ul className="space-y-3">
        {recipes.map((r) => (
          <li key={r.id} className="border p-3 rounded shadow">
            <h3 className="text-lg font-semibold">{r.title}</h3>
            <a
              href={r.videoUrl}
              target="_blank"
              className="text-blue-600 underline text-sm"
            >
              Watch Video
            </a>
            <ul className="mt-2 text-sm text-gray-700">
              {r.ingredients.map((ing, idx) => (
                <li key={idx}>
                  • {ing.name} – {ing.quantity} {ing.unit}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
