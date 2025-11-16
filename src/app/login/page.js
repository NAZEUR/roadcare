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
  const [loading, setLoading] = useState(false); // State loading untuk form submit
  const [error, setError] = useState("");

  // --- 💡 PERBAIKAN UTAMA ---
  // Logika redirect untuk user yang SUDAH LOGIN dipindahkan ke useEffect
  useEffect(() => {
    // Tunggu jika status auth masih loading
    if (authLoading) {
      return;
    }

    // Jika user terdeteksi (mis. sudah login sebelumnya atau baru refresh)
    if (user) {
      if (user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    }
  }, [user, authLoading, router]); // <-- Dependencies

  // Logika handleSubmit sudah benar, tidak perlu diubah.
  // Ini dijalankan 'on click', bukan saat render, jadi aman.
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

  // --- Logika Tampilan (Render) ---

  // 1. Tampilkan loading jika status auth belum jelas
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eaf3fa]">
        <p className="text-xl text-blue-600">Loading...</p>
      </div>
    );
  }

  // 2. Tampilkan "Mengalihkan" JIKA user sudah login
  // (useEffect di atas akan menangani redirect-nya)
  // Ini mencegah form login "berkedip"
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eaf3fa]">
        <p className="text-xl text-blue-600">Mengalihkan...</p>
      </div>
    );
  }

  // 3. HANYA jika tidak loading DAN tidak ada user,
  // tampilkan form login.
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#eaf3fa]"
      style={{
        backgroundImage: "url(/background.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-xl p-10 flex flex-col items-center"
        style={{ backdropFilter: "blur(2px)" }}
      >
        {/* Logo */}
        <img src="/logo.jpg" alt="Lapor Mas Logo" className="h-16 mb-4" />
        <h2 className="text-2xl font-bold text-[#3a6bb1] mb-2 text-center">
          Masuk ke Lapor Mas
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Lihat status laporanmu, lanjutkan aksi, dan dorong perbaikan.
        </p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg bg-[#eaf3fa] px-4 py-2 text-gray-800 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3a6bb1]"
              placeholder="Email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg bg-[#eaf3fa] px-4 py-2 text-gray-800 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3a6bb1] pr-10"
                placeholder="Kata Sandi"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3a6bb1] text-white py-3 rounded-lg font-semibold text-lg disabled:opacity-60 mt-2"
          >
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
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
