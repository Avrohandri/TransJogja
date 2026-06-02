"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import Link from "next/link";

export default function RegisterPage() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await authService.register(email, password, fullname, phone);
      alert("Pendaftaran berhasil! Silakan nikmati layanan kami.");
      router.push("/user");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mendaftar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#f8fafa] text-[#191c1d] antialiased">

      {/* ── LEFT HERO PANEL ── */}
      <div className="hidden md:flex flex-col w-[45%] lg:w-1/2 h-screen sticky top-0 relative overflow-hidden bg-[#00342b] text-white justify-between p-10"
        style={{ backgroundImage: "radial-gradient(#004d40 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
        {/* Background image overlay */}
        <div className="absolute inset-0 z-0 opacity-40 bg-cover bg-center mix-blend-luminosity"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAroZIBC2__-yZ9Po3puf_TYQPMfjd1CHugJ3s7NiFQIO-4ZTSVPrkOp6FBQqD63KwSzx0QHk9-UtWfCKybsDVPEj0IXoBuXuamGCcR6sFZI-y-1KCIar4Md5dmN92w5Wd9_QcHleBnUDrDOIB2IQzw9B9NVh5Suyf91R2x_1g8-LWoUzE1inCWIVotZGfWoBnGJ7CvMng813uXiAM2pzKpYbQ6HwfO8nKZF3kGLeb4P3I21KHafJtcpWcrPPnfHZM_c4JTdJEgM14')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#00342b] via-[#00342b]/80 to-transparent z-0" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="#94d3c1">
            <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
          </svg>
          <span className="text-3xl font-bold tracking-tight">Trans Jogja</span>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 max-w-lg mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[#94d3c1] animate-pulse" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#94d3c1]">Bergabung Sekarang</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight text-white mb-4">
            Mulai Perjalanan<br />Pertamamu.
          </h1>
          <p className="text-base text-[#beebe7]/90 max-w-md leading-relaxed">
            Buat akun gratis dan nikmati kemudahan transportasi publik Trans Jogja langsung dari genggamanmu.
          </p>

          {/* Feature list */}
          <ul className="mt-8 space-y-3">
            {[
              "Pantau posisi bus secara real-time",
              "Estimasi kedatangan yang akurat",
              "Informasi rute lengkap & jadwal terkini",
            ].map((feat) => (
              <li key={feat} className="flex items-center gap-3 text-sm text-[#beebe7]">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#94d3c1]/20 border border-[#94d3c1]/40 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94d3c1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                {feat}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="w-full md:w-[55%] lg:w-1/2 min-h-screen bg-[#f8fafa] flex flex-col justify-center items-center px-6 md:px-10 py-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-3 justify-center mb-10 text-[#00342b]">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
            </svg>
            <span className="text-2xl font-bold tracking-tight">Trans Jogja</span>
          </div>

          {/* Heading */}
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-[#191c1d] mb-2">Buat Akun Baru</h2>
            <p className="text-base text-[#3f4945]">Isi data di bawah ini untuk memulai perjalanan Anda.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] p-3 rounded-xl mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">

            {/* Fullname */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#3f4945]" htmlFor="fullname">Nama Lengkap</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#707975] group-focus-within:text-[#00342b] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <input
                  id="fullname" type="text" required
                  value={fullname} onChange={e => setFullname(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-[#bfc9c4] rounded-xl text-[#191c1d] focus:ring-2 focus:ring-[#00342b] focus:border-[#00342b] transition-all duration-200 text-base shadow-sm hover:border-[#707975] placeholder:text-[#707975]/60 outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#3f4945]" htmlFor="email">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#707975] group-focus-within:text-[#00342b] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <input
                  id="email" type="email" required autoComplete="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-[#bfc9c4] rounded-xl text-[#191c1d] focus:ring-2 focus:ring-[#00342b] focus:border-[#00342b] transition-all duration-200 text-base shadow-sm hover:border-[#707975] placeholder:text-[#707975]/60 outline-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#3f4945]" htmlFor="phone">Nomor Telepon</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#707975] group-focus-within:text-[#00342b] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.36h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.64 16.91z"/>
                  </svg>
                </div>
                <input
                  id="phone" type="tel" required
                  value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="08xx-xxxx-xxxx"
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-[#bfc9c4] rounded-xl text-[#191c1d] focus:ring-2 focus:ring-[#00342b] focus:border-[#00342b] transition-all duration-200 text-base shadow-sm hover:border-[#707975] placeholder:text-[#707975]/60 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#3f4945]" htmlFor="password">Kata Sandi</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#707975] group-focus-within:text-[#00342b] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  id="password" type={showPassword ? "text" : "password"} required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  className="block w-full pl-11 pr-12 py-3.5 bg-white border border-[#bfc9c4] rounded-xl text-[#191c1d] focus:ring-2 focus:ring-[#00342b] focus:border-[#00342b] transition-all duration-200 text-base shadow-sm hover:border-[#707975] placeholder:text-[#707975]/60 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#707975] hover:text-[#191c1d] transition-colors focus:outline-none"
                  aria-label="Toggle password visibility">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3 pt-1">
              <input
                id="agree" type="checkbox" required
                checked={agreed} onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#bfc9c4] text-[#00342b] focus:ring-[#00342b] cursor-pointer accent-[#00342b]"
              />
              <label htmlFor="agree" className="text-sm text-[#3f4945] cursor-pointer leading-relaxed">
                Saya menyetujui{" "}
                <a href="#" className="text-[#00342b] hover:text-[#004d40] font-semibold underline underline-offset-2">Syarat & Ketentuan</a>
                {" "}serta{" "}
                <a href="#" className="text-[#00342b] hover:text-[#004d40] font-semibold underline underline-offset-2">Kebijakan Privasi</a>
                {" "}Trans Jogja.
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !agreed}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl shadow-sm text-white bg-[#00342b] hover:bg-[#004d40] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00342b] text-base font-bold transition-all duration-200 active:scale-[0.98] mt-4 disabled:opacity-60 disabled:cursor-not-allowed">
              <span>{isLoading ? "Mendaftar..." : "Buat Akun"}</span>
              {!isLoading && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-[#e1e3e3] text-center">
            <p className="text-base text-[#3f4945]">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-base font-bold text-[#00342b] hover:text-[#004d40] transition-colors ml-1">
                Masuk di Sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
