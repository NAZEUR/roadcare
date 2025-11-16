"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/reports/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setReports(data.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus laporan ini?")) return;
    try {
      setDeletingId(id);
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(
        `/api/reports/user?id=${encodeURIComponent(id)}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const goToMap = (r) => {
    router.push(`/peta?lat=${r.latitude}&lng=${r.longitude}&id=${r.id}`);
  };

  const stats = useMemo(() => {
    const total = reports.length;
    const selesai = reports.filter((r) =>
      ["Selesai", "Sudah diperbaiki"].includes(r.status)
    ).length;
    const proses = reports.filter((r) =>
      ["Dalam proses", "Proses"].includes(r.status)
    ).length;
    const baru = total - selesai - proses; // sisanya diasumsikan belum diperbaiki/baru
    return { total, selesai, proses, baru };
  }, [reports]);

  const statusBadge = (status) => {
    const s =
      status === "Selesai"
        ? "Sudah diperbaiki"
        : status === "Proses"
        ? "Dalam proses"
        : status || "Belum diperbaiki";
    if (s === "Sudah diperbaiki")
      return "bg-green-100 text-green-700 border-green-200";
    if (s === "Dalam proses")
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (s === "Baru") return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const prettyDate = (d) => {
    try {
      const date =
        typeof d === "string" || typeof d === "number" ? new Date(d) : d;
      return format(date, "dd MMM yyyy, HH:mm", { locale: localeID });
    } catch {
      return "-";
    }
  };

  const initials = (user?.name || user?.displayName || user?.email || "-")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading || !user)
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#f7fcf6]">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#dff3e6] via-[#eaf7ff] to-[#f3f7ff]" />
        <div
          className="absolute -left-24 -top-24 w-[28rem] h-[28rem] rounded-full bg-emerald-200/40 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -right-20 -bottom-32 w-[26rem] h-[26rem] rounded-full bg-sky-200/40 blur-3xl"
          aria-hidden
        />
        <div className="relative max-w-5xl mx-auto px-6 py-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#285B9A] tracking-tight">
            Profil & Laporan Saya
          </h1>
          <p className="mt-2 text-gray-700">
            Kelola informasi akun dan pantau semua laporan yang kamu buat.
          </p>
        </div>
        <svg
          className="relative text-[#f7fcf6]"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M0,64L60,58.7C120,53,240,43,360,37.3C480,32,600,32,720,42.7C840,53,960,75,1080,74.7C1200,75,1320,53,1380,42.7L1440,32L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z"
          />
        </svg>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-6 pb-16">
        {/* Profile Card + Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {/* Profile Card */}
          <div className="md:col-span-1 bg-white rounded-2xl shadow border border-slate-100 p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#3a6bb1] text-white flex items-center justify-center text-xl font-bold">
                {initials}
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {user.name || user.displayName || "Pengguna"}
                </h2>
                <p className="text-sm text-gray-600 break-all">{user.email}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <p className="text-gray-500">Role</p>
                <p className="font-medium">{user.role || "user"}</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <p className="text-gray-500">Akun</p>
                <p className="font-medium">Aktif</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="md:col-span-2 grid sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Laporan"
              value={stats.total}
              accent="from-emerald-400/20 to-emerald-200/10"
            />
            <StatCard
              title="Dalam Proses"
              value={stats.proses}
              accent="from-amber-400/20 to-amber-200/10"
            />
            <StatCard
              title="Sudah Selesai"
              value={stats.selesai}
              accent="from-sky-400/20 to-sky-200/10"
            />
          </div>
        </motion.div>

        {/* My Reports */}
        <div className="mt-10 bg-white rounded-2xl shadow border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-bold">Laporan Saya</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchReports}
                className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Muat Ulang
              </button>
              <button
                onClick={() => router.push("/report")}
                className="text-sm px-3 py-1.5 rounded-lg bg-[#3a6bb1] text-white hover:bg-[#2456a3]"
              >
                Buat Laporan
              </button>
            </div>
          </div>

          {loadingReports ? (
            <SkeletonList />
          ) : reports.length === 0 ? (
            <EmptyState onCreate={() => router.push("/report")} />
          ) : (
            <ul className="space-y-4">
              {reports.map((r) => (
                <motion.li
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-slate-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-start gap-4 hover:shadow-md transition"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={r.photoUrl}
                      className="w-full sm:w-36 h-40 sm:h-24 object-cover rounded-lg bg-slate-100"
                      alt="foto laporan"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.png";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[#285B9A]">
                        {r.title || r.description?.slice(0, 80) || "Laporan"}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge(
                          r.status
                        )}`}
                      >
                        {r.status === "Selesai"
                          ? "Sudah diperbaiki"
                          : r.status === "Proses"
                          ? "Dalam proses"
                          : r.status || "Belum diperbaiki"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {r.description}
                    </p>
                    <div className="mt-2 grid sm:grid-cols-3 gap-2 text-xs text-gray-500">
                      <p>
                        Tanggal:{" "}
                        <span className="font-medium">
                          {prettyDate(r.createdAt || r.updatedAt)}
                        </span>
                      </p>
                      <p className="truncate">
                        Lokasi:{" "}
                        <span className="font-medium">
                          {Number(r.latitude)?.toFixed(6)},{" "}
                          {Number(r.longitude)?.toFixed(6)}
                        </span>
                      </p>
                      <p className="truncate">
                        ID: <span className="font-mono">{r.id}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:flex-col">
                    <button
                      onClick={() => goToMap(r)}
                      className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm"
                      title="Lihat lokasi di peta"
                    >
                      Lihat di Peta
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deletingId === r.id}
                      className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm disabled:opacity-50"
                      title="Hapus laporan"
                    >
                      {deletingId === r.id ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/** ===== Sub-komponen ===== */

function StatCard({ title, value, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`rounded-2xl p-5 bg-white shadow border border-slate-100 relative overflow-hidden`}
    >
      <div
        className={`absolute -right-8 -top-8 w-40 h-40 rounded-full bg-gradient-to-br ${accent} blur-2xl`}
        aria-hidden
      />
      <p className="text-sm text-gray-600">{title}</p>
      <p className="mt-1 text-3xl font-extrabold text-[#285B9A]">{value}</p>
    </motion.div>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className="border border-slate-200 rounded-xl p-4 flex items-start gap-4 animate-pulse"
        >
          <div className="w-36 h-24 bg-slate-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 bg-slate-200 rounded" />
            <div className="h-3 w-1/3 bg-slate-200 rounded" />
            <div className="h-3 w-1/2 bg-slate-200 rounded" />
          </div>
          <div className="w-28 h-8 bg-slate-200 rounded-lg" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold">
        +
      </div>
      <h4 className="mt-4 text-lg font-semibold text-[#285B9A]">
        Belum ada laporan
      </h4>
      <p className="text-gray-600 mt-1">
        Kamu belum membuat laporan apa pun. Ayo mulai sekarang.
      </p>
      <button
        onClick={onCreate}
        className="mt-4 px-4 py-2 rounded-lg bg-[#3a6bb1] text-white hover:bg-[#2456a3]"
      >
        Buat Laporan Pertama
      </button>
    </div>
  );
}
