"use client";

// app/layout.tsx
import "./globals.css";
import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { loginWithGoogle, logout } from "../lib/auth";
import { useRouter } from "next/navigation";

export default function RootLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

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
            onClick={() => router.push("/")}
          >
            🍲 Meal Planner
          </h1>
          <div>
            {user ? (
              <div className="flex items-center gap-2">
                <Image
                  src={user.photoURL || "https://placehold.co/60x40"}
                  alt="avatar"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                  priority
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
