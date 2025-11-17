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
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Baru");
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
    if (!file || !description || !position || !category) {
      setError("Harap isi semua field, pilih kategori, dan lokasi di peta.");
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
        title,
        category,
        status,
        latitude: position.lat,
        longitude: position.lng,
        createdAt: new Date().toISOString(),
      };

      const reportRes = await fetch("/api/report", {
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
    <div className="min-h-screen bg-[#eaf3fb] px-4 py-6 sm:py-8 md:py-12">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 text-[#3a6bb1]">
          Buat Laporan Baru
        </h1>
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-start">
          {/* Left: Form (styled) */}
          <div className="bg-white border border-[#3a6bb1]/20 rounded-xl p-4 sm:p-6 md:p-8 shadow-lg">
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-6">
              Sampaikan laporan Anda agar dapat segera ditindaklanjuti.
            </p>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#3a6bb1] mb-1">
                  Judul Laporan
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Jalan berlubang di depan Balai Desa"
                  className="w-full border rounded-md px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-700 placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#3a6bb1] mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border rounded-md px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-700"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Jalan">Jalan</option>
                  <option value="Bangunan">Bangunan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#3a6bb1] mb-1">
                  Deskripsi Kondisi
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full border rounded-md px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-700 placeholder-gray-400"
                  placeholder="Jelaskan detail kerusakan, perkiraan ukuran, kedalaman, dan potensi bahaya."
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#3a6bb1] mb-1">
                  Foto Kerusakan
                </label>
                <div className="border-2 border-dashed border-[#3a6bb1]/30 rounded-md p-3 sm:p-4 md:p-6 text-center">
                  <div className="mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mx-auto h-6 sm:h-8 w-6 sm:w-8 text-[#3a6bb1]"
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
                  <p className="text-xs sm:text-sm text-gray-600">
                    Unggah file atau seret dan lepas
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, GIF hingga 10MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="mt-2 sm:mt-3 w-full text-xs"
                    required
                  />
                  {file && (
                    <div className="mt-2 sm:mt-3">
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">Preview:</p>
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-full h-32 sm:h-40 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#3a6bb1] mb-1">
                  Lokasi
                </label>
                <div className="flex gap-2 flex-col sm:flex-row">
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
                    className="flex-1 border rounded-md sm:rounded-l-md px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-600 bg-white"
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
                    className="bg-[#3a6bb1] text-white px-3 sm:px-4 py-2 rounded-md sm:rounded-r-md hover:bg-[#2a4e7c] text-xs sm:text-sm whitespace-nowrap"
                  >
                    Gunakan Lokasi Saya
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#3a6bb1] mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border rounded-md px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-700"
                  required
                >
                  <option value="Baru">Baru</option>
                  <option value="Belum diperbaiki">Belum diperbaiki</option>
                  <option value="Dalam proses">Dalam proses</option>
                  <option value="Sudah diperbaiki">Sudah diperbaiki</option>
                </select>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#3a6bb1] to-[#5fa3e7] text-white py-2 sm:py-3 rounded-md text-sm sm:text-base hover:from-[#2a4e7c] hover:to-[#3a6bb1] disabled:opacity-60"
                >
                  {loading ? "Mengirim..." : "Kirim Laporan"}
                </button>
              </div>
              {error && <p className="text-xs sm:text-sm text-red-500">{error}</p>}
            </form>
          </div>
          {/* Right: Map */}
          <div className="h-80 sm:h-96 md:h-[720px] rounded-xl overflow-hidden border border-[#3a6bb1]/20 order-first md:order-last">
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
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-[#3a6bb1] to-[#5fa3e7] text-white text-sm sm:text-base shadow-lg"
        >
          {loading ? "Mengirim..." : "Kirim Laporan"}
        </button>
      </div>
    </div>
  );
}
