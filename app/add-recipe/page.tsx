"use client";

import { useState } from "react";
import { db, auth } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface AddRecipeProps {
  initialData?: {
    title: string;
    ingredients: Ingredient[];
    instructions: string;
    videoUrl: string;
  };
}

export default function AddRecipePage({ initialData }: AddRecipeProps) {
  const [title, setTitle] = useState<string>(initialData?.title || "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialData?.ingredients || [{ name: "", quantity: 0, unit: "" }]
  );
  const [instructions, setInstructions] = useState<string>(initialData?.instructions || "");
  const [videoUrl, setVideoUrl] = useState<string>(initialData?.videoUrl || "");

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    const updatedIngredients = [...ingredients];
    if (field === "quantity") {
      updatedIngredients[index][field] = typeof value === "string" ? parseFloat(value) : value as number;
    } else if (field === "name" || field === "unit") {
      updatedIngredients[index][field] = value as string;
    }
    setIngredients(updatedIngredients);
  };

  const addIngredientField = () => {
    setIngredients([...ingredients, { name: "", quantity: 0, unit: "" }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Please login first!");
      return;
    }

    try {
      await addDoc(collection(db, "recipes"), {
        title,
        ingredients,
        instructions,
        videoUrl,
        addedBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      alert("Recipe added successfully 🎉");
      setTitle("");
      setIngredients([{ name: "", quantity: 0, unit: "" }]);
      setInstructions("");
      setVideoUrl("");
    } catch (err) {
      console.error("Error adding recipe:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1 className="text-2xl font-bold">{initialData ? "Edit Recipe" : "Add a New Recipe"}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
        <input
          type="text"
          placeholder="Recipe Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="border p-2 rounded  font-bold"
        />

        <div>
          <h2 className="text-lg font-semibold">Ingredients</h2>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Name"
                value={ingredient.name}
                onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                required
                className="border p-2 rounded  font-bold"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={ingredient.quantity}
                onChange={(e) => handleIngredientChange(index, "quantity", e.target.value)}
                required
                className="border p-2 rounded  font-bold"
              />
              <input
                type="text"
                placeholder="Unit"
                value={ingredient.unit}
                onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                required
                className="border p-2 rounded  font-bold"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredientField}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            ➕ Add Ingredient
          </button>
        </div>

        <textarea
          placeholder="Instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          required
          className="border p-2 rounded  font-bold"
        />

        <input
          type="url"
          placeholder="YouTube/Instagram URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="border p-2 rounded  font-bold"
        />

        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          {initialData ? "Update Recipe" : "Save Recipe"}
        </button>
      </form>
    </div>
  );
}
