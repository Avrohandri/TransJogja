"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import Link from "next/link";
import { Cinzel } from "next/font/google";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["700", "900"] });

const TJIcon = ({ size = 36, color = "currentColor" }) => (
  <div
    className={`flex items-center justify-center font-black ${cinzel.className}`}
    style={{ width: size, height: size, color, fontSize: size * 0.6, lineHeight: 1, letterSpacing: "0.5px" }}
  >
    TJ
  </div>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// Satu SVG tunggal — menghindari remount saat toggle
const EyeIcon = ({ open }: { open: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Eye open */}
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" style={{ display: open ? "none" : "block" }} />
    <circle cx="12" cy="12" r="3" style={{ display: open ? "none" : "block" }} />
    {/* Eye off */}
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" style={{ display: open ? "block" : "none" }} />
    <line x1="1" y1="1" x2="23" y2="23" style={{ display: open ? "block" : "none" }} />
  </svg>
);

const colors = {
  primary: "#5C3A21",
  primaryHover: "#4A2E1A",
  accent: "#C59B6D",
  bgLight: "#FAF8F5",
  textDark: "#2D1E12",
  textMuted: "#8D7B68",
};

export default function LoginPage() {
  const [mode, setMode] = useState<"user" | "admin">("user");
  const [sliding, setSliding] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const switchMode = (next: "user" | "admin") => {
    if (next === mode || sliding) return;
    setSliding(true);
    setError("");
    setTimeout(() => {
      setMode(next);
      setSliding(false);
    }, 350);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const { user } = await authService.login(email, password);
      if (mode === "admin" && user.role !== "admin") {
        setError("Akun ini bukan akun admin.");
        setIsLoading(false);
        return;
      }
      if (user.role === "admin") router.push("/admin");
      else router.push("/user");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Email atau password salah.");
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = mode === "admin";
  const heroLeft = isAdmin ? "55%" : "0%";
  const formLeft = isAdmin ? "0%" : "45%";

  return (
    <>
      {/* ══════════════ MOBILE (< md) ══════════════ */}
      <div className="block md:hidden min-h-screen relative" style={{ backgroundColor: colors.bgLight }}>
        <div
          className="absolute inset-0 opacity-5 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: "url('/images/batik_bg.png')" }}
        />

        <div className="relative z-10 flex flex-col min-h-screen px-5 py-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2 mb-8 pt-4">
            <div className="p-2 border border-[#C59B6D] rounded-full bg-white shadow-sm">
              <TJIcon size={36} color={colors.primary} />
            </div>
            <span className="text-xl font-serif tracking-widest uppercase text-[#2D1E12]">Trans Jogja</span>
            <span className="text-xs tracking-[0.15em] text-[#8D7B68]">Warisan &amp; Transformasi</span>
          </div>

          {/* Mode toggle */}
          <div className="flex p-1 rounded-full mb-6 w-fit mx-auto border border-[#E6D5C3] bg-white shadow-sm">
            {(["user", "admin"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="px-5 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: mode === m ? colors.primary : "transparent",
                  color: mode === m ? "#fff" : colors.textMuted,
                }}
              >
                {m === "user" ? "Penumpang" : "Admin"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-serif text-[#2D1E12] mb-1">
              {isAdmin ? "Masuk Admin" : "Sugeng Rawuh"}
            </h1>
            <p className="text-sm font-light text-[#8D7B68]">
              {isAdmin ? "Kelola sistem Trans Jogja." : "Masuk ke akun Anda."}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg mb-4 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8D7B68]">
                <MailIcon />
              </div>
              <input
                id="mobile-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Surel (Email)"
                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-[#E6D5C3] rounded-xl outline-none focus:ring-1 focus:ring-[#5C3A21] focus:border-[#5C3A21] text-base text-[#2D1E12] placeholder:text-[#D1C7BD]"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8D7B68]">
                <LockIcon />
              </div>
              <input
                id="mobile-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata Sandi"
                className="block w-full pl-11 pr-12 py-3.5 bg-white border border-[#E6D5C3] rounded-xl outline-none focus:ring-1 focus:ring-[#5C3A21] focus:border-[#5C3A21] text-base text-[#2D1E12] placeholder:text-[#D1C7BD]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                onMouseDown={(e) => e.preventDefault()}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8D7B68]"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-xs font-medium hover:underline" style={{ color: colors.primary }}>
                Lupa Sandi?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-4 rounded-xl text-white font-medium text-base active:scale-[0.98] disabled:opacity-70 shadow-md"
              style={{ backgroundColor: colors.primary }}
            >
              <span>{isLoading ? "Memproses..." : "Masuk"}</span>
              {!isLoading && <ArrowIcon />}
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-[#E6D5C3] text-center">
            <p className="text-sm text-[#8D7B68]">
              Belum punya akun?{" "}
              <Link href="/register" className="font-semibold hover:underline" style={{ color: colors.primary }}>
                Daftar
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════ DESKTOP (≥ md) ══════════════ */}
      <div className="hidden md:block h-screen w-full overflow-hidden relative" style={{ backgroundColor: colors.bgLight }}>
        {/* Hero Panel */}
        <div
          className="absolute top-0 h-full w-[45%] flex flex-col justify-between p-12 overflow-hidden shadow-2xl"
          style={{
            left: heroLeft,
            backgroundColor: colors.primary,
            transition: "left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 10,
          }}
        >
          <div
            className="absolute inset-0 opacity-40 bg-cover bg-center mix-blend-overlay"
            style={{ backgroundImage: "url('/images/batik_bg.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="p-2 border border-[#C59B6D]/50 rounded-full bg-white/5 backdrop-blur-sm">
              <TJIcon size={32} color={colors.accent} />
            </div>
            <div>
              <span className="block text-2xl font-serif text-white tracking-widest uppercase">Trans Jogja</span>
              <span className="block text-xs font-light tracking-[0.2em] text-[#C59B6D]">Warisan &amp; Transformasi</span>
            </div>
          </div>

          <div
            className="relative z-10 mb-8"
            style={{
              opacity: sliding ? 0 : 1,
              transform: sliding ? "translateY(12px)" : "translateY(0)",
              transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
            }}
          >
            <h2 className="text-4xl lg:text-5xl font-serif leading-tight text-white mb-6">
              {isAdmin ? (<>Harmoni<br />Sistem Operasi.</>) : (<>Perjalanan Nyaman,<br />Budaya Terjaga.</>)}
            </h2>
            <p className="text-[#E6D5C3] font-light text-base leading-relaxed max-w-sm">
              {isAdmin
                ? "Kendali penuh atas operasional dan armada, disajikan dalam harmoni teknologi yang merangkul tradisi Jogja."
                : "Menghubungkan setiap sudut kota istimewa dengan layanan transportasi yang andal, aman, dan berbudaya."}
            </p>
          </div>
        </div>

        {/* Form Panel */}
        <div
          className="absolute top-0 h-full w-[55%] flex flex-col justify-center items-center px-10 overflow-y-auto"
          style={{
            left: formLeft,
            backgroundColor: colors.bgLight,
            transition: "left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 10,
          }}
        >
          <div
            className="w-full max-w-md py-10 relative"
            style={{
              opacity: sliding ? 0 : 1,
              transform: sliding ? "translateX(10px)" : "translateX(0)",
              transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
            }}
          >
            {/* Mode toggle */}
            <div className="flex p-1 rounded-full mb-12 w-fit mx-auto border border-[#E6D5C3] bg-white shadow-sm">
              {(["user", "admin"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className="px-6 py-2 rounded-full text-sm font-medium transition-all duration-300"
                  style={{
                    backgroundColor: mode === m ? colors.primary : "transparent",
                    color: mode === m ? "#fff" : colors.textMuted,
                    boxShadow: mode === m ? "0 2px 10px rgba(92, 58, 33, 0.2)" : "none",
                  }}
                >
                  {m === "user" ? "Penumpang" : "Abdi Dalem (Admin)"}
                </button>
              ))}
            </div>

            <div className="mb-10 text-center">
              <h1 className="text-3xl font-serif text-[#2D1E12] mb-3">
                {isAdmin ? "Sugeng Rawuh, Admin" : "Sugeng Rawuh"}
              </h1>
              <p className="text-[#8D7B68] font-light">
                {isAdmin
                  ? "Silakan masuk untuk mengelola sistem."
                  : "Masuk untuk melihat rute dan jadwal perjalanan Anda."}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-medium tracking-wider uppercase" style={{ color: colors.textDark }} htmlFor="desktop-email">
                  Surel (Email)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8D7B68] group-focus-within:text-[#5C3A21] transition-colors">
                    <MailIcon />
                  </div>
                  <input
                    id="desktop-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="block w-full pl-11 pr-4 py-3 bg-white border border-[#E6D5C3] rounded-lg text-[#2D1E12] focus:ring-1 focus:ring-[#5C3A21] focus:border-[#5C3A21] transition-all text-base shadow-sm placeholder:text-[#D1C7BD] outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="block text-xs font-medium tracking-wider uppercase" style={{ color: colors.textDark }} htmlFor="desktop-password">
                    Kata Sandi
                  </label>
                  <a href="#" className="text-xs font-medium hover:underline" style={{ color: colors.primary }}>
                    Lupa Sandi?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8D7B68] group-focus-within:text-[#5C3A21] transition-colors">
                    <LockIcon />
                  </div>
                  <input
                    id="desktop-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-12 py-3 bg-white border border-[#E6D5C3] rounded-lg text-[#2D1E12] focus:ring-1 focus:ring-[#5C3A21] focus:border-[#5C3A21] transition-all text-base shadow-sm placeholder:text-[#D1C7BD] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8D7B68] hover:text-[#5C3A21] transition-colors focus:outline-none"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-3 py-3.5 px-4 rounded-lg text-white font-medium text-base transition-all duration-300 active:scale-[0.98] mt-8 shadow-md hover:shadow-lg disabled:opacity-70"
                style={{ backgroundColor: colors.primary }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.primaryHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.primary)}
              >
                <span>{isLoading ? "Mlebet (Memproses)..." : isAdmin ? "Masuk Panel" : "Masuk"}</span>
                {!isLoading && <ArrowIcon />}
              </button>
            </form>

            <div className="mt-10 pt-6 border-t border-[#E6D5C3] text-center">
              <p className="text-[#8D7B68] text-sm">
                Belum memiliki akses?{" "}
                <Link href="/register" className="font-medium hover:underline" style={{ color: colors.primary }}>
                  Daftar Sekarang
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
