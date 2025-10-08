"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (!loading && user && user.role !== "admin") {
      router.push("/");
      return;
    }
    if (user && user.role === "admin") fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

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
      if (res.ok)
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user) return <p className="text-center mt-8">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard Admin</h1>
      <div className="bg-white p-4 rounded shadow">
        {loadingReports ? (
          <p>Memuat laporan...</p>
        ) : reports.length === 0 ? (
          <p>Tidak ada laporan.</p>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="text-left p-2">Foto</th>
                <th className="text-left p-2">Deskripsi</th>
                <th className="text-left p-2">Pelapor</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2 w-32">
                    <img
                      src={r.photoUrl}
                      className="w-24 h-16 object-cover rounded"
                      alt="foto"
                    />
                  </td>
                  <td className="p-2">{r.description}</td>
                  <td className="p-2">{r.userId}</td>
                  <td className="p-2">{r.status}</td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => changeStatus(r.id, "Proses")}
                      className="bg-yellow-400 px-3 py-1 rounded"
                    >
                      Proses
                    </button>
                    <button
                      onClick={() => changeStatus(r.id, "Selesai")}
                      className="bg-green-500 px-3 py-1 rounded text-white"
                    >
                      Selesai
                    </button>
                    <button
                      onClick={() => changeStatus(r.id, "Baru")}
                      className="bg-blue-500 px-3 py-1 rounded text-white"
                    >
                      Baru
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
