"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { db } from "@/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { motion } from "framer-motion";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function PetaPage() {
  const [reports, setReports] = useState([]);
  const [userLoc, setUserLoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "", category: "" });

  // Fetch reports from Firestore
  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      try {
        const q = query(collection(db, "reports"));
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setReports(data);
      } catch (err) {
        setReports([]);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  // Get user location
  const handleFindMe = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        alert("Gagal mengambil lokasi. Aktifkan GPS dan izinkan akses lokasi.");
      }
    );
  }, []);

  // Filter reports
  const filteredReports = reports.filter((r) => {
    if (filter.status && r.status !== filter.status) return false;
    if (filter.category && r.category !== filter.category) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f7fafc] py-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-[#3a6bb1] text-center mb-6"
      >
        Peta Laporan
      </motion.h1>
      <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto mb-8">
        <div className="flex-1 bg-white rounded-lg shadow p-6 mb-6 md:mb-0">
          <div className="flex gap-4 mb-4">
            <select
              className="border rounded px-3 py-2"
              value={filter.status}
              onChange={(e) =>
                setFilter((f) => ({ ...f, status: e.target.value }))
              }
            >
              <option value="">Semua Status</option>
              <option value="Baru">Baru</option>
              <option value="Belum diperbaiki">Belum diperbaiki</option>
              <option value="Dalam proses">Dalam proses</option>
              <option value="Sudah diperbaiki">Sudah diperbaiki</option>
            </select>
            <select
              className="border rounded px-3 py-2"
              value={filter.category}
              onChange={(e) =>
                setFilter((f) => ({ ...f, category: e.target.value }))
              }
            >
              <option value="">Semua Kategori</option>
              <option value="Jalan">Jalan</option>
              <option value="Bangunan">Bangunan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
            <button
              className="px-4 py-2 rounded bg-[#3a6bb1] text-white font-semibold"
              onClick={handleFindMe}
            >
              Temukan Lokasi Saya
            </button>
            <button
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold"
              onClick={() => setFilter({ status: "", category: "" })}
            >
              Reset Filter
            </button>
          </div>
          <div className="text-sm text-gray-500 mb-2">
            Klik marker untuk detail laporan dan jarak ke lokasi Anda.
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto rounded-lg overflow-hidden shadow-lg">
        <MapContainer
          center={[-2.2, 115]}
          zoom={5.5}
          style={{ height: "70vh", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filteredReports.map((r) => (
            <Marker key={r.id} position={[r.latitude, r.longitude]}>
              <Popup>
                <div className="min-w-[220px]">
                  <div className="font-bold text-[#3a6bb1] mb-1">
                    {r.category || "-"}
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    {r.description}
                  </div>
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 mr-2">
                      {r.status}
                    </span>
                    <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                      {format(
                        new Date(
                          r.createdAt?.seconds
                            ? r.createdAt.seconds * 1000
                            : r.createdAt
                        ),
                        "dd MMM yyyy",
                        { locale: localeId }
                      )}
                    </span>
                  </div>
                  {r.photoUrl && (
                    <img
                      src={r.photoUrl}
                      alt="Foto Laporan"
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  {userLoc && (
                    <div className="mt-2 text-xs text-gray-600">
                      Jarak:{" "}
                      <span className="font-bold">
                        {haversine(
                          userLoc.lat,
                          userLoc.lng,
                          r.latitude,
                          r.longitude
                        ).toFixed(2)}{" "}
                        km
                      </span>
                      <br />
                      Waktu tempuh:{" "}
                      <span className="font-bold">
                        {Math.ceil(
                          (haversine(
                            userLoc.lat,
                            userLoc.lng,
                            r.latitude,
                            r.longitude
                          ) /
                            30) *
                            60
                        )}{" "}
                        menit
                      </span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
          {userLoc && (
            <Marker position={[userLoc.lat, userLoc.lng]}>
              <Popup>
                <div className="font-bold text-green-700">Lokasi Anda</div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
