import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

const Navbar = () => {
  const { user, signOut } = useAuth(); // 'user' di sini sudah berisi 'role' dari AuthContext

  // --- Helper untuk kelas styling link ---
  const linkStyle = "text-[#3a6bb1] font-medium text-lg hover:underline";
  const logoutButtonStyle =
    "px-5 py-2 rounded-full bg-red-500 text-white font-medium hover:bg-red-700 transition ml-4";

  return (
    <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center w-full border-b border-blue-100">
      {/* Logo selalu tampil */}
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/logo.jpg"
          alt="Lapor Mas Logo"
          width={480}
          height={480}
          className="h-13 w-auto"
        />
      </Link>

      {/* --- Menu dinamis berdasarkan role --- */}
      <div className="flex items-center gap-8">
        {/* 1. TAMPILAN UNTUK ADMIN */}
        {user && user.role === "admin" ? (
          <>
            <Link href="/admin" className={linkStyle}>
              Beranda
            </Link>
            <Link href="/peta-admin" className={linkStyle}>
              Peta Admin
            </Link>
            <button onClick={signOut} className={logoutButtonStyle}>
              Logout
            </button>
          </>
        ) : // 2. TAMPILAN UNTUK USER BIASA (SUDAH LOGIN)
        user && user.role !== "admin" ? (
          <>
            <Link href="/" className={linkStyle}>
              Beranda
            </Link>
            <Link href="/peta" className={linkStyle}>
              Peta
            </Link>
            <Link href="/report" className={linkStyle}>
              Buat Laporan
            </Link>
            <Link href="/profile" className={linkStyle}>
              Profile
            </Link>
            <button onClick={signOut} className={logoutButtonStyle}>
              Logout
            </button>
          </>
        ) : (
          // 3. TAMPILAN UNTUK PENGUNJUNG (BELUM LOGIN)
          <>
            <Link href="/" className={linkStyle}>
              Beranda
            </Link>
            {/* Tombol Login & Register */}
            <div className="flex items-center gap-2 ml-4">
              <Link
                href="/login"
                className="px-5 py-2 rounded-full border border-[#3a6bb1] text-[#3a6bb1] font-medium hover:bg-[#eaf3fa] transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 rounded-full bg-[#3a6bb1] text-white font-medium hover:bg-[#2456a3] transition"
              >
                Register
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
