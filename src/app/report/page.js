"use client";
import { useState, useRef } from "react";
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
  const formRef = useRef(null);

  const submitForm = () => {
    if (!formRef.current) return;
    // Prefer requestSubmit when available (preserves validation)
    if (typeof formRef.current.requestSubmit === "function") {
      formRef.current.requestSubmit();
    } else {
      // Fallback: click the submit button inside the form
      const btn = formRef.current.querySelector('button[type="submit"]');
      if (btn) btn.click();
    }
  };

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
    <div className="min-h-screen bg-[#f7fcf6]">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-700">
          Buat Laporan Baru
        </h1>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Left: Form (styled) */}
          <div className="bg-white border rounded-xl p-6 shadow-lg">
            <p className="text-gray-600 mb-6">
              Sampaikan laporan Anda agar dapat segera ditindaklanjuti.
            </p>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
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
                  {file && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-full h-40 object-cover rounded-md border"
                      />
                    </div>
                  )}
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
                    className="bg-green-600 text-white px-4 rounded-r-md hover:bg-green-700"
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
                  className="w-full border rounded-md px-3 py-2 text-gray-600"
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
                  className="w-full bg-gradient-to-r from-green-600 to-green-600 text-white py-3 rounded-md hover:from-green-700 hover:to-green-800 disabled:opacity-60"
                >
                  {loading ? "Mengirim..." : "Kirim Laporan"}
                </button>
              </div>

              {error && <p className="text-red-500">{error}</p>}
            </form>
          </div>

          {/* Right: Map */}
          <div className="h-96 md:h-[720px] rounded-xl overflow-hidden border">
            <MapView onMapClick={handleMapClick} selectedPosition={position} />
          </div>
        </div>
      </div>
      {/* Mobile floating submit button */}
      <div className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <button
          type="button"
          onClick={submitForm}
          disabled={loading}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-green-600 to-green-600 text-white shadow-lg"
        >
          {loading ? "Mengirim..." : "Kirim Laporan"}
        </button>
      </div>
    </div>
  );
}
