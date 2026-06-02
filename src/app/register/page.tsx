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
    <div className="min-h-screen flex flex-col justify-center items-center text-[#191c1e] bg-[#f7f9fb] py-8"
         style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(0, 52, 43, 0.03) 2px, transparent 2px), radial-gradient(circle at 0% 100%, rgba(0, 52, 43, 0.03) 2px, transparent 2px)", backgroundSize: "40px 40px" }}>
      
      <main className="w-full max-w-[480px] px-4 md:px-0 z-10">
        <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,77,64,0.05)] border border-[#bfc9c4]/30 overflow-hidden relative">
          
          {/* Card Header */}
          <div className="p-6 border-b border-[#e0e3e5] flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00342b]/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="w-16 h-16 bg-[#00342b] rounded-full flex items-center justify-center mb-4 text-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>
            </div>
            <h1 className="text-2xl font-semibold text-[#00342b] mb-1">Trans Jogja</h1>
            <h2 className="text-xl font-semibold text-[#3f4945]">Buat Akun Penumpang</h2>
            <p className="text-sm text-[#707975] mt-2">Daftar untuk merencanakan perjalanan Anda dengan mudah.</p>
          </div>

          {/* Card Body */}
          <div className="p-6">
            {error && <div className="bg-[#ba1a1a]/10 text-[#ba1a1a] p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}
            
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#191c1e] mb-1">Nama Lengkap</label>
                <input 
                  type="text" required
                  value={fullname} onChange={e => setFullname(e.target.value)}
                  className="w-full px-4 py-3 rounded border border-[#bfc9c4] focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] outline-none text-sm text-[#191c1e]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#191c1e] mb-1">Email</label>
                <input 
                  type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded border border-[#bfc9c4] focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] outline-none text-sm text-[#191c1e]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#191c1e] mb-1">Nomor Telepon</label>
                <input 
                  type="tel" required
                  value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded border border-[#bfc9c4] focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] outline-none text-sm text-[#191c1e]"
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-[#191c1e] mb-1">Kata Sandi</label>
                <input 
                  type={showPassword ? "text" : "password"} required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded border border-[#bfc9c4] focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] outline-none text-sm text-[#191c1e]"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[28px] text-[#707975] hover:text-[#191c1e]">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
              </div>

              <div className="flex items-start gap-3 mt-2">
                <div className="flex items-center h-5">
                  <input type="checkbox" required className="w-4 h-4 rounded border-[#bfc9c4] text-[#00342b] focus:ring-[#00342b] cursor-pointer" />
                </div>
                <div className="text-sm">
                  <label className="text-sm text-[#3f4945] cursor-pointer">
                    Saya menyetujui <a className="text-[#006c49] hover:underline font-semibold" href="#">Syarat & Ketentuan</a> serta <a className="text-[#006c49] hover:underline font-semibold" href="#">Kebijakan Privasi</a> Trans Jogja.
                  </label>
                </div>
              </div>

              <button disabled={isLoading} type="submit" className="mt-4 w-full bg-[#00342b] hover:bg-[#004d40] text-white text-xs font-semibold py-3 px-4 rounded transition-colors shadow-sm active:scale-[0.98] flex justify-center items-center gap-2">
                {isLoading ? "Mendaftar..." : "Daftar"}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </form>
          </div>

          {/* Card Footer */}
          <div className="p-4 bg-[#f2f4f6] border-t border-[#e0e3e5] text-center">
            <p className="text-sm text-[#3f4945]">
              Sudah punya akun? 
              <Link href="/login" className="text-[#006c49] font-semibold hover:underline ml-1">Masuk di sini</Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-sm text-[#707975]">
            © 2024 Trans Jogja Management System.<br/>Inspired by Yogyakarta Heritage.
          </p>
        </footer>
      </main>
    </div>
  );
}
