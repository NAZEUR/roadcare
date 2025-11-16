// src/app/page.js
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// --- MOCK DATA (fallback) ---
const mockReports = [
  {
    id: "r1",
    lokasi: "Palembang",
    deskripsi: "Berlubang besar dekat pasar tradisional.",
    status: "Belum diperbaiki",
    tanggal: new Date("2025-10-18T10:00:00Z"),
  },
  {
    id: "r2",
    lokasi: "Jakarta",
    deskripsi: "Retak memanjang ±20m, rawan saat hujan.",
    status: "Dalam proses",
    tanggal: new Date("2025-10-18T10:00:00Z"),
  },
  {
    id: "r3",
    lokasi: "Yogyakarta",
    deskripsi: "Tepat di tikungan, sudah ditambal.",
    status: "Sudah diperbaiki",
    tanggal: new Date("2025-10-18T10:00:00Z"),
  },
  {
    id: "r4",
    lokasi: "Bandung",
    deskripsi: "Trotoar hancur di depan sekolah, membahayakan pejalan kaki.",
    status: "Belum diperbaiki",
    tanggal: new Date("2025-10-18T10:00:00Z"),
  },
];
const mockStats = {
  laporanMasuk: 4,
  sudahDiselesaikan: 1,
  wilayahDiperbaiki: 1,
};

// --- Framer Motion Variants ---
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.08 * i, ease: "easeOut" },
  }),
};
const fade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};
const containerStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

// --- Badge status util ---
const statusClass = (s) =>
  s === "Sudah diperbaiki"
    ? "bg-green-100 text-green-700"
    : s === "Dalam proses"
    ? "bg-yellow-100 text-yellow-700"
    : "bg-red-100 text-red-700";

