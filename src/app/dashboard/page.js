"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/component/Navbar";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 1. Tunggu loading auth selesai
    if (loading) return;

    // 2. Jika tidak ada user, redirect ke login
    if (!user) {
      router.replace("/login");
      return;
    }

    // 3. Jika user adalah ADMIN, redirect ke /admin
    if (user.role === "admin") {
      router.replace("/admin");
      return;
    }

    // 4. Jika user adalah user biasa, biarkan di halaman ini
  }, [user, loading, router]);

  // Tampilkan loading jika auth belum selesai atau user belum ada
  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f7fafc]">
        <p className="text-xl text-blue-600">Loading Dashboard...</p>
      </div>
    );
  }

  // Jika sudah loading dan user BUKAN admin, tampilkan dashboard user
  // (Ini adalah blok 'else' terakhir dari file asli Anda)
  return (
    <div
      className="min-h-screen bg-[#f7fafc]"
      style={{
        backgroundImage: "url(/dashboard-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1">
          <img src="/logo.jpg" alt="Logo Lapor Mas" className="h-14 mb-6" />
          <h1 className="text-4xl font-bold text-blue-800 mb-4">
            Foto, Tandai, Beres!
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Laporkan kerusakan jalan, bangunan, dan fasilitas umum dengan foto &
            titik peta. Pantau progres perbaikannya.
          </p>
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => router.push("/report")}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
            >
              Buat Laporan
            </button>
            <button
              onClick={() => router.push("/peta")}
              className="border-2 border-blue-700 text-blue-700 font-semibold py-3 px-8 rounded-lg transition duration-300 bg-white hover:bg-blue-50"
            >
              Lihat Peta
            </button>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <img
            src="/dashboard-illustration.png"
            alt="Dashboard Illustration"
            className="w-full max-w-md"
          />
        </div>
      </div>
    </div>
  );
}
