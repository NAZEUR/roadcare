"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamic import for MapView component to ensure it's client-side only
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <p className="text-center mt-10">Loading map...</p>,
});

export default function Home() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();
        // API may return either an array or an object { error, reports }
        if (!res.ok) {
          const msg = data?.error || `HTTP ${res.status}`;
          setError("Gagal memuat laporan: " + msg);
          setReports(Array.isArray(data?.reports) ? data.reports : []);
        } else if (Array.isArray(data)) {
          setReports(data);
        } else if (data && Array.isArray(data.reports)) {
          setReports(data.reports);
          if (data.error) setError(data.error);
        } else {
          setError("Gagal memuat laporan: format data tidak sesuai dari server");
          setReports([]);
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        setError("Gagal memuat laporan: " + (error.message || error));
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Fetching reports data...</p>;
  }

  const safeReports = Array.isArray(reports) ? reports : [];

  return (
    <div style={{ height: "calc(100vh - 64px)", width: "100%" }}>
      {error && (
        <div className="absolute z-50 left-4 top-24 bg-red-100 text-red-800 px-4 py-2 rounded">
          {error}
        </div>
      )}
      <MapView reports={safeReports} />
    </div>
  );
}
