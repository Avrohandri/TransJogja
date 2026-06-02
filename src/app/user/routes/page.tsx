"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { halteService, Halte } from "@/services/halteService";
import { demandService } from "@/services/demandService";

export default function RoutesPage() {
    const router = useRouter();
    const [tab, setTab] = useState<"route" | "bus_stop">("route");
    const [search, setSearch] = useState("");
    const [haltes, setHaltes] = useState<Halte[]>([]);
    const [demandData, setDemandData] = useState<number[]>([]);

    useEffect(() => {
        halteService.getHaltesByRoute("RUTE_14").then(setHaltes);
        const today = new Date();
        demandService.getDemandByMonth(today.getMonth() + 1, today.getFullYear()).then(setDemandData);
    }, []);

    const filteredHaltes = haltes.filter(h => h.namaHalte.toLowerCase().includes(search.toLowerCase()));

    const getDemandColor = (val: number) => {
        if (val > 30) return "bg-[#ba1a1a]";
        if (val > 15) return "bg-[#ffcc00]";
        if (val > 0) return "bg-[#006c49]";
        return "bg-[#e0e3e5]";
    };

    return (
        <div className="min-h-screen bg-[#f7f9fb] font-sans text-[#191c1e] flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex flex-col border-b border-[#e0e3e5] pt-8">
                <div className="flex items-center gap-3 mb-4">
                    <Link href="/user" className="text-[#3f4945] hover:text-[#00342b]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </Link>
                    <h1 className="font-bold text-lg text-[#00342b]">Route & Bus Stop</h1>
                </div>

                <div className="flex bg-[#f2f4f6] rounded-lg p-1">
                    <button 
                        onClick={() => setTab("route")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${tab === 'route' ? 'bg-white shadow-sm text-[#00342b]' : 'text-[#707975]'}`}
                    >
                        ROUTE
                    </button>
                    <button 
                        onClick={() => setTab("bus_stop")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${tab === 'bus_stop' ? 'bg-white shadow-sm text-[#00342b]' : 'text-[#707975]'}`}
                    >
                        BUS STOP
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 py-4 overflow-y-auto">
                {tab === "route" ? (
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#707975] w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            <input 
                                type="text"
                                placeholder="Cari rute..."
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#e0e3e5] rounded-lg text-sm outline-none focus:border-[#006c49]"
                            />
                        </div>

                        <Link href="/user/routes/RUTE_14" className="bg-white border border-[#e0e3e5] p-4 rounded-xl flex items-center justify-between hover:bg-[#f2f4f6] transition-colors mt-2 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#00342b] text-white font-bold text-lg px-3 py-1.5 rounded-lg shadow-sm">14</div>
                                <div>
                                    <p className="font-bold text-[#191c1e] text-sm">Rute 14</p>
                                    <p className="text-[11px] text-[#3f4945]">Bandara Adisucipto ⇄ Terminal Pakem</p>
                                </div>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3f4945]"><path d="m9 18 6-6-6-6"/></svg>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#707975] w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            <input 
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Cari halte..."
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#e0e3e5] rounded-lg text-sm outline-none focus:border-[#006c49]"
                            />
                        </div>

                        <div className="bg-white rounded-xl border border-[#e0e3e5] mt-2 shadow-sm overflow-hidden flex flex-col">
                            {filteredHaltes.map((h, idx) => (
                                <div key={h.halteId} className="flex items-center justify-between p-3 border-b border-[#e0e3e5] last:border-0 hover:bg-[#f7f9fb] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[10px] font-bold text-[#006c49]">
                                            {h.urutan}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-[#191c1e]">{h.namaHalte}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${getDemandColor(demandData[idx] || 0)}`}></div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#707975]"><path d="m9 18 6-6-6-6"/></svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
