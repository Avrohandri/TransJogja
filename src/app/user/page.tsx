"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

// Dynamically import map to avoid SSR issues
const UserMap = dynamic(() => import("@/components/user/UserMap"), { ssr: false });

export default function UserMainMapPage() {
  const [mounted, setMounted] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-screen w-full relative bg-[#FAF8F5] font-sans overflow-hidden">
      {/* Map Container */}
      <div className="absolute inset-0 z-0">
        {mounted && <UserMap />}
      </div>

      {/* Top Elements */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
        <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-md flex items-center gap-2 pointer-events-auto border border-[#E6D5C3]">
          <div className="w-2 h-2 rounded-full bg-[#C59B6D] animate-pulse"></div>
          <span className="text-[10px] font-bold text-[#5C3A21]">Data Bus Diterima</span>
        </div>
        
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Notification Button */}
          <div className="relative">
            <button 
              onClick={() => setShowNotif(!showNotif)}
              className="bg-white p-2 rounded-full shadow-md text-[#5C3A21] hover:bg-[#F2EAE1] transition-colors border border-[#E6D5C3] relative"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              {/* Red dot indicator */}
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#A73A3A] rounded-full border border-white"></span>
            </button>
            
            {/* Notification Dropdown */}
            {showNotif && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E6D5C3] overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                <div className="px-4 py-3 border-b border-[#E6D5C3] flex items-center justify-between bg-[#FAF8F5]">
                  <h3 className="font-serif font-bold text-[#5C3A21] text-sm">Pemberitahuan</h3>
                  <span className="text-[10px] font-bold bg-[#C59B6D] text-white px-2 py-0.5 rounded-full">2 Baru</span>
                </div>
                <div className="flex flex-col max-h-60 overflow-y-auto">
                  <div className="p-3 border-b border-[#E6D5C3] bg-white hover:bg-[#F2EAE1] transition-colors cursor-pointer flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E6D5C3] flex items-center justify-center flex-shrink-0">🚌</div>
                    <div>
                      <p className="text-xs font-bold text-[#2D1E12]">Pembaruan Data Rute 14</p>
                      <p className="text-[10px] text-[#8D7B68] mt-0.5">Informasi jadwal armada telah diperbarui hari ini.</p>
                      <p className="text-[9px] text-[#C59B6D] mt-1 font-bold">Baru saja</p>
                    </div>
                  </div>
                  <div className="p-3 border-b border-[#E6D5C3] bg-white hover:bg-[#F2EAE1] transition-colors cursor-pointer flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E6D5C3] flex items-center justify-center flex-shrink-0">🎟️</div>
                    <div>
                      <p className="text-xs font-bold text-[#2D1E12]">Diskon Pelajar Aktif</p>
                      <p className="text-[10px] text-[#8D7B68] mt-0.5">Anda bisa menggunakan tarif pelajar Rp500.</p>
                      <p className="text-[9px] text-[#C59B6D] mt-1 font-bold">2 jam yang lalu</p>
                    </div>
                  </div>
                </div>
                <div className="p-2 text-center border-t border-[#E6D5C3] bg-[#FAF8F5]">
                  <button className="text-[10px] font-bold text-[#5C3A21] hover:underline">Tandai semua dibaca</button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Button */}
          <Link href="/user/profile" className="bg-white p-2 rounded-full shadow-md text-[#5C3A21] hover:bg-[#F2EAE1] transition-colors border border-[#E6D5C3]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </Link>
        </div>
      </div>

      {/* Bottom Floating Cards */}
      <div className="absolute bottom-6 left-4 right-4 z-10 flex flex-col gap-3 pointer-events-none">
        <Link href="/user/destination" className="bg-[#5C3A21] text-white p-4 rounded-xl shadow-lg flex items-center justify-between pointer-events-auto hover:bg-[#4A2E1A] active:scale-[0.98] transition-all relative overflow-hidden">
          {/* Subtle batik overlay */}
          <div className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('/images/batik_bg.png')" }}></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            </div>
            <div>
              <p className="font-serif font-bold text-sm tracking-wide">Tujuan Anda</p>
              <p className="text-[11px] text-[#E6D5C3] font-light">Ke mana Anda ingin pergi hari ini?</p>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10"><path d="m9 18 6-6-6-6"/></svg>
        </Link>
        
        <Link href="/user/routes/RUTE_14" className="bg-white text-[#2D1E12] p-4 rounded-xl shadow-lg flex items-center justify-between pointer-events-auto border border-[#E6D5C3] hover:bg-[#FAF8F5] active:scale-[0.98] transition-all">
          <div className="flex items-center gap-3">
            <div className="bg-[#F2EAE1] p-2 rounded-lg text-[#5C3A21] border border-[#E6D5C3]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6"/><path d="M15 6v14"/><path d="M18 6h-6"/><path d="M12 20H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1"/><path d="M8 20v2"/></svg>
            </div>
            <div>
              <p className="font-serif font-bold text-sm text-[#5C3A21] tracking-wide">Rute & Halte</p>
              <p className="text-[11px] text-[#8D7B68] font-light">Jelajahi jalur dan titik pemberhentian</p>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8D7B68]"><path d="m9 18 6-6-6-6"/></svg>
        </Link>
      </div>
    </div>
  );
}
