"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  GoogleMap,
  MarkerF,
  InfoWindowF,
  useLoadScript,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";

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

const libraries = ["maps", "geometry", "routes"];

export default function PetaAdminPage() {
  const [reports, setReports] = useState([]);
  const [adminLoc, setAdminLoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  // FILTER seperti peta user
  const [filter, setFilter] = useState({ status: "", category: "" });

  // === STATE RUTE ADMIN ===
  const [routeInfo, setRouteInfo] = useState(null); // { id, origin, destination, report }
  const [directionsResult, setDirectionsResult] = useState(null);

  const routeIdRef = useRef(0);
  const rendererRef = useRef(null);

  const { isLoaded, isError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  const defaultCenter = useMemo(() => ({ lat: -2.2, lng: 115 }), []);

  // Fetch reports dari Firestore
  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      try {
        const q = query(collection(db, "reports"));
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setReports(data);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setReports([]);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  // FILTERED REPORTS (status + category)
  const filteredReports = useMemo(
    () =>
      reports.filter((r) => {
        if (filter.status && r.status !== filter.status) return false;
        if (filter.category && r.category !== filter.category) return false;
        return true;
      }),
    [reports, filter]
  );

  // Stats jarak & waktu dari DirectionsResult
  const routeStats = useMemo(() => {
    let hasData = false;
    let distanceKm = 0;
    let durationMin = 0;

    if (directionsResult) {
      try {
        const route = directionsResult.routes[0];
        let meters = 0;
        let seconds = 0;
        route.legs.forEach((leg) => {
          if (leg.distance?.value) meters += leg.distance.value;
          if (leg.duration?.value) seconds += leg.duration.value;
        });
        distanceKm = meters / 1000;
        durationMin = Math.ceil(seconds / 60);
        hasData = true;
      } catch (e) {
        console.warn("Gagal baca distance dari directionsResult:", e);
      }
    } else if (routeInfo && adminLoc) {
      const d = haversine(
        adminLoc.lat,
        adminLoc.lng,
        routeInfo.destination.lat,
        routeInfo.destination.lng
      );
      distanceKm = d;
      durationMin = Math.ceil((d / 30) * 60);
      hasData = true;
    }

    return { hasData, distanceKm, durationMin };
  }, [directionsResult, routeInfo, adminLoc]);

  // Get admin location
  const handleFindMe = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung di browser ini.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setAdminLoc(newLoc);
        if (map) {
          map.panTo(newLoc);
          map.setZoom(14);
        }
      },
      () => {
        alert(
          "Gagal mengambil lokasi admin. Aktifkan GPS dan izinkan akses lokasi."
        );
      }
    );
  }, [map]);

  const onLoadMap = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  // Handle getting route (dari admin ke report)
  const handleGetRoute = (report) => {
    if (!adminLoc) {
      alert(
        "Lokasi admin belum ditemukan. Klik 'Temukan Lokasi Saya' terlebih dahulu."
      );
      return;
    }

    const newId = routeIdRef.current + 1;
    routeIdRef.current = newId;

    setSelectedReport(null);
    setDirectionsResult(null);

    setRouteInfo({
      id: newId,
      origin: adminLoc,
      destination: { lat: report.latitude, lng: report.longitude },
      report: report,
    });
  };

  // Handle Directions Service response
  const handleDirectionsCallback = useCallback(
    (result, status) => {
      if (!routeInfo || routeInfo.id !== routeIdRef.current) return;

      if (status === window.google.maps.DirectionsStatus.OK) {
        setDirectionsResult(result);
      } else {
        console.error("Directions request failed:", status);
      }
    },
    [routeInfo]
  );

  // Clear route
  const clearRoute = () => {
    routeIdRef.current += 1;

    if (rendererRef.current) {
      try {
        rendererRef.current.setDirections({ routes: [] });
        rendererRef.current.setMap(null);
      } catch (e) {
        console.warn("Failed to clear renderer:", e);
      }
    }

    setDirectionsResult(null);
    setRouteInfo(null);
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f7fafc]">
        <p className="text-lg text-[#3a6bb1]">Memuat Peta Admin...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f7fafc]">
        <p className="text-lg text-red-500">
          Gagal memuat Google Maps. Periksa API key Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fafc] py-8">
      <h1 className="text-3xl font-bold text-[#3a6bb1] text-center mb-6">
        📊 Peta Admin Laporan
      </h1>

      <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto mb-8">
        <div className="flex-1 bg-white rounded-lg shadow p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {/* FILTER STATUS */}
            <select
              className="border rounded px-3 py-2 text-sm"
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

            {/* FILTER KATEGORI */}
            <select
              className="border rounded px-3 py-2 text-sm"
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

            {/* Lokasi admin */}
            <button
              className="px-4 py-2 rounded bg-[#3a6bb1] text-white font-semibold text-sm hover:bg-[#2a4e7c]"
              onClick={handleFindMe}
            >
              📍 Lokasi Admin
            </button>

            {/* Reset filter */}
            <button
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-300"
              onClick={() => setFilter({ status: "", category: "" })}
            >
              Reset
            </button>

            {/* Hapus rute */}
            {routeInfo && (
              <button
                className="px-4 py-2 rounded bg-red-500 text-white font-semibold text-sm hover:bg-red-600"
                onClick={clearRoute}
              >
                ✕ Hapus Rute
              </button>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {filteredReports.length} laporan ditemukan
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto rounded-lg overflow-hidden shadow-lg">
        <GoogleMap
          mapContainerStyle={{ height: "70vh", width: "100%" }}
          center={adminLoc || defaultCenter}
          zoom={adminLoc ? 14 : 5.5}
          onLoad={onLoadMap}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
          }}
        >
          {/* Directions Service untuk menghitung rute */}
          {routeInfo && (
            <DirectionsService
              options={{
                origin: routeInfo.origin,
                destination: routeInfo.destination,
                travelMode: window.google?.maps?.TravelMode?.DRIVING,
              }}
              callback={handleDirectionsCallback}
            />
          )}

          {/* DirectionsRenderer untuk menggambar rute di map */}
          {directionsResult && (
            <DirectionsRenderer
              options={{ directions: directionsResult }}
              onLoad={(renderer) => {
                rendererRef.current = renderer;
              }}
              onUnmount={() => {
                rendererRef.current = null;
              }}
            />
          )}

          {/* Markers laporan (sudah terfilter) */}
          {filteredReports.map((r) => (
            <MarkerF
              key={r.id}
              position={{ lat: r.latitude, lng: r.longitude }}
              onClick={() => {
                setSelectedReport(r);
              }}
              title={r.category}
            >
              {selectedReport && selectedReport.id === r.id && (
                <InfoWindowF onCloseClick={() => setSelectedReport(null)}>
                  <div className="min-w-[250px] max-w-sm p-2">
                    <div className="font-bold text-[#3a6bb1] mb-1 text-sm">
                      {r.category || "Laporan"}
                    </div>
                    <div className="text-xs text-gray-700 mb-2 line-clamp-2">
                      {r.description}
                    </div>
                    <div className="mb-2 flex gap-1">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                        {r.status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
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
                        className="w-full h-28 object-cover rounded mb-2"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-road.jpg";
                        }}
                      />
                    )}

                    {adminLoc && (
                      <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <div>
                          Jarak (garis lurus):{" "}
                          <span className="font-bold text-[#3a6bb1]">
                            {haversine(
                              adminLoc.lat,
                              adminLoc.lng,
                              r.latitude,
                              r.longitude
                            ).toFixed(2)}{" "}
                            km
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      className="w-full mt-3 px-3 py-2 rounded bg-[#3a6bb1] text-white text-xs font-semibold hover:bg-[#2a4e7c]"
                      onClick={() => handleGetRoute(r)}
                    >
                      🗺 Lihat Rute
                    </button>
                  </div>
                </InfoWindowF>
              )}
            </MarkerF>
          ))}

          {/* Marker lokasi admin */}
          {adminLoc && (
            <MarkerF
              position={adminLoc}
              title="Lokasi Admin"
              icon={{
                path: window.google?.maps?.SymbolPath?.CIRCLE,
                scale: 8,
                fillColor: "#ef4444",
                fillOpacity: 0.9,
                strokeColor: "#fff",
                strokeWeight: 2,
              }}
            />
          )}
        </GoogleMap>
      </div>

      {/* Detail Rute Inspeksi */}
      {routeInfo && adminLoc && routeStats.hasData && (
        <div className="max-w-6xl mx-auto mt-6 bg-white rounded-lg shadow p-6 border-l-4 border-[#3a6bb1]">
          <h2 className="text-lg font-bold text-[#3a6bb1] mb-3">
            📍 Rute Inspeksi
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600">Jarak ke Laporan (rute)</p>
              <p className="text-2xl font-bold text-[#3a6bb1]">
                {routeStats.distanceKm.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">km</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Waktu Tempuh (estimasi)</p>
              <p className="text-2xl font-bold text-[#3a6bb1]">
                {routeStats.durationMin}
              </p>
              <p className="text-xs text-gray-500">menit</p>
            </div>
            <div className="flex items-center justify-end">
              <button
                onClick={clearRoute}
                className="px-6 py-2 bg-red-500 text-white rounded font-semibold hover:bg-red-600"
              >
                Tutup Rute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
