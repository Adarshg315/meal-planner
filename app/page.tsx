"use client";
import { defaultPreferences } from "@/lib/constants";
import { useEffect, useState, useRef } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [cookPhoneNumber, setCookPhoneNumber] = useState("");
  const [error, setError] = useState({ input: "", cook: "" });
  const inputRef = useRef<HTMLInputElement>(null);

  const validatePhoneNumber = (num: string) => {
    return /^\+?\d{10}$/.test(num);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.trim();
    setInputValue(input);

    if (input === "") {
      setError((prev) => ({ ...prev, input: "" }));
      return;
    }

    if (validatePhoneNumber(input) && !input.startsWith("+")) {
      setError((prev) => ({ ...prev, input: "" }));
      setPhoneNumbers([...phoneNumbers, `+91${input}`]);
      setInputValue("");
    } else if (validatePhoneNumber(input)) {
      setError((prev) => ({ ...prev, input: "" }));
      setPhoneNumbers([...phoneNumbers, input]);
      setInputValue("");
    } else {
      setError((prev) => ({ ...prev, input: "Invalid phone number" }));
    }
  };

  const handleCookNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    
    const number = e.target.value;
    setCookPhoneNumber(number);

    
    if (!number) {
      setError((prev) => ({ ...prev, cook: "" }));
      return;
    }

    if (!validatePhoneNumber(number)) {
      setError((prev) => ({ ...prev, cook: "Invalid cook phone number" }));
    } else {
      setError((prev) => ({ ...prev, cook: "" }));
    }
  };

  const saveCookNumber = async () => {
    if (!validatePhoneNumber(cookPhoneNumber)) {
      setError((prev) => ({
        ...prev,
        cook: "Please enter a valid cook phone number.",
      }));
      return;
    }
    setError((prev) => ({ ...prev, cook: "" }));
    await setDoc(doc(db, "cooks", cookPhoneNumber), { phoneNumber: cookPhoneNumber });
    alert("Cook phone number saved!");
  };

  const removePhoneNumber = (num: string) => {
    setPhoneNumbers(phoneNumbers.filter((phone) => phone !== num));
  };

  const createSession = async (mealType: string) => {
    if (phoneNumbers.length === 0) {
      setError((prev) => ({
        ...prev,
        input: "Please enter at least one valid phone number.",
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
        recipients: phoneNumbers,
      }),
    });
    setLoading(false);
    alert(`New ${mealType} session created with recipients!`);
    setPhoneNumbers([]);
    inputRef.current?.focus();
  };

  const fetchCookNumber = async () => {
    const querySnapshot = await getDocs(collection(db, "cooks"));

    querySnapshot.forEach((doc) => {
      if (doc.id === "phoneNumber") {
        setCookPhoneNumber(doc.data().cookPhoneNumber || "");
      }
    });
  };

  useEffect(() => {
    fetchCookNumber();
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            maxLength={10}
            onChange={handleInputChange}
            className="border mb-4 p-2 w-full"
            placeholder="Enter the phone number(s)"
          />
          {error.input && <p className="text-red-500 mb-4">{error.input}</p>}
          {phoneNumbers.map((num, index) => (
            <div key={index} className="flex items-center justify-between mb-2">
              <span>{num}</span>
              <button
                onClick={() => removePhoneNumber(num)}
                className="text-red-500"
              >
                x
              </button>
            </div>
          ))}
        </div>
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
