"use client";

import { useState } from "react";
import { db, auth } from "../../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { Ingredient, Unit } from "../../../lib/types";
import { useRouter } from "next/navigation";

export default function NewRecipePage() {
  const [user] = useAuthState(auth);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [newIngredient, setNewIngredient] = useState<Ingredient>({
    name: "",
    quantity: 0,
    unit: "pcs",
  });

  const units: Unit[] = ["g", "ml", "pcs"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return alert("Please login first");

    await addDoc(collection(db, "recipes"), {
      title,
      videoUrl,
      ingredients,
      addedBy: user.uid,
      createdAt: serverTimestamp(),
    });

    router.push("/recipes");
  }

  function addIngredient() {
    if (!newIngredient.name) return;
    setIngredients((prev) => [...prev, newIngredient]);
    setNewIngredient({ name: "", quantity: 0, unit: "pcs" });
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="max-w-2xl mx-auto shadow p-6 rounded">
      <h2 className="text-2xl font-bold mb-4">➕ Add New Recipe</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block font-medium">Recipe Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. Paneer Butter Masala"
            required
          />
        </div>

        {/* Video URL */}
        <div>
          <label className="block font-medium">YouTube/Instagram URL</label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Paste the recipe video link"
            required
          />
        </div>

        {/* Ingredients */}
        <div>
          <label className="block font-medium">Ingredients</label>

          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newIngredient.name}
              onChange={(e) =>
                setNewIngredient({ ...newIngredient, name: e.target.value })
              }
              className="flex-1 border rounded px-2 py-1"
              placeholder="Ingredient name"
            />
            <input
              type="number"
              value={newIngredient.quantity}
              onChange={(e) =>
                setNewIngredient({
                  ...newIngredient,
                  quantity: Number(e.target.value),
                })
              }
              className="w-24 border rounded px-2 py-1"
              placeholder="Qty"
            />
            <select
              value={newIngredient.unit}
              onChange={(e) =>
                setNewIngredient({
                  ...newIngredient,
                  unit: e.target.value as Unit,
                })
              }
              className="border rounded px-2 py-1"
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addIngredient}
              className="bg-green-500 text-white px-3 rounded"
            >
              Add
            </button>
          </div>

          {/* List of ingredients */}
          <ul className="mt-3 space-y-1">
            {ingredients.map((ing, idx) => (
              <li
                key={idx}
                className="flex justify-between bg-gray-100 px-3 py-1 rounded"
              >
                <span>
                  {ing.name} - {ing.quantity} {ing.unit}
                </span>
                <button
                  type="button"
                  onClick={() => removeIngredient(idx)}
                  className="text-red-500"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Save Recipe
        </button>
      </form>
    </div>
  );
}
