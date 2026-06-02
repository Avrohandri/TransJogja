"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { routeService, Route } from "@/services/routeService";
import { halteService, Halte } from "@/services/halteService";

const UserMap = dynamic(() => import("@/components/user/UserMap"), { ssr: false });

export default function RouteDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const routeId = params.routeId as string;

    const [route, setRoute] = useState<Route | null>(null);
    const [haltes, setHaltes] = useState<Halte[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        routeService.getRoute(routeId).then(setRoute);
        halteService.getHaltesByRoute(routeId).then(setHaltes);
    }, [routeId]);

    if (!route) return <div className="min-h-screen bg-[#f7f9fb]"></div>;

    return (
        <div className="h-screen w-full relative bg-[#f7f9fb] font-sans overflow-hidden flex flex-col">
            {/* Map Area */}
            <div className="h-1/2 relative z-0">
                {mounted && <UserMap isDetail={true} />}
                
                <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
                    <button onClick={() => router.back()} className="bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center text-[#00342b] pointer-events-auto border border-[#e0e3e5]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button className="bg-[#00342b] text-white px-4 py-2 rounded-full shadow-md text-sm font-bold pointer-events-auto flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        Follow
                    </button>
                </div>
            </div>

            {/* Bottom Sheet Detail */}
            <div className="h-1/2 bg-white z-20 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] flex flex-col relative -mt-6 pt-2">
                <div className="w-12 h-1.5 bg-[#e0e3e5] rounded-full mx-auto mb-4"></div>
                
                <div className="px-6 flex-1 overflow-y-auto pb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-[#00342b]">{route.routeName}</h2>
                            <p className="text-sm font-semibold text-[#3f4945]">{route.startPoint} ⇄ {route.endPoint}</p>
                        </div>
                        <div className="bg-[#e0e3e5] px-2 py-1 rounded text-xs font-bold text-[#3f4945] uppercase tracking-wider">
                            {route.status}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-[#f7f9fb] p-3 rounded-xl border border-[#e0e3e5]">
                            <p className="text-[10px] text-[#707975] font-semibold uppercase mb-1">Operating Hours</p>
                            <p className="text-sm font-bold text-[#191c1e]">{route.operatingHours}</p>
                            <p className="text-xs text-[#3f4945]">{route.operatingDays}</p>
                        </div>
                        <div className="bg-[#f7f9fb] p-3 rounded-xl border border-[#e0e3e5]">
                            <p className="text-[10px] text-[#707975] font-semibold uppercase mb-1">Fare & Stops</p>
                            <p className="text-sm font-bold text-[#006c49]">Rp {route.fare.toLocaleString()}</p>
                            <p className="text-xs text-[#3f4945]">{haltes.length} Halte</p>
                        </div>
                    </div>

                    <h3 className="font-bold text-[#191c1e] mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#006c49]"><circle cx="12" cy="10" r="3"/><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/></svg>
                        Daftar Halte Berurutan
                    </h3>
                    
                    <div className="flex flex-col relative pl-4 ml-2 border-l-2 border-dashed border-[#bfc9c4]">
                        {haltes.map((h, i) => (
                            <div key={h.halteId} className="relative pb-5">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-white border-2 border-[#006c49]"></div>
                                <p className="text-sm font-semibold text-[#191c1e] leading-none">{h.namaHalte}</p>
                                {i === 0 && <span className="text-[10px] text-[#006c49] font-bold bg-[#6cf8bb]/30 px-1.5 rounded ml-2">AWAL</span>}
                                {i === haltes.length - 1 && <span className="text-[10px] text-[#ba1a1a] font-bold bg-[#ffdad6]/50 px-1.5 rounded ml-2">AKHIR</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
