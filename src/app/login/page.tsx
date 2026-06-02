"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import Link from "next/link";

const BusIcon = ({ size = 36, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

export default function LoginPage() {
  const [mode, setMode] = useState<"user" | "admin">("user");
  const [sliding, setSliding] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = authService.onAuthStateChanged((user) => {
      if (user) {
        if (user.role === "admin") router.push("/");
        else router.push("/user");
      }
    });
    return () => unsub();
  }, [router]);

  const switchMode = (next: "user" | "admin") => {
    if (next === mode || sliding) return;
    setSliding(true);
    setError("");
    setTimeout(() => {
      setMode(next);
      setSliding(false);
    }, 600);
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
      if (user.role === "admin") router.push("/");
      else router.push("/user");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Email atau password salah.");
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = mode === "admin";

  // Panel positions: hero slides left↔right, form slides opposite
  const heroLeft = isAdmin ? "55%" : "0%";
  const formLeft = isAdmin ? "0%" : "45%";

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f8fafa] relative">

      {/* ─── HERO PANEL (slides) ─── */}
      <div
        className="absolute top-0 h-full w-[45%] text-white flex flex-col justify-between p-10 overflow-hidden"
        style={{
          left: heroLeft,
          backgroundColor: "#00342b",
          backgroundImage: "radial-gradient(#004d40 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          transition: "left 0.65s cubic-bezier(0.77,0,0.175,1)",
          zIndex: 10,
        }}
      >
        {/* BG image */}
        <div className="absolute inset-0 opacity-30 bg-cover bg-center mix-blend-luminosity"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAroZIBC2__-yZ9Po3puf_TYQPMfjd1CHugJ3s7NiFQIO-4ZTSVPrkOp6FBQqD63KwSzx0QHk9-UtWfCKybsDVPEj0IXoBuXuamGCcR6sFZI-y-1KCIar4Md5dmN92w5Wd9_QcHleBnUDrDOIB2IQzw9B9NVh5Suyf91R2x_1g8-LWoUzE1inCWIVotZGfWoBnGJ7CvMng813uXiAM2pzKpYbQ6HwfO8nKZF3kGLeb4P3I21KHafJtcpWcrPPnfHZM_c4JTdJEgM14')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#00342b] via-[#00342b]/70 to-transparent" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <BusIcon size={36} color="#94d3c1" />
          <span className="text-2xl font-bold tracking-tight">Trans Jogja</span>
        </div>

        {/* Hero body */}
        <div className="relative z-10 mb-6"
          style={{ opacity: sliding ? 0 : 1, transform: sliding ? "translateY(12px)" : "translateY(0)", transition: "opacity 0.3s, transform 0.3s" }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-5">
            <span className="w-2 h-2 rounded-full bg-[#94d3c1] animate-pulse" />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-[#94d3c1]">
              {isAdmin ? "Administrator" : "Sistem Terintegrasi"}
            </span>
          </div>
          <h1 className="text-4xl font-bold leading-tight text-white mb-4">
            {isAdmin ? (<>Panel Kontrol<br />Administrator</>)
              : (<>Perjalanan Tepat,<br />Tanpa Hambatan.</>)}
          </h1>
          <p className="text-[#beebe7]/85 text-sm leading-relaxed max-w-xs">
            {isAdmin
              ? "Kelola data rute, armada bus, dan pantau seluruh operasional Trans Jogja dari satu dashboard terpusat."
              : "Akses rute real-time, jadwal akurat, dan pembelian tiket digital dalam satu platform yang andal."}
          </p>

          {isAdmin && (
            <ul className="mt-6 space-y-2.5">
              {["Manajemen rute & halte", "Monitor posisi bus real-time", "Laporan dan analitik data"].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-[#beebe7]">
                  <span className="w-5 h-5 flex-shrink-0 rounded-full bg-[#94d3c1]/20 border border-[#94d3c1]/40 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94d3c1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ─── FORM PANEL (slides) ─── */}
      <div
        className="absolute top-0 h-full w-[55%] bg-[#f8fafa] flex flex-col justify-center items-center px-10 overflow-y-auto"
        style={{
          left: formLeft,
          transition: "left 0.65s cubic-bezier(0.77,0,0.175,1)",
          zIndex: 10,
        }}
      >
        <div className="w-full max-w-md py-10"
          style={{ opacity: sliding ? 0 : 1, transform: sliding ? "translateX(10px)" : "translateX(0)", transition: "opacity 0.25s, transform 0.25s" }}>

          {/* Mode toggle */}
          <div className="flex p-1 bg-[#eceeee] rounded-xl mb-10 w-fit">
            {(["user", "admin"] as const).map((m) => (
              <button key={m} type="button" onClick={() => switchMode(m)}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                style={{
                  background: mode === m ? "#00342b" : "transparent",
                  color: mode === m ? "#fff" : "#3f4945",
                  boxShadow: mode === m ? "0 1px 4px rgba(0,52,43,0.25)" : "none",
                }}>
                {m === "user" ? "Pengguna" : "Admin"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#191c1d] mb-2">
              {isAdmin ? "Masuk sebagai Admin" : "Masuk ke Akun"}
            </h2>
            <p className="text-[#3f4945]">
              {isAdmin
                ? "Masukkan kredensial administrator Anda."
                : "Selamat datang kembali, silakan masuk untuk melanjutkan."}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] p-3 rounded-xl mb-5 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-[#3f4945]" htmlFor="email">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#707975] group-focus-within:text-[#00342b] transition-colors">
                  <MailIcon />
                </div>
                <input id="email" type="email" required autoComplete="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-[#bfc9c4] rounded-xl text-[#191c1d] focus:ring-2 focus:ring-[#00342b] focus:border-[#00342b] transition-all text-base shadow-sm hover:border-[#707975] placeholder:text-[#707975]/50 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-[#3f4945]" htmlFor="password">Kata Sandi</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#707975] group-focus-within:text-[#00342b] transition-colors">
                  <LockIcon />
                </div>
                <input id="password" type={showPassword ? "text" : "password"} required autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-12 py-3.5 bg-white border border-[#bfc9c4] rounded-xl text-[#191c1d] focus:ring-2 focus:ring-[#00342b] focus:border-[#00342b] transition-all text-base shadow-sm hover:border-[#707975] placeholder:text-[#707975]/50 outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#707975] hover:text-[#191c1d] transition-colors focus:outline-none" aria-label="Toggle password">
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              <div className="flex justify-end pt-1">
                <a href="#" className="text-sm font-semibold text-[#00342b] hover:text-[#004d40] transition-colors">Lupa Password?</a>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl text-white font-bold text-base transition-all duration-200 active:scale-[0.98] mt-6 disabled:opacity-60 shadow-sm hover:shadow-md"
              style={{ background: "#00342b" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#004d40")}
              onMouseLeave={e => (e.currentTarget.style.background = "#00342b")}>
              <span>{isLoading ? "Memproses..." : isAdmin ? "Masuk sebagai Admin" : "Masuk"}</span>
              {!isLoading && <ArrowIcon />}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-[#e1e3e3] text-center">
            <p className="text-[#3f4945]">
              Belum punya akun?{" "}
              <Link href="/register" className="font-bold text-[#00342b] hover:text-[#004d40] transition-colors">
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ─── MOBILE FALLBACK ─── */}
      <div className="md:hidden flex flex-col min-h-screen bg-[#f8fafa] px-6 py-10 justify-center">
        <div className="flex items-center gap-3 justify-center mb-8 text-[#00342b]">
          <BusIcon size={32} color="#00342b" />
          <span className="text-2xl font-bold tracking-tight">Trans Jogja</span>
        </div>
        <div className="flex p-1 bg-[#eceeee] rounded-xl mb-8 w-fit mx-auto">
          {(["user", "admin"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: mode === m ? "#00342b" : "transparent", color: mode === m ? "#fff" : "#3f4945" }}>
              {m === "user" ? "Pengguna" : "Admin"}
            </button>
          ))}
        </div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#191c1d] mb-1 text-center">{isAdmin ? "Masuk sebagai Admin" : "Masuk ke Akun"}</h2>
          <p className="text-sm text-[#3f4945] text-center">{isAdmin ? "Masukkan kredensial administrator Anda." : "Selamat datang kembali."}</p>
        </div>
        {error && <div className="bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] p-3 rounded-xl mb-4 text-sm text-center">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative"><div className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#707975]"><MailIcon /></div>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com"
              className="block w-full pl-11 pr-4 py-3.5 bg-white border border-[#bfc9c4] rounded-xl outline-none focus:ring-2 focus:ring-[#00342b] text-base" /></div>
          <div className="relative"><div className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#707975]"><LockIcon /></div>
            <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              className="block w-full pl-11 pr-12 py-3.5 bg-white border border-[#bfc9c4] rounded-xl outline-none focus:ring-2 focus:ring-[#00342b] text-base" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#707975]"><EyeIcon open={showPassword} /></button>
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-4 rounded-xl bg-[#00342b] text-white font-bold text-base active:scale-[0.98] disabled:opacity-60 mt-2">
            <span>{isLoading ? "Memproses..." : "Masuk"}</span>
            {!isLoading && <ArrowIcon />}
          </button>
        </form>
        <div className="mt-6 pt-5 border-t border-[#e1e3e3] text-center">
          <p className="text-sm text-[#3f4945]">Belum punya akun? <Link href="/register" className="font-bold text-[#00342b]">Daftar Sekarang</Link></p>
        </div>
      </div>
    </div>
  );
}
