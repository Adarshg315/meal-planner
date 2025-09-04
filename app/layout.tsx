"use client";

// app/layout.tsx
import "./globals.css";
import { ReactNode, useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { loginWithGoogle, logout } from "../lib/auth";

export default function RootLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <header className="p-4 flex justify-between items-center shadow">
            <h1
            className="text-xl font-bold cursor-pointer"
            onClick={() => window.location.pathname = "/"}
            >
            🍲 Meal Planner
            </h1>
          <div>
            {user ? (
              <div className="flex items-center gap-2">
                <img
                  src={user.photoURL || ""}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
                <span>{user.displayName}</span>
                <button
                  onClick={logout}
                  className="ml-2 px-3 py-1 rounded bg-red-500 text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="px-3 py-1 rounded bg-blue-500 text-white"
              >
                Login with Google
              </button>
            )}
          </div>
        </header>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