export default function HomePage() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    laporanMasuk: 0,
    sudahDiselesaikan: 0,
    wilayahDiperbaiki: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [statsRes, reportsRes] = await Promise.all([
          fetch("/api/reports/summary"),
          fetch("/api/reports/latest"),
        ]);
        setStats(statsRes.ok ? await statsRes.json() : mockStats);
        setReports(reportsRes.ok ? await reportsRes.json() : mockReports);
      } catch {
        setStats(mockStats);
        setReports(mockReports);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleAddReport = () => router.push("/report");
  const handleViewMap = () => router.push("/peta");

  if (loading)
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fade}
        className="text-center mt-8 text-xl text-blue-600"
      >
        Memuat halaman...
      </motion.div>
    );

  return (
    <div className="min-h-screen bg-[#f7fafc] flex flex-col">
      {/* ================= HERO ================= */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative flex flex-col md:flex-row items-center justify-center flex-1 px-8 py-12"
        style={{
          backgroundImage: "url('/background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* overlay 60% agar teks kontras + mesh dekor */}
        <div className="absolute inset-0 bg-white/60 pointer-events-none" />
        <div className="pointer-events-none absolute -left-16 -top-20 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-[#3a6bb1]/25 via-cyan-300/20 to-emerald-200/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 -bottom-16 w-[22rem] h-[22rem] rounded-full bg-gradient-to-tr from-amber-200/20 via-pink-200/20 to-[#3a6bb1]/20 blur-3xl" />

        {/* LEFT */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="relative z-10 flex-1 flex flex-col justify-center items-start max-w-xl md:pl-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#285B9A] mb-4 tracking-tight">
            Foto, Tandai, Beres!
          </h1>
          <p className="text-lg text-gray-800 mb-8 max-w-md">
            Laporkan kerusakan jalan, bangunan, dan fasilitas umum dengan foto
            &amp; titik peta. Pantau progres perbaikannya.
          </p>
          <div className="flex gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAddReport}
              className="bg-[#3a6bb1] hover:bg-[#2456a3] text-white font-semibold py-3 px-8 rounded-xl text-lg shadow-lg"
            >
              Buat Laporan
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleViewMap}
              className="border-2 border-[#3a6bb1] text-[#3a6bb1] font-semibold py-3 px-8 rounded-xl text-lg bg-white/80 hover:bg-white shadow-lg backdrop-blur"
            >
              Lihat Peta Laporan
            </motion.button>
          </div>
          <motion.p
            custom={1}
            variants={fadeUp}
            className="text-sm text-gray-700"
          ></motion.p>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="relative z-10 flex-1 flex justify-center items-center"
        >
          <img
            src="/aset.png"
            alt="Homepage Illustration"
            className="w-full max-w-2xl scale-80 -translate-y-4 md:-translate-y-8 drop-shadow-2xl transition-transform"
          />
        </motion.div>

        {/* Wave bottom divider */}
        <svg
          className="absolute bottom-0 left-0 right-0"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="#f7fafc"
            d="M0,64L60,58.7C120,53,240,43,360,37.3C480,32,600,32,720,42.7C840,53,960,75,1080,74.7C1200,75,1320,53,1380,42.7L1440,32L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z"
          />
        </svg>
      </motion.div>

      {/* ================= BANNER INFO CEPAT ================= */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerStagger}
        className="relative overflow-hidden py-12 text-center bg-gradient-to-r from-[#eaf3fa] to-white"
      >
        {/* Pattern dots via SVG data URI */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(58,107,177,0.12) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
            backgroundPosition: "0 0",
          }}
        />
        <motion.h2
          variants={fadeUp}
          className="relative text-2xl font-semibold text-[#3a6bb1] mb-2"
        >
          Mulai dari gawai kamu
        </motion.h2>
        <motion.p variants={fadeUp} className="relative text-gray-700">
          Unggah foto jelas, beri deskripsi singkat, dan letakkan pin di peta.
        </motion.p>
        <motion.img
          variants={fadeUp}
          loading="lazy"
          alt="Upload Illustration"
          src="/images/banner-upload.svg"
          onError={(e) => (e.currentTarget.style.display = "none")}
          className="relative mx-auto mt-6 w-full max-w-xl opacity-90"
        />
      </motion.section>

      {/* ================= CARA KERJA ================= */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerStagger}
        className="py-16 bg-white text-center relative"
      >
        {/* Background soft shapes */}
        <div className="pointer-events-none absolute -left-10 top-10 w-60 h-60 rounded-full bg-[#3a6bb1]/10 blur-2xl" />
        <div className="pointer-events-none absolute right-0 bottom-0 w-72 h-72 rounded-full bg-emerald-200/20 blur-3xl" />
        <motion.h2
          variants={fadeUp}
          className="text-3xl font-bold text-[#3a6bb1] mb-10"
        >
          Cara Kerja Lapor Mas
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-8">
          {[
            {
              t: "1. Buat Laporan",
              d: "Ambil foto, pilih kategori, jelaskan ringkas.",
              img: "/images/cara-kerja-1.svg",
            },
            {
              t: "2. Tandai Lokasi",
              d: "Letakkan pin di peta atau aktifkan lokasi otomatis.",
              img: "/images/cara-kerja-2.svg",
            },
            {
              t: "3. Pantau Progres",
              d: "Ikuti status: diterima → diverifikasi → diproses → selesai.",
              img: "/images/cara-kerja-3.svg",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              whileHover={{ y: -6, scale: 1.01 }}
              className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-slate-200 shadow-md hover:shadow-lg transition"
            >
              <img
                src={item.img}
                alt=""
                aria-hidden
                className="mx-auto mb-4 h-20"
                onError={(e) => (e.currentTarget.style.display = "none")}
                loading="lazy"
              />
              <h3 className="text-xl font-semibold text-[#285B9A] mb-2">
                {item.t}
              </h3>
              <p className="text-gray-600">{item.d}</p>
            </motion.div>
          ))}
        </div>
        <motion.p
          variants={fadeUp}
          className="mt-8 text-sm text-gray-500 italic"
        >
          Tip: Ambil foto di siang hari atau pastikan cukup cahaya.
        </motion.p>
      </motion.section>

      {/* ================= KATEGORI ================= */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={containerStagger}
        className="py-16 text-center relative"
      >
        {/* Mesh gradient bg */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#f7fafc] via-white to-[#eef6ff]" />
        <motion.h2
          variants={fadeUp}
          className="text-3xl font-bold text-[#3a6bb1] mb-10"
        >
          Kategori Laporan
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-8">
          {[
            {
              title: "Kerusakan Jalan",
              desc: "Lubang, retak, amblas, marka pudar.",
              img: "/images/kategori-jalan.svg",
            },
            {
              title: "Kerusakan Bangunan",
              desc: "Retak dinding, atap bocor, plafon rusak.",
              img: "/images/kategori-bangunan.svg",
            },
            {
              title: "Lainnya",
              desc: "Lampu jalan mati, rambu rusak, trotoar berlubang.",
              img: "/images/kategori-lainnya.svg",
            },
          ].map((c, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative rounded-2xl p-6 bg-white shadow-md hover:shadow-xl border border-slate-200"
            >
              <div className="absolute -z-10 inset-0 rounded-2xl bg-gradient-to-b from-[#3a6bb1]/0 to-[#3a6bb1]/5 opacity-0 group-hover:opacity-100 transition" />
              <img
                src={c.img}
                alt=""
                aria-hidden
                className="mx-auto h-20 mb-4"
                onError={(e) => (e.currentTarget.style.display = "none")}
                loading="lazy"
              />
              <h3 className="text-lg font-semibold text-[#285B9A] mb-2">
                {c.title}
              </h3>
              <p className="text-gray-600">{c.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          variants={fadeUp}
          whileHover={{ scale: 1.04, y: -2 }}
          className="mt-10 border-2 border-[#3a6bb1] text-[#3a6bb1] hover:bg-[#eaf3fa] font-semibold py-2 px-6 rounded-xl"
          onClick={() => router.push("/kategori")}
        >
          Lihat semua kategori
        </motion.button>
      </motion.section>

      {/* ================= PETA LAPORAN ================= */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={containerStagger}
        className="py-16 bg-white text-center relative overflow-hidden"
      >
        {/* Map-like grid pattern */}
        <div
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(58,107,177,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(58,107,177,0.09) 1px, transparent 1px)",
            backgroundSize: "22px 22px, 22px 22px",
          }}
        />
        <motion.h2
          variants={fadeUp}
          className="text-3xl font-bold text-[#3a6bb1] mb-4"
        >
          Peta laporan terbaru
        </motion.h2>
        <motion.p variants={fadeUp} className="text-gray-700 mb-8">
          Saring berdasarkan status, kategori, dan tanggal.
        </motion.p>
        <motion.img
          variants={fadeUp}
          src="/images/map-preview.png"
          alt="Peta Laporan"
          className="mx-auto w-full max-w-4xl rounded-2xl shadow-lg border border-slate-200"
          onError={(e) => (e.currentTarget.style.display = "none")}
          loading="lazy"
        />
        <motion.button
          variants={fadeUp}
          whileHover={{ scale: 1.05, y: -2 }}
          className="mt-8 bg-[#3a6bb1] hover:bg-[#2456a3] text-white font-semibold py-3 px-8 rounded-xl shadow-lg"
          onClick={handleViewMap}
        >
          Buka Peta
        </motion.button>
        <motion.p variants={fadeUp} className="mt-6 text-gray-500 italic">
          Belum ada laporan di area ini. Jadilah yang pertama melapor!
        </motion.p>
      </motion.section>

      {/* ================= LAPORAN TERBARU ================= */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerStagger}
        className="py-16 relative"
      >
        {/* diagonal pattern bg */}
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #e6eef9 0, #e6eef9 10px, #f7fafc 10px, #f7fafc 20px)",
          }}
        />
        <motion.h2
          variants={fadeUp}
          className="text-3xl font-bold text-center text-[#3a6bb1] mb-2"
        >
          Laporan Terbaru
        </motion.h2>
        <motion.p variants={fadeUp} className="text-center text-gray-600 mb-8">
          Menampilkan laporan terbaru dari masyarakat.
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-8">
          {reports.slice(0, 6).map((r, i) => {
            const displayStatus =
              r.status === "Selesai"
                ? "Sudah diperbaiki"
                : r.status === "Proses"
                ? "Dalam proses"
                : r.status;
            return (
              <motion.div
                key={r.id}
                custom={i}
                variants={fadeUp}
                whileHover={{ y: -6, scale: 1.01 }}
                className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm hover:shadow-lg transition group"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg text-[#285B9A] pr-2 line-clamp-2">
                    {r.deskripsi}
                  </h3>
                  <span
                    className={`shrink-0 px-3 py-1 text-xs rounded-full ${statusClass(
                      displayStatus
                    )} ml-2`}
                  >
                    {displayStatus}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Lokasi: {r.lokasi}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Tanggal: {format(r.tanggal, "dd MMM yyyy", { locale: id })}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div variants={fadeUp} className="text-center mt-10">
          <button
            className="border-2 border-[#3a6bb1] text-[#3a6bb1] hover:bg-[#eaf3fa] font-semibold py-2 px-6 rounded-xl"
            onClick={() => router.push("/laporan")}
          >
            Lihat semua laporan
          </button>
          <p className="mt-6 text-gray-500 italic">
            Kamu belum membuat laporan.{" "}
            <button
              className="text-[#3a6bb1] font-semibold underline"
              onClick={handleAddReport}
            >
              Buat laporan pertama sekarang.
            </button>
          </p>
        </motion.div>
      </motion.section>

      {/* ================= DAMPAK & TRANSPARANSI ================= */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerStagger}
        className="py-16 bg-white text-center relative overflow-hidden"
      >
        {/* radial gradient bg */}
        <div className="absolute -z-10 inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(58,107,177,0.08),_transparent_60%)]" />
        <motion.h2
          variants={fadeUp}
          className="text-3xl font-bold text-[#3a6bb1] mb-8"
        >
          Dampak & Transparansi
        </motion.h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 px-6">
          {[
            ">80% laporan selesai dalam 7 hari kerja.",
            "Semua status tercatat, dari diterima hingga selesai.",
            "Prioritas berdasarkan tingkat keparahan & kepadatan area.",
          ].map((bullet, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              whileHover={{ scale: 1.02, y: -4 }}
              className="rounded-2xl p-6 bg-white/80 border border-slate-200 backdrop-blur shadow"
            >
              <p className="text-gray-700">{bullet}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ================= TESTIMONI ================= */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={containerStagger}
        className="py-16 text-center relative overflow-hidden"
      >
        {/* subtle gradient + quotes bg */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#f7fafc] via-white to-[#f7fafc]" />
        <div
          className="absolute inset-0 -z-10 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(#3a6bb1 0.5px, transparent 0.5px)",
            backgroundSize: "16px 16px",
          }}
        />
        <motion.h2
          variants={fadeUp}
          className="text-3xl font-bold text-[#3a6bb1] mb-8"
        >
          Suara Warga
        </motion.h2>
        <motion.img
          variants={fadeUp}
          loading="lazy"
          src="/images/testimoni.svg"
          alt=""
          aria-hidden
          className="mx-auto w-24 mb-4 opacity-80"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        <motion.blockquote
          variants={fadeUp}
          className="max-w-2xl mx-auto text-gray-700 italic text-lg"
        >
          “Lapor jam 9 pagi, sore sudah disurvei. Mantap!”
        </motion.blockquote>
        <motion.p variants={fadeUp} className="mt-2 text-gray-500">
          — Rina, Talang Kelapa
        </motion.p>
      </motion.section>

      {/* ================= CTA STRIP ================= */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.6 }}
        className="py-16 text-center text-white relative overflow-hidden"
      >
        {/* bg image optional */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #285B9A 0%, #3a6bb1 40%, #2563eb 100%)",
          }}
        />
        <img
          src="/images/cta-bg.svg"
          alt=""
          aria-hidden
          className="absolute inset-0 m-auto w-[1200px] opacity-10"
          onError={(e) => (e.currentTarget.style.display = "none")}
          loading="lazy"
        />
        <h2 className="text-3xl font-bold mb-3">Lihat kerusakan? Lapor Mas!</h2>
        <p className="mb-6 opacity-90">
          Setiap laporanmu membantu perbaikan lebih cepat.
        </p>
        <motion.button
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="bg-white text-[#3a6bb1] font-semibold py-3 px-8 rounded-xl hover:bg-[#f7fafc] shadow"
          onClick={handleAddReport}
        >
          Buat Laporan Sekarang
        </motion.button>
      </motion.section>

      {/* ================= FAQ ================= */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerStagger}
        className="py-16 bg-white relative"
      >
        {/* subtle paper pattern */}
        <div
          className="absolute inset-0 -z-10 opacity-35"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0), radial-gradient(circle at 3px 3px, rgba(0,0,0,0.03) 1px, transparent 0)",
            backgroundSize: "22px 22px, 22px 22px",
          }}
        />
        <motion.h2
          variants={fadeUp}
          className="text-3xl font-bold text-center text-[#3a6bb1] mb-10"
        >
          Pertanyaan Umum
        </motion.h2>
        <div className="max-w-3xl mx-auto px-6 space-y-6">
          {[
            {
              q: "Harus buat akun?",
              a: "Untuk membuat & memantau laporan, ya.",
            },
            { q: "Bisa edit laporan?", a: "Bisa sebelum diverifikasi." },
            {
              q: "Kenapa lokasi meleset?",
              a: "Geser pin secara manual sampai tepat.",
            },
            {
              q: "Foto yang baik itu seperti apa?",
              a: "Terang, fokus, dan sertakan konteks lokasi.",
            },
          ].map((f, i) => (
            <motion.details
              key={i}
              custom={i}
              variants={fadeUp}
              className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm hover:shadow-md transition open:bg-white/90"
            >
              <summary className="cursor-pointer font-semibold text-[#285B9A] list-none">
                {f.q}
              </summary>
              <p className="text-gray-700 mt-2">{f.a}</p>
            </motion.details>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
