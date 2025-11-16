"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { db } from "@/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then(mod => mod.Polyline), { ssr: false });

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function PetaAdminPage() {
  const [reports, setReports] = useState([]);
  const [userLoc, setUserLoc] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [route, setRoute] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Get admin location
  useEffect(() => {
    if (!userLoc && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          alert("Gagal mengambil lokasi admin. Aktifkan GPS dan izinkan akses lokasi.");
        }
      );
    }
  }, [userLoc]);

  // Calculate route (straight line for now)
  useEffect(() => {
    if (userLoc && selectedReport) {
      setRoute([
        [userLoc.lat, userLoc.lng],
        [selectedReport.latitude, selectedReport.longitude],
      ]);
    } else {
      setRoute([]);
    }
  }, [userLoc, selectedReport]);

  return (
    <div className="min-h-screen bg-[#f7fafc] py-8">
      <h1 className="text-3xl font-bold text-[#3a6bb1] text-center mb-6">Peta Admin Laporan</h1>
      <div className="max-w-6xl mx-auto rounded-lg overflow-hidden shadow-lg">
        <MapContainer center={[-2.2, 115]} zoom={5.5} style={{ height: "70vh", width: "100%" }} scrollWheelZoom={true}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {reports.map((r) => (
            <Marker key={r.id} position={[r.latitude, r.longitude]} eventHandlers={{ click: () => setSelectedReport(r) }}>
              <Popup>
                <div className="min-w-[220px]">
                  <div className="font-bold text-[#3a6bb1] mb-1">{r.category || "-"}</div>
                  <div className="text-sm text-gray-700 mb-2">{r.description}</div>
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 mr-2">{r.status}</span>
                    <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">{format(new Date(r.createdAt?.seconds ? r.createdAt.seconds * 1000 : r.createdAt), "dd MMM yyyy", { locale: localeId })}</span>
                  </div>
                  {r.photoUrl && (
                    <img src={r.photoUrl} alt="Foto Laporan" className="w-full h-32 object-cover rounded mb-2" />
                  )}
                  {userLoc && (
                    <div className="mt-2 text-xs text-gray-600">
                      Jarak: <span className="font-bold">{haversine(userLoc.lat, userLoc.lng, r.latitude, r.longitude).toFixed(2)} km</span>
                      <br />
                      Waktu tempuh: <span className="font-bold">{Math.ceil(haversine(userLoc.lat, userLoc.lng, r.latitude, r.longitude) / 30 * 60)} menit</span>
                    </div>
                  )}
                  <button
                    className="mt-2 px-4 py-2 bg-[#3a6bb1] text-white rounded hover:bg-[#2a4e7c]"
                    onClick={() => setSelectedReport(r)}
                  >
                    Tampilkan Rute
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
          {userLoc && (
            <Marker position={[userLoc.lat, userLoc.lng]}>
              <Popup>
                <div className="font-bold text-green-700">Lokasi Admin</div>
              </Popup>
            </Marker>
          )}
          {route.length === 2 && <Polyline positions={route} color="#3a6bb1" />} 
        </MapContainer>
      </div>
      <div className="max-w-6xl mx-auto mt-6">
        {selectedReport && userLoc && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-[#3a6bb1] mb-2">Rute ke Laporan</h2>
            <p className="mb-2">Dari lokasi admin ke titik laporan:</p>
            <p className="mb-2">Jarak: <span className="font-bold">{haversine(userLoc.lat, userLoc.lng, selectedReport.latitude, selectedReport.longitude).toFixed(2)} km</span></p>
            <p className="mb-2">Waktu tempuh (estimasi): <span className="font-bold">{Math.ceil(haversine(userLoc.lat, userLoc.lng, selectedReport.latitude, selectedReport.longitude) / 30 * 60)} menit</span></p>
            <button className="mt-4 px-6 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setSelectedReport(null)}>Tutup Rute</button>
          </div>
        )}
      </div>
    </div>
  );
}
