"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err) {
      setError(err.message || "Gagal login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-gray-50 relative overflow-hidden">
      {/* Background image layer (transparent only) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img src="/roadimages.jpg" alt="road background" className="w-full h-full object-cover opacity-30" />
      </div>
      <div className="w-1/2 bg-emerald-500 text-white p-16 hidden md:flex flex-col justify-center items-start gap-6 relative z-10">
        {/* Decorative colorful background blobs (behind content) */}
        <div className="absolute -left-20 -top-12 w-72 h-72 rounded-full bg-gradient-to-br from-teal-300 to-emerald-500 opacity-80 filter blur-3xl transform rotate-12 z-0" />
        <div className="absolute -right-20 bottom-8 w-56 h-56 rounded-full bg-gradient-to-tr from-cyan-300 to-emerald-400 opacity-70 filter blur-2xl z-0" />
        {/* suggestions panel removed per user request */}

        <h2 className="text-4xl font-extrabold">Welcome Back!</h2>
        <p className="max-w-md opacity-90">
          To keep connected with us please login with your personal info.
        </p>
        <button
          onClick={() => router.push("/register")}
          className="mt-4 bg-transparent border border-white text-white px-6 py-2 rounded-full hover:bg-white/10"
        >
          Register
        </button>
      </div>

      <div className="flex-1 p-12 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-emerald-600 text-center mb-6">
            Login
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-400 rounded px-3 py-2 mt-1 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-400 rounded px-3 py-2 mt-1 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="Enter your password"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-white py-2 rounded-full font-semibold disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>

            <p className="text-center text-sm text-gray-500 mt-2">
              Don&apos;t have an account? 
              <button
                onClick={() => router.push("/register")}
                className="text-emerald-600 underline"
              >
                Register
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
