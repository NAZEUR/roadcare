"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await setDoc(doc(db, "users", userCred.user.uid), {
        name,
        email,
        role: "user",
      });
      router.push("/login");
    } catch (err) {
      setError(err.message || "Gagal registrasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#eaf3fa] px-4 py-6 sm:py-8 md:py-12"
      style={{
        backgroundImage: "url(/background.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="w-full max-w-xs sm:max-w-sm md:max-w-lg bg-white rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 flex flex-col items-center"
        style={{ backdropFilter: "blur(2px)" }}
      >
        {/* Logo */}
        <img
          src="/logo.jpg"
          alt="Lapor Mas Logo"
          className="h-12 sm:h-16 mb-3 sm:mb-4"
        />
        <h2 className="text-xl sm:text-2xl font-bold text-[#3a6bb1] mb-2 text-center">
          Daftar Lapor Mas
        </h2>
        <p className="text-center text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
          Laporkan kerusakan dengan foto & lokasi, pantau progresnya.
        </p>
        <form onSubmit={handleSubmit} className="w-full space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Nama
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg bg-[#eaf3fa] px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3a6bb1]"
              placeholder="Nama Lengkap"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg bg-[#eaf3fa] px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3a6bb1]"
              placeholder="Email"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg bg-[#eaf3fa] px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3a6bb1] pr-10"
                placeholder="Kata Sandi"
              />
              {/* Eye icon placeholder, not functional for now */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></span>
            </div>
          </div>
          {error && (
            <p className="text-xs sm:text-sm text-red-600 text-center">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3a6bb1] text-white py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base disabled:opacity-60 mt-2"
          >
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>
        <p className="text-center text-xs sm:text-sm text-gray-600 mt-4">
          Sudah Punya Akun?{" "}
          <span
            className="text-[#3a6bb1] font-semibold cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Masuk
          </span>
        </p>
      </div>
    </div>
  );
}
