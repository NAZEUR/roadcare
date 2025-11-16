"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import AdminStatsChart from "@/component/AdminStatsChart";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const deleteReport = async (id) => {
    if (!confirm("Yakin ingin menghapus/reject laporan ini?")) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`/api/reports/admin`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert("Gagal menghapus laporan.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, router]);

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/reports/admin", {
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

  const changeStatus = async (id, status) => {
    if (!confirm(`Yakin ingin mengubah status laporan menjadi ${status}?`))
      return;

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/reports/admin", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
      } else {
        alert("Gagal mengubah status laporan.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calculatedStats = useMemo(() => {
    const completedReports = reports.filter(
      (r) => r.status === "Selesai"
    ).length;
    const laporanMasuk = reports.filter((r) => r.status !== "Selesai").length;

    return {
      laporanMasuk: laporanMasuk,
      sudahDiselesaikan: completedReports,
      wilayahDiperbaiki: completedReports,
    };
  }, [reports]);

  const formatDate = (createdAt) => {
    if (createdAt && typeof createdAt.seconds === "number") {
      return format(new Date(createdAt.seconds * 1000), "dd MMM yyyy", {
        locale: id,
      });
    }
    if (createdAt && typeof createdAt === "string") {
      const date = new Date(createdAt);
      if (!isNaN(date)) {
        return format(date, "dd MMM yyyy", { locale: id });
      }
    }
    return "-";
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Selesai":
      case "Sudah diperbaiki":
        return "bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded text-xs";
      case "Proses":
      case "Dalam proses":
        return "bg-yellow-100 text-yellow-700 font-medium px-2 py-0.5 rounded text-xs";
      case "Baru":
      case "Belum diperbaiki":
      default:
        return "bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded text-xs";
    }
  };

  // 💡 FUNGSI INI KITA HAPUS KARENA MENYEBABKAN MASALAH TAILWIND
  // const getButtonClass = (color) =>
  //   `bg-${color}-500 hover:bg-${color}-600 px-3 py-1 rounded text-white text-xs transition duration-150`;

  if (loading || !user || loadingReports) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#eaf3fb]">
        <p className="text-xl text-blue-600">Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fafc]">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">
          Dashboard Admin RoadCare
        </h1>

        {/* --- STATISTIK CARD --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">
              {calculatedStats.laporanMasuk}
            </p>
            <p className="text-lg text-gray-600">Laporan Masuk</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
            <p className="text-4xl font-bold text-green-600 mb-2">
              {calculatedStats.sudahDiselesaikan}
            </p>
            <p className="text-lg text-gray-600">Sudah Diselesaikan</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
            <p className="text-4xl font-bold text-purple-600 mb-2">
              {calculatedStats.wilayahDiperbaiki}
            </p>
            <p className="text-lg text-gray-600">Wilayah Diperbaiki</p>
          </div>
        </div>

        {/* --- CHART STATISTIK --- */}
        <div className="bg-white p-6 rounded-lg shadow-xl mb-10">
          <h2 className="text-2xl font-bold mb-4 text-blue-800">
            Statistik Laporan
          </h2>
          {}
          <AdminStatsChart stats={calculatedStats} />
        </div>

        {/* --- TABEL LAPORAN --- */}
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-blue-800">
            Laporan Kerusakan Terbaru
          </h2>
          {reports.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              Tidak ada laporan yang ditemukan.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b text-left text-sm text-gray-600 uppercase tracking-wider">
                    <th className="p-3">Foto</th>
                    <th className="p-3">Deskripsi</th>
                    <th className="p-3">Pelapor ID</th>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b hover:bg-gray-50 text-sm"
                    >
                      <td className="p-3 w-32">
                        <img
                          src={r.photoUrl || "/placeholder-road.jpg"}
                          className="w-24 h-16 object-cover rounded shadow"
                          alt="Foto Laporan"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder-road.jpg";
                          }}
                        />
                      </td>
                      <td className="p-3 max-w-sm text-gray-800 line-clamp-2">
                        {r.description}
                      </td>
                      <td className="p-3 text-gray-600 font-mono text-xs">
                        {r.userId.substring(0, 6)}...
                      </td>
                      <td className="p-3 text-gray-600">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="p-3">
                        <span className={getStatusStyle(r.status)}>
                          {r.status}
                        </span>
                      </td>

                      {/* --- 💡💡 PERBAIKAN DI SINI 💡💡 --- */}
                      <td className="p-3 space-y-1 sm:space-y-0 space-x-0 sm:space-x-2 flex flex-col sm:flex-row justify-center items-center">
                        <button
                          onClick={() => changeStatus(r.id, "Proses")}
                          className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-white text-xs transition duration-150"
                        >
                          Proses
                        </button>
                        <button
                          onClick={() => changeStatus(r.id, "Selesai")}
                          className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-white text-xs transition duration-150"
                        >
                          Selesai
                        </button>
                        <button
                          onClick={() => changeStatus(r.id, "Baru")}
                          className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-white text-xs transition duration-150"
                        >
                          Baru
                        </button>
                        <button
                          onClick={() => deleteReport(r.id)}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white text-xs transition duration-150"
                        >
                          Hapus/Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-6">
            <button
              onClick={() => router.push("/peta-admin")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 w-full md:w-auto"
            >
              Lihat Semua di Peta Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
