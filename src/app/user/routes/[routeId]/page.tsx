"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { routeService, Route } from "@/services/routeService";
import { halteService, Halte } from "@/services/halteService";
import type { SegmentData } from "@/components/user/UserSegmentMap";

const UserMap = dynamic(() => import("@/components/user/UserMap"), { ssr: false });
const UserSegmentMap = dynamic(() => import("@/components/user/UserSegmentMap"), { ssr: false });

export default function RouteDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const routeId = params.routeId as string;

    const [route, setRoute] = useState<Route | null>(null);
    const [haltes, setHaltes] = useState<Halte[]>([]);
    const [mounted, setMounted] = useState(false);
    const [selectedSegmentIdx, setSelectedSegmentIdx] = useState<number | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        setMounted(true);
        routeService.getRoute(routeId).then(setRoute);
        halteService.getHaltesByRoute(routeId).then(setHaltes);
    }, [routeId]);

    // Build segment list from consecutive halte pairs
    const segments: SegmentData[] = useMemo(() => {
        if (haltes.length < 2) return [];
        return haltes.slice(0, -1).map((h, i) => ({
            fromName: h.namaHalte,
            toName: haltes[i + 1].namaHalte,
            fromCoord: [h.latitude, h.longitude] as [number, number],
            toCoord: [haltes[i + 1].latitude, haltes[i + 1].longitude] as [number, number],
        }));
    }, [haltes]);

    // Filter segments based on search query
    const filteredSegments = useMemo(() => {
        if (!search.trim()) return segments.map((seg, idx) => ({ seg, originalIdx: idx }));
        const q = search.toLowerCase();
        return segments
            .map((seg, idx) => ({ seg, originalIdx: idx }))
            .filter(({ seg }) =>
                seg.fromName.toLowerCase().includes(q) ||
                seg.toName.toLowerCase().includes(q)
            );
    }, [segments, search]);

    const activeSegment = selectedSegmentIdx !== null ? segments[selectedSegmentIdx] : null;

    // Show full route (Route 14 button clicked)
    const handleShowFullRoute = () => {
        setSelectedSegmentIdx(null);
    };

    // Select a specific segment
    const handleSelectSegment = (idx: number) => {
        setSelectedSegmentIdx(idx);
    };

    if (!route) {
        return (
            <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-[#5C3A21] border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen w-full relative bg-[#FAF8F5] font-sans overflow-hidden flex flex-col">
            {/* Map Area */}
            <div className="h-[45%] relative z-0">
                {mounted && (
                    selectedSegmentIdx !== null
                        ? <UserSegmentMap segment={activeSegment} />
                        : <UserMap isDetail={true} />
                )}

                {/* Top overlay: back + follow */}
                <div className="absolute top-4 left-4 right-4 z-10 flex justify-start items-center pointer-events-none">
                    <button onClick={() => router.back()} className="bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center text-[#5C3A21] pointer-events-auto border border-[#E6D5C3] hover:bg-[#F2EAE1] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                </div>

                {/* Segment label overlay on map */}
                {selectedSegmentIdx !== null && activeSegment && (
                    <div className="absolute bottom-3 left-4 right-4 z-10 pointer-events-none">
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg border border-[#E6D5C3] pointer-events-auto">
                            <div className="flex items-center gap-2 text-xs text-[#8D7B68]">
                                <span className="inline-flex items-center gap-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#5C3A21]"></span>
                                    <span className="font-semibold text-[#2D1E12] truncate max-w-[120px]">{activeSegment.fromName}</span>
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C59B6D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                <span className="inline-flex items-center gap-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#A73A3A]"></span>
                                    <span className="font-semibold text-[#2D1E12] truncate max-w-[120px]">{activeSegment.toName}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Sheet */}
            <div className="h-[55%] bg-[#FAF8F5] z-20 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] flex flex-col relative -mt-6 pt-2 border-t border-[#E6D5C3]">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-cover bg-center rounded-t-3xl" style={{ backgroundImage: "url('/images/batik_bg.png')" }} />
                <div className="w-12 h-1.5 bg-[#D1C7BD] rounded-full mx-auto mb-3 relative z-10"></div>

                <div className="px-5 flex-1 overflow-y-auto pb-6 relative z-10">
                    {/* Route Header Button — always visible, clickable to show full route */}
                    <button
                        onClick={handleShowFullRoute}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all mb-4 group relative overflow-hidden ${
                            selectedSegmentIdx === null
                                ? 'bg-[#5C3A21] border-[#5C3A21] shadow-lg shadow-[#5C3A21]/20'
                                : 'bg-white border-[#E6D5C3] hover:border-[#C59B6D] hover:shadow-md'
                        }`}
                    >
                        {selectedSegmentIdx === null && (
                            <div className="absolute inset-0 opacity-10 pointer-events-none bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: "url('/images/batik_bg.png')" }} />
                        )}
                        <div className={`font-serif font-bold text-lg px-3 py-1.5 rounded-xl shadow-sm transition-colors relative z-10 ${
                            selectedSegmentIdx === null
                                ? 'bg-[#FAF8F5]/20 text-white border border-[#C59B6D]/30'
                                : 'bg-[#FAF8F5] text-[#5C3A21] border border-[#E6D5C3]'
                        }`}>
                            14
                        </div>
                        <div className="flex-1 text-left relative z-10">
                            <p className={`font-serif font-bold text-sm transition-colors ${
                                selectedSegmentIdx === null ? 'text-white' : 'text-[#2D1E12]'
                            }`}>
                                Rute 14
                            </p>
                            <p className={`text-[11px] transition-colors ${
                                selectedSegmentIdx === null ? 'text-[#E6D5C3]' : 'text-[#8D7B68]'
                            }`}>
                                {route.startPoint} ⇄ {route.endPoint}
                            </p>
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors relative z-10 ${
                            selectedSegmentIdx === null
                                ? 'bg-[#4A2E1A] text-[#C59B6D] border border-[#C59B6D]/30'
                                : 'bg-[#F2EAE1] text-[#8D7B68] border border-[#E6D5C3]'
                        }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3"/><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/></svg>
                            {haltes.length} Halte
                        </div>
                    </button>

                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8D7B68] w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Cari nama halte..."
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E6D5C3] rounded-xl text-sm outline-none focus:border-[#5C3A21] focus:ring-1 focus:ring-[#5C3A21]/20 transition-colors shadow-sm"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8D7B68] hover:text-[#5C3A21] transition-colors bg-[#F2EAE1] rounded-full p-0.5"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        )}
                    </div>

                    {/* Segment List Title */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 rounded-full bg-[#C59B6D]"></div>
                        <h3 className="font-serif font-bold text-sm text-[#5C3A21]">Titik Antar Berurutan</h3>
                        <span className="text-[10px] text-[#8D7B68] bg-[#E6D5C3]/50 px-2 py-0.5 rounded-full font-semibold border border-[#D1C7BD]">{filteredSegments.length} segmen</span>
                    </div>

                    {/* Segment List */}
                    <div className="flex flex-col gap-2">
                        {filteredSegments.length === 0 && search.trim() && (
                            <div className="text-center py-8 text-sm text-[#8D7B68] bg-white rounded-xl border border-[#E6D5C3] shadow-sm">
                                <span className="text-4xl opacity-20 block mb-2" style={{ color: "#5C3A21" }}>ꦗ</span>
                                Halte &quot;{search}&quot; tidak ditemukan
                            </div>
                        )}
                        {filteredSegments.map(({ seg, originalIdx }) => {
                            const isActive = selectedSegmentIdx === originalIdx;
                            return (
                                <button
                                    key={originalIdx}
                                    onClick={() => handleSelectSegment(originalIdx)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all group relative overflow-hidden ${
                                        isActive
                                            ? 'bg-[#5C3A21]/5 border-[#5C3A21] shadow-sm'
                                            : 'bg-white border-[#E6D5C3] hover:border-[#C59B6D] hover:shadow-sm'
                                    }`}
                                >
                                    {/* Active indicator bar */}
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5C3A21] rounded-r-full"></div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        {/* Segment number */}
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                                            isActive
                                                ? 'bg-[#5C3A21] text-white'
                                                : 'bg-[#F2EAE1] text-[#8D7B68] group-hover:bg-[#E6D5C3] border border-[#D1C7BD]'
                                        }`}>
                                            {originalIdx + 1}
                                        </div>

                                        {/* Segment info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="w-2 h-2 rounded-full bg-[#5C3A21] shrink-0"></span>
                                                <p className={`text-xs font-semibold truncate ${isActive ? 'text-[#5C3A21]' : 'text-[#2D1E12]'}`}>
                                                    {seg.fromName}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-[#A73A3A] shrink-0"></span>
                                                <p className={`text-xs font-semibold truncate ${isActive ? 'text-[#A73A3A]' : 'text-[#8D7B68]'}`}>
                                                    {seg.toName}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Arrow icon */}
                                        <div className={`shrink-0 transition-colors ${isActive ? 'text-[#5C3A21]' : 'text-[#D1C7BD] group-hover:text-[#8D7B68]'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                                        </div>
                                    </div>

                                    {/* First / Last labels */}
                                    {originalIdx === 0 && (
                                        <span className="absolute top-1.5 right-2 text-[8px] text-[#5C3A21] font-bold bg-[#F2EAE1] px-1.5 py-0.5 rounded border border-[#C59B6D]">AWAL</span>
                                    )}
                                    {originalIdx === segments.length - 1 && (
                                        <span className="absolute top-1.5 right-2 text-[8px] text-[#A73A3A] font-bold bg-[#F5EFE9] px-1.5 py-0.5 rounded border border-[#A73A3A]/30">AKHIR</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
