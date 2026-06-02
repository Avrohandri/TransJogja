"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { halteService, Halte } from "@/services/halteService";
import { calculateDistanceKm } from "@/utils/distance";

export default function DestinationSearchPage() {
    const router = useRouter();
    const [haltes, setHaltes] = useState<Halte[]>([]);
    const [fromHalte, setFromHalte] = useState<Halte | null>(null);
    const [toHalte, setToHalte] = useState<Halte | null>(null);
    const [search, setSearch] = useState("");
    const [focusField, setFocusField] = useState<"from" | "to">("to");

    useEffect(() => {
        halteService.getHaltesByRoute("RUTE_14").then(data => {
            setHaltes(data);
            
            // Auto-locate nearest halte (simulated)
            if (navigator.geolocation && data.length > 0) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    let minDistance = Infinity;
                    let nearest = data[0];
                    data.forEach(h => {
                        const dist = calculateDistanceKm(pos.coords.latitude, pos.coords.longitude, h.latitude, h.longitude);
                        if (dist < minDistance) {
                            minDistance = dist;
                            nearest = h;
                        }
                    });
                    setFromHalte(nearest);
                }, () => {
                    // Fallback to first halte
                    setFromHalte(data[0]);
                });
            } else if (data.length > 0) {
                setFromHalte(data[0]);
            }
        });
    }, []);

    const filteredHaltes = haltes.filter(h => h.namaHalte.toLowerCase().includes(search.toLowerCase()));

    const handleSelectHalte = (h: Halte) => {
        if (focusField === "from") {
            setFromHalte(h);
            setFocusField("to");
        } else {
            setToHalte(h);
            // Proceed to estimation
            if (fromHalte && h) {
                router.push(`/user/estimate?from=${fromHalte.halteId}&to=${h.halteId}`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-[#191c1e] flex flex-col">
            {/* Header */}
            <div className="bg-[#00342b] text-white px-4 py-4 flex flex-col pt-8">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/user" className="text-white hover:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </Link>
                    <h1 className="font-bold text-lg">Your Destination</h1>
                </div>

                <div className="bg-white rounded-xl p-3 shadow-lg flex flex-col gap-3 relative">
                    {/* Connecting line */}
                    <div className="absolute left-6 top-7 bottom-7 w-0.5 bg-[#e0e3e5] border-l-2 border-dotted border-[#bfc9c4]"></div>
                    
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-4 h-4 rounded-full border-[4px] border-[#006c49] bg-white flex-shrink-0"></div>
                        <div className="flex-1 bg-[#f2f4f6] rounded-lg px-3 py-2 flex items-center" onClick={() => setFocusField("from")}>
                            <input 
                                type="text"
                                value={fromHalte?.namaHalte || ""}
                                readOnly
                                placeholder="Pilih Halte Awal"
                                className={`bg-transparent outline-none w-full text-sm font-semibold ${focusField === 'from' ? 'text-[#006c49]' : 'text-[#191c1e]'}`}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-[#ba1a1a] flex-shrink-0 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                        <div className="flex-1 bg-[#f2f4f6] rounded-lg px-3 py-2 flex items-center" onClick={() => setFocusField("to")}>
                            <input 
                                type="text"
                                value={focusField === "to" ? search : (toHalte?.namaHalte || "")}
                                onChange={e => {
                                    if(focusField === "to") setSearch(e.target.value);
                                }}
                                placeholder="Cari Halte Tujuan..."
                                className={`bg-transparent outline-none w-full text-sm font-semibold ${focusField === 'to' ? 'text-[#ba1a1a]' : 'text-[#191c1e]'}`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 bg-[#f7f9fb] px-4 py-4 rounded-t-2xl -mt-4 z-20 overflow-y-auto">
                <div className="flex gap-4 border-b border-[#e0e3e5] mb-4">
                    <button className="pb-2 border-b-2 border-[#006c49] font-bold text-sm text-[#006c49]">Semua Halte (Rute 14)</button>
                    <button className="pb-2 font-semibold text-sm text-[#707975]">Tersimpan</button>
                </div>

                <div className="flex flex-col gap-1">
                    {filteredHaltes.map(h => (
                        <div 
                            key={h.halteId} 
                            onClick={() => handleSelectHalte(h)}
                            className="flex items-center gap-4 py-3 border-b border-[#e0e3e5] hover:bg-[#e0e3e5] cursor-pointer transition-colors px-2 rounded-lg"
                        >
                            <div className="w-8 h-8 rounded-full bg-[#006c49]/10 flex items-center justify-center text-[#006c49]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-[#191c1e]">{h.namaHalte}</p>
                                <p className="text-[10px] text-[#3f4945]">Urutan {h.urutan}</p>
                            </div>
                        </div>
                    ))}
                    {filteredHaltes.length === 0 && (
                        <p className="text-center text-[#707975] py-8 text-sm">Halte tidak ditemukan.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
