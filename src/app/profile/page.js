"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

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
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(
        `/api/reports/user?id=${encodeURIComponent(id)}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user) return <p className="text-center mt-8">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-bold">Profil</h2>
        <p className="mt-2">Nama: {user.name || "-"}</p>
        <p>Email: {user.email}</p>
        <p>Role: {user.role || "user"}</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-bold mb-4">Laporan Saya</h3>
        {loadingReports ? (
          <p>Memuat laporan...</p>
        ) : reports.length === 0 ? (
          <p>Belum ada laporan.</p>
        ) : (
          <ul className="space-y-4">
            {reports.map((r) => (
              <li
                key={r.id}
                className="border p-3 rounded flex items-start gap-4"
              >
                <img
                  src={r.photoUrl}
                  className="w-28 h-20 object-cover rounded"
                  alt="foto"
                />
                <div className="flex-1">
                  <p className="font-semibold">{r.description}</p>
                  <p className="text-sm text-gray-500">Status: {r.status}</p>
                  <p className="text-sm text-gray-500">
                    Lokasi: {r.latitude}, {r.longitude}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-red-600"
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
