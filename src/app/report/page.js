"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function ReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMapClick = (latlng) => {
    setPosition(latlng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !description || !position) {
      setError("Harap isi semua field dan pilih lokasi di peta.");
      return;
    }
    if (!user) {
      setError("Anda harus login untuk melapor.");
      return;
    }
    setLoading(true);
    setError("");

    // 1. Upload image to Cloudinary via our API
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

      const photoUrl = uploadData.url;

      // 2. Submit report data to our API
      const reportData = {
        userId: user.uid,
        photoUrl,
        description,
        latitude: position.lat,
        longitude: position.lng,
      };

      const reportRes = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });

      if (!reportRes.ok) throw new Error("Failed to submit report");

      router.push("/"); // Redirect to home after successful report
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Buat Laporan Baru</h1>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Left: Form (styled) */}
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <p className="text-gray-600 mb-6">
              Sampaikan laporan Anda agar dapat segera ditindaklanjuti.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Laporan
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Jalan berlubang di depan Balai Desa"
                  className="w-full border rounded-md px-3 py-2 text-gray-700 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi Kondisi Jalan
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full border rounded-md px-3 py-2 text-gray-700 placeholder-gray-400"
                  placeholder="Jelaskan detail kerusakan, perkiraan ukuran, kedalaman, dan potensi bahaya bagi pengguna jalan."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foto Kerusakan
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  <div className="mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mx-auto h-8 w-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16l-4-4m0 0l4-4m-4 4h18"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">
                    Unggah file atau seret dan lepas
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, GIF hingga 10MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="mt-3 w-full"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={
                      position
                        ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(
                            5
                          )}`
                        : "Pilih lokasi di peta"
                    }
                    className="flex-1 border rounded-l-md px-3 py-2 text-gray-600 bg-white"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!navigator.geolocation) return;
                      navigator.geolocation.getCurrentPosition((p) => {
                        handleMapClick({
                          lat: p.coords.latitude,
                          lng: p.coords.longitude,
                        });
                      });
                    }}
                    className="bg-white border-l border-gray-300 px-4 rounded-r-md"
                  >
                    Gunakan Lokasi Saya
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  defaultValue="Baru"
                >
                  <option>Belum diperbaiki</option>
                  <option>Proses</option>
                  <option>Selesai</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? "Mengirim..." : "Kirim Laporan"}
                </button>
              </div>

              {error && <p className="text-red-500">{error}</p>}
            </form>
          </div>

          {/* Right: Map */}
          <div className="h-[680px] md:h-[720px] rounded-md overflow-hidden border">
            <MapView onMapClick={handleMapClick} selectedPosition={position} />
          </div>
        </div>
      </div>
    </div>
  );
}
