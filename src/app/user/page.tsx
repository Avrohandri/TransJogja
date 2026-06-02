"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

// Dynamically import map to avoid SSR issues
const UserMap = dynamic(() => import("@/components/user/UserMap"), { ssr: false });

export default function UserMainMapPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-screen w-full relative bg-[#f7f9fb] font-sans overflow-hidden">
      {/* Map Container */}
      <div className="absolute inset-0 z-0">
        {mounted && <UserMap />}
      </div>

      {/* Top Elements */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
        <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-md flex items-center gap-2 pointer-events-auto border border-[#e0e3e5]">
          <div className="w-2 h-2 rounded-full bg-[#6cf8bb] animate-pulse"></div>
          <span className="text-[10px] font-bold text-[#00342b]">Bus Data Received</span>
        </div>
        
        <Link href="/user/profile" className="bg-white p-2 rounded-full shadow-md text-[#00342b] hover:bg-[#f2f4f6] transition-colors pointer-events-auto border border-[#e0e3e5]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </Link>
      </div>

      {/* Bottom Floating Cards */}
      <div className="absolute bottom-6 left-4 right-4 z-10 flex flex-col gap-3 pointer-events-none">
        <Link href="/user/destination" className="bg-[#00342b] text-white p-4 rounded-xl shadow-lg flex items-center justify-between pointer-events-auto hover:bg-[#004d40] active:scale-[0.98] transition-all">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            </div>
            <div>
              <p className="font-bold text-sm">Your Destination</p>
              <p className="text-[11px] text-[#afefdd]">Where do you want to go?</p>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </Link>
        
        <Link href="/user/routes" className="bg-white text-[#191c1e] p-4 rounded-xl shadow-lg flex items-center justify-between pointer-events-auto border border-[#e0e3e5] hover:bg-[#f7f9fb] active:scale-[0.98] transition-all">
          <div className="flex items-center gap-3">
            <div className="bg-[#f2f4f6] p-2 rounded-lg text-[#006c49]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6"/><path d="M15 6v14"/><path d="M18 6h-6"/><path d="M12 20H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1"/><path d="M8 20v2"/></svg>
            </div>
            <div>
              <p className="font-bold text-sm text-[#00342b]">Route & Bus Stop</p>
              <p className="text-[11px] text-[#3f4945]">Explore lines and stations</p>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3f4945]"><path d="m9 18 6-6-6-6"/></svg>
        </Link>
      </div>
    </div>
  );
}
