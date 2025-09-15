"use client";
import { defaultPreferences } from "@/lib/constants";
import { useState } from "react";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const validatePhoneNumber = (num: string) => {
    return /^\+?\d{10,13}$/.test(num);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.trim();
    if (validatePhoneNumber(input) && !input.startsWith('+')) {
      setPhoneNumbers([...phoneNumbers, `+91${input}`]);
      setInputValue('');
      setError('');
    } else if (validatePhoneNumber(input)) {
      setPhoneNumbers([...phoneNumbers, input]);
      setInputValue('');
      setError('');
    } else {
      setInputValue(input);
    }
  };

  const removePhoneNumber = (num: string) => {
    setPhoneNumbers(phoneNumbers.filter(phone => phone !== num));
  };

  const createSession = async (mealType: string) => {
    if (phoneNumbers.length === 0) {
      setError("Please enter at least one valid phone number.");
      return;
    }

    setError("");
    setLoading(true);
    await fetch("/api/meal-sessions/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealType, prefs: defaultPreferences, recipients: phoneNumbers }),
    });
    setLoading(false);
    alert(`New ${mealType} session created with recipients!`);
  };

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        className="border mb-4 p-2 w-full"
        placeholder="Enter the phone number(s), of the people you want to invite for the meal session"
      />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        {phoneNumbers.map((num, index) => (
          <div key={index} className="flex items-center justify-between mb-2">
            <span>{num}</span>
            <button onClick={() => removePhoneNumber(num)} className="text-red-500">x</button>
          </div>
        ))}
      </div>
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
    </div>
  );
}
