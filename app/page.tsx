"use client";
import { defaultPreferences } from "@/lib/constants";
import { useEffect, useState, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface Recipient {
  number: string;
  selected: boolean;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [cookPhoneNumber, setCookPhoneNumber] = useState("");
  const [error, setError] = useState({ input: "", cook: "" });
  const inputRef = useRef<HTMLInputElement>(null);

  // validation helpers
  const validateLocal = (s: string) => /^\d{10}$/.test(s);
  const validateIntl = (s: string) => /^\+91\d{10}$/.test(s);
  const validatePhoneNumber = (s: string) => validateLocal(s) || validateIntl(s);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.trim();
    setInputValue(input);

    if (input === "") {
      setError((prev) => ({ ...prev, input: "" }));
      return;
    }

    setError((prev) => ({ ...prev, input: "" }));
  };

  const handleCookNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const number = e.target.value.trim();
    setCookPhoneNumber(number);

    if (!number) {
      setError((prev) => ({ ...prev, cook: "" }));
      return;
    }

    if (!(validateLocal(number) || validateIntl(number))) {
      setError((prev) => ({ ...prev, cook: "Invalid cook phone number" }));
    } else {
      setError((prev) => ({ ...prev, cook: "" }));
    }
  };

  const normalizeToE164India = (s: string) => {
    if (validateIntl(s)) return s;
    if (validateLocal(s)) return `+91${s}`;
    return s;
  };

  const saveCookNumber = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("You must be logged in.");
      return;
    }

    const normalized = normalizeToE164India(cookPhoneNumber);

    if (!validateIntl(normalized)) {
      setError((prev) => ({
        ...prev,
        cook: "Please enter a valid cook phone number.",
      }));
      return;
    }

    setError((prev) => ({ ...prev, cook: "" }));

    const userRef = doc(db, "users", currentUser.uid);
    await setDoc(
      userRef,
      { cookPhoneNumber: normalized },
      { merge: true }
    );

    alert("Cook phone number saved!");
  };

  const addRecipient = () => {
    const input = inputValue.trim();
    if (!input) return;

    let normalized = "";
    if (validateLocal(input)) normalized = `+91${input}`;
    else if (validateIntl(input)) normalized = input;
    else {
      setError((prev) => ({ ...prev, input: "Invalid phone number" }));
      return;
    }

    if (recipients.some((r) => r.number === normalized)) {
      setError((prev) => ({ ...prev, input: "Number already added" }));
      return;
    }

    setRecipients([...recipients, { number: normalized, selected: true }]);
    setInputValue("");
    setError((prev) => ({ ...prev, input: "" }));
  };

  const toggleRecipient = (index: number) => {
    const updated = [...recipients];
    updated[index].selected = !updated[index].selected;
    setRecipients(updated);
  };

  const deleteRecipient = (index: number) => {
    const updated = recipients.filter((_, i) => i !== index);
    setRecipients(updated);
  };

  const createSession = async (mealType: string) => {
    const selectedNumbers = recipients
      .filter((r) => r.selected)
      .map((r) => r.number);

    if (selectedNumbers.length === 0) {
      setError((prev) => ({
        ...prev,
        input: "Please select at least one recipient.",
      }));
      return;
    }

    setError((prev) => ({ ...prev, input: "" }));
    setLoading(true);

    await fetch("/api/meal-sessions/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealType,
        prefs: defaultPreferences,
        recipients: selectedNumbers,
      }),
    });

    setLoading(false);
    alert(`New ${mealType} session created with recipients!`);
    setRecipients([]);
    setInputValue("");
    inputRef.current?.focus();
  };

  const fetchCookNumber = async (uid: string) => {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const stored = userDoc.data().cookPhoneNumber || "";
      setCookPhoneNumber(
        typeof stored === "string" ? stored.replace(/^\+91/, "") : ""
      );
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchCookNumber(user.uid);
      else setCookPhoneNumber("");
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Recipient input */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              maxLength={10}
              onChange={handleInputChange}
              className="border p-2 flex-1"
              placeholder="Enter recipient phone number"
            />
            <button
              onClick={addRecipient}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add
            </button>
          </div>

          {error.input && <p className="text-red-500 mb-4">{error.input}</p>}

          {recipients.map((r, index) => (
            <div
              key={index}
              className="flex items-center justify-between mb-2 border p-2 rounded"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={r.selected}
                  onChange={() => toggleRecipient(index)}
                />
                <span>{r.number}</span>
              </div>
              <button
                onClick={() => deleteRecipient(index)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Cook number input */}
        <div className="mb-4 flex items-center">
          <input
            type="text"
            value={cookPhoneNumber}
            onChange={handleCookNumberChange}
            maxLength={10}
            className="border p-2 w-full"
            placeholder="Enter the cook's phone number"
          />
          <button
            onClick={saveCookNumber}
            className="ml-2 px-4 py-2 bg-green-500 text-white rounded"
          >
            Save
          </button>
        </div>
        {error.cook && <p className="text-red-500 mb-4">{error.cook}</p>}

        {/* Session buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => createSession("lunch")}
            disabled={loading}
            className={`px-4 py-2 rounded-lg w-full text-center ${
              loading ? "bg-gray-300 text-gray-500" : "bg-blue-500 text-white"
            }`}
          >
            {loading ? (
              <span className="animate-pulse inline-block w-full">
                Loading...
              </span>
            ) : (
              "Create Lunch Session"
            )}
          </button>

          <button
            onClick={() => createSession("dinner")}
            disabled={loading}
            className={`px-4 py-2 rounded-lg w-full text-center ${
              loading ? "bg-gray-300 text-gray-500" : "bg-green-500 text-white"
            }`}
          >
            {loading ? (
              <span className="animate-pulse inline-block w-full">
                Loading...
              </span>
            ) : (
              "Create Dinner Session"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
