"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState, useRef } from "react";

// Fix default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Component to handle map clicks for reporting
function LocationMarker({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function MapView({
  reports = [],
  onMapClick,
  selectedPosition,
}) {
  const [userPosition, setUserPosition] = useState(null);
  const [mounted, setMounted] = useState(false);
  const mapRef = useRef(null);

  // Ensure reports is always an array to avoid runtime errors when mapping
  const safeReports = Array.isArray(reports) ? reports : [];
  if (process.env.NODE_ENV !== "production" && !Array.isArray(reports)) {
    // eslint-disable-next-line no-console
    console.warn(
      "MapView: expected 'reports' to be an array but received:",
      reports
    );
  }

  useEffect(() => {
    // Guard navigator availability (should already be client-only but be defensive)
    const defaultPos = [-6.2088, 106.8456]; // Jakarta
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        (err) => {
          console.error("Gagal mendapatkan lokasi.", err);
          setUserPosition(defaultPos);
        }
      );
    } else {
      setUserPosition(defaultPos);
    }
    // mark mounted after geolocation attempt so Leaflet initializes on actual DOM
    setMounted(true);

    // cleanup: remove any existing map instance on unmount to prevent
    // "Map container is being reused by another instance" errors
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapRef.current = null;
      }
    };
  }, []);

  const getMarkerColor = (status) => {
    switch (status) {
      case "Baru":
        return "blue";
      case "Proses":
        return "orange";
      case "Selesai":
        return "green";
      default:
        return "grey";
    }
  };

  const createIcon = (color) => {
    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  if (!mounted || !userPosition) return <div>Loading map...</div>;

  return (
    <MapContainer
      center={userPosition}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      whenCreated={(mapInstance) => {
        mapRef.current = mapInstance;
      }}
      key={String(userPosition)}
    >
      {(() => {
        const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (googleKey) {
          // Use Google Maps tile endpoint (requires API key). If you want other map types,
          // change lyrs param (m=default roadmap, s=satellite, t=terrain, y=hybrid)
          const url = `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${googleKey}`;
          return <TileLayer url={url} attribution={"Map data \u00A9 Google"} />;
        }
        // Fallback to OpenStreetMap
        return (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        );
      })()}

      {/* User's Current Location Marker */}
      <Marker position={userPosition} icon={createIcon("red")}>
        <Popup>Lokasi Anda Saat Ini</Popup>
      </Marker>

      {/* Reports Markers */}
      {safeReports.map((report) => (
        <Marker
          key={report.id}
          position={[report.latitude, report.longitude]}
          icon={createIcon(getMarkerColor(report.status))}
        >
          <Popup>
            <div className="w-40">
              <img
                src={report.photoUrl}
                alt={report.description}
                className="w-full h-20 object-cover rounded-md mb-2"
              />
              <p className="font-semibold">{report.description}</p>
              <p className="text-sm">
                Status:{" "}
                <span
                  className={`font-bold text-${getMarkerColor(
                    report.status
                  )}-600`}
                >
                  {report.status}
                </span>
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Marker for new report selection */}
      {onMapClick && <LocationMarker onMapClick={onMapClick} />}
      {selectedPosition && (
        <Marker position={selectedPosition} icon={createIcon("yellow")}>
          <Popup>Lokasi lubang yang dipilih</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
