"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [roleMode, setRoleMode] = useState<"user"|"admin">("user");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      if (user) {
        if (user.role === 'admin') router.push("/");
        else router.push("/user");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const { user } = await authService.login(email, password);
      if (user.role === 'admin') {
         router.push("/");
      } else {
         router.push("/user");
      }
    } catch (err: any) {
      setError(err.message || "Gagal login");
    }
  };

  return (
    <div className="bg-[#f7f9fb] min-h-screen flex items-center justify-center p-4 relative overflow-hidden" 
         style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(0, 52, 43, 0.05) 1px, transparent 0)", backgroundSize: "24px 24px" }}>
      {/* Ambient Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#00342b] opacity-5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#006c49] opacity-5 rounded-full blur-3xl pointer-events-none"></div>
      
      <main className="w-full max-w-md bg-white rounded-xl border border-[#e0e3e5] p-6 relative z-10" style={{ boxShadow: "0px 4px 20px rgba(0, 77, 64, 0.05)" }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f2f4f6] text-[#00342b] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#191c1e] mb-2">Selamat Datang Kembali</h1>
          <p className="text-sm text-[#3f4945]">Trans Jogja Management System</p>
        </div>

        {/* Role Toggle */}
        <div className="flex p-1 bg-[#f2f4f6] rounded-lg mb-6">
          <button 
            type="button"
            onClick={() => setRoleMode("user")}
            className={`flex-1 py-2 px-4 rounded-md text-xs font-semibold text-center transition-all ${roleMode === 'user' ? 'bg-white shadow-sm text-[#00342b]' : 'text-[#3f4945] hover:text-[#00342b]'}`}>
            User
          </button>
          <button 
            type="button"
            onClick={() => setRoleMode("admin")}
            className={`flex-1 py-2 px-4 rounded-md text-xs font-semibold text-center transition-all ${roleMode === 'admin' ? 'bg-white shadow-sm text-[#00342b]' : 'text-[#3f4945] hover:text-[#00342b]'}`}>
            Admin
          </button>
        </div>

        {error && (
          <div className="bg-[#ba1a1a]/10 text-[#ba1a1a] p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-[#191c1e] mb-2" htmlFor="email">Email / Username</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#707975] w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <input 
                id="email" 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Masukkan email" 
                className="w-full pl-10 pr-4 py-3 bg-[#f7f9fb] rounded-lg border border-[#bfc9c4] focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] outline-none transition-colors text-sm text-[#191c1e] placeholder-[#707975]" 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#191c1e] mb-2" htmlFor="password">Password</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#707975] w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <input 
                id="password" 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password" 
                className="w-full pl-10 pr-4 py-3 bg-[#f7f9fb] rounded-lg border border-[#bfc9c4] focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] outline-none transition-colors text-sm text-[#191c1e] placeholder-[#707975]" 
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="rounded border-[#bfc9c4] text-[#00342b] focus:ring-[#00342b] w-4 h-4 bg-[#f7f9fb]" />
              <span className="text-sm text-[#3f4945]">Remember Me</span>
            </label>
            <a href="#" className="text-xs text-[#006c49] hover:underline font-semibold transition-all">Forgot Password?</a>
          </div>
          <button type="submit" className="w-full py-3 px-4 bg-[#00342b] text-white font-semibold text-lg rounded-lg hover:bg-[#004d40] active:scale-[0.98] transition-all flex items-center justify-center space-x-2">
            <span>Masuk {roleMode === 'admin' ? 'sebagai Admin' : ''}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </form>

        {/* Footer Notes */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-[#3f4945]">
            Belum punya akun? <Link href="/register" className="text-[#006c49] font-semibold hover:underline transition-all">Daftar sekarang</Link>
          </p>
          <div className="pt-4 border-t border-[#e0e3e5]">
            <p className="text-xs text-[#707975] flex items-center justify-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Akses admin dikelola oleh pengembang
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
