"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (user) {
      if (user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    }
  }, [user, authLoading, router]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const idTokenResult = await user.getIdTokenResult(true);
      const userRole = idTokenResult.claims.role;

      if (userRole === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    } catch (err) {
      setError(err.message || "Gagal login. Periksa email dan password.");
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eaf3fa]">
        <p className="text-base sm:text-lg md:text-xl text-blue-600">
          Loading...
        </p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eaf3fa]">
        <p className="text-base sm:text-lg md:text-xl text-blue-600">
          Mengalihkan...
        </p>
      </div>
    );
  }

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
          Masuk ke Lapor Mas
        </h2>
        <p className="text-center text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
          Lihat status laporanmu, lanjutkan aksi, dan dorong perbaikan.
        </p>
        <form onSubmit={handleSubmit} className="w-full space-y-3 sm:space-y-4">
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
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>
        <p className="text-center text-xs sm:text-sm text-gray-600 mt-4">
          Belum Punya Akun?{" "}
          <span
            className="text-[#3a6bb1] font-semibold cursor-pointer"
            onClick={() => router.push("/register")}
          >
            Daftar
          </span>
        </p>
      </div>
    </div>
  );
}
