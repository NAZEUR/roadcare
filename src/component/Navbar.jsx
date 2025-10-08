"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold text-emerald-600">
        RoadCare
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/" className="text-gray-600 hover:text-emerald-600">
          Home
        </Link>

        {user && (
          <Link href="/report" className="text-gray-600 hover:text-emerald-600">
            Lapor Lubang
          </Link>
        )}

        {/* Auth buttons */}
        {!user ? (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-full border border-emerald-500 text-emerald-600 hover:bg-emerald-50"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Register
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="text-gray-600 hover:text-emerald-600"
            >
              Profil
            </Link>
            {user.role === "admin" && (
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-emerald-600"
              >
                Dashboard
              </Link>
            )}
            <button
              onClick={signOut}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
