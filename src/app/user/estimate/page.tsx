"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { halteService, Halte } from "@/services/halteService";
import { busLocationService, BusLocation } from "@/services/busLocationService";
import { calculateDistanceKm, calculateETA } from "@/utils/distance";

export default function RouteEstimationPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const fromId = searchParams.get("from");
    const toId = searchParams.get("to");

    const [fromHalte, setFromHalte] = useState<Halte | null>(null);
    const [toHalte, setToHalte] = useState<Halte | null>(null);
    const [buses, setBuses] = useState<BusLocation[]>([]);
    
    useEffect(() => {
        if (!fromId || !toId) {
            router.push("/user/destination");
            return;
        }

        halteService.getHaltesByRoute("RUTE_14").then(data => {
            setFromHalte(data.find(h => h.halteId === fromId) || null);
            setToHalte(data.find(h => h.halteId === toId) || null);
        });

        const unsub = busLocationService.subscribeLiveBuses("RUTE_14", setBuses);
        return () => unsub();
    }, [fromId, toId, router]);

    if (!fromHalte || !toHalte) return <div className="min-h-screen bg-[#f7f9fb] flex justify-center items-center">Memuat...</div>;

    // Calculate estimations
    const distanceTrip = calculateDistanceKm(fromHalte.latitude, fromHalte.longitude, toHalte.latitude, toHalte.longitude);
    const tripEta = calculateETA(distanceTrip, 25);

    // Find nearest bus to fromHalte
    let nearestBus: BusLocation | null = null;
    let busEta = 0;

    if (buses.length > 0) {
        let minBusDist = Infinity;
        buses.forEach(b => {
            const d = calculateDistanceKm(b.latitude, b.longitude, fromHalte.latitude, fromHalte.longitude);
            if (d < minBusDist) {
                minBusDist = d;
                nearestBus = b;
            }
        });
        busEta = calculateETA(minBusDist, nearestBus?.speed || 25);
    }

    return (
        <div className="min-h-screen bg-[#f7f9fb] font-sans text-[#191c1e] flex flex-col">
            {/* Header */}
            <div className="bg-[#00342b] text-white px-4 py-4 flex flex-col pt-8">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => router.back()} className="text-white hover:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <h1 className="font-bold text-lg">Estimasi Perjalanan</h1>
                </div>

                <div className="bg-[#004d40] rounded-xl p-4 flex flex-col gap-4 relative shadow-inner">
                    <div className="absolute left-7 top-8 bottom-8 w-0.5 bg-[#94d3c1] border-l-2 border-dotted border-[#94d3c1]"></div>
                    
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-5 h-5 rounded-full border-[5px] border-[#6cf8bb] bg-[#004d40] flex-shrink-0 mt-0.5"></div>
                        <div className="flex-1">
                            <p className="text-[10px] text-[#94d3c1] font-medium">Dari</p>
                            <p className="font-bold text-sm">{fromHalte.namaHalte}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-5 h-5 rounded-full bg-[#ffdad6] flex-shrink-0 flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-[#ba1a1a] rounded-full"></div>
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-[#94d3c1] font-medium">Tujuan</p>
                            <p className="font-bold text-sm">{toHalte.namaHalte}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Available Routes */}
            <div className="flex-1 px-4 py-6">
                <h3 className="font-bold text-[#3f4945] mb-4">Available Routes</h3>
                
                {buses.length === 0 ? (
                    <div className="bg-white rounded-xl p-6 text-center border border-[#e0e3e5] shadow-sm">
                        <div className="w-12 h-12 bg-[#f2f4f6] rounded-full flex items-center justify-center mx-auto mb-3 text-[#707975]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6"/><path d="M15 6v14"/><path d="M18 6h-6"/><path d="M12 20H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1"/><path d="M8 20v2"/></svg>
                        </div>
                        <p className="text-sm font-semibold text-[#191c1e]">Belum ada bus aktif pada Rute 14.</p>
                        <p className="text-xs text-[#707975] mt-1">Silakan cek kembali beberapa saat lagi.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-4 border border-[#006c49] shadow-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-[#006c49] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                            Direkomendasikan
                        </div>
                        
                        <div className="flex items-center gap-3 mb-4 mt-2">
                            <div className="bg-[#00342b] text-white font-bold text-lg px-3 py-1 rounded-lg">14</div>
                            <div>
                                <p className="font-bold text-[#191c1e]">Rute 14</p>
                                <p className="text-[11px] text-[#3f4945]">Bandara Adisucipto ⇄ Terminal Pakem</p>
                            </div>
                        </div>

                        <div className="bg-[#f7f9fb] rounded-lg p-3 flex flex-col gap-2 mb-4 border border-[#e0e3e5]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[#707975]">Bus tiba sekitar</span>
                                <span className="font-bold text-sm text-[#ba1a1a]">{busEta} menit</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[#707975]">Estimasi perjalanan</span>
                                <span className="font-bold text-sm text-[#006c49]">{tripEta} menit</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[#707975]">Jarak rute</span>
                                <span className="font-bold text-sm text-[#191c1e]">{distanceTrip.toFixed(1)} km</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-[#006c49] justify-center pt-2 border-t border-[#e0e3e5]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/><path d="M16 11v-2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2"/><path d="M8 11v6"/><path d="M16 11v6"/><path d="M10 22v-5h4v5"/></svg>
                            <span className="text-xs text-[#707975]">...</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6"/><path d="M15 6v14"/><path d="M18 6h-6"/><path d="M12 20H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1"/><path d="M8 20v2"/></svg>
                            <span className="text-xs text-[#707975]">...</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/><path d="M16 11v-2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2"/><path d="M8 11v6"/><path d="M16 11v6"/><path d="M10 22v-5h4v5"/></svg>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
