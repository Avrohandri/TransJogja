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
            <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-[#006c49] border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen w-full relative bg-[#f7f9fb] font-sans overflow-hidden flex flex-col">
            {/* Map Area */}
            <div className="h-[45%] relative z-0">
                {mounted && (
                    selectedSegmentIdx !== null
                        ? <UserSegmentMap segment={activeSegment} />
                        : <UserMap isDetail={true} />
                )}

                {/* Top overlay: back + follow */}
                <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
                    <button onClick={() => router.back()} className="bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center text-[#00342b] pointer-events-auto border border-[#e0e3e5] hover:bg-[#f2f4f6] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button className="bg-[#00342b] text-white px-4 py-2 rounded-full shadow-md text-sm font-bold pointer-events-auto flex items-center gap-1 hover:bg-[#004d3b] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        Follow
                    </button>
                </div>

                {/* Segment label overlay on map */}
                {selectedSegmentIdx !== null && activeSegment && (
                    <div className="absolute bottom-3 left-4 right-4 z-10 pointer-events-none">
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg border border-[#e0e3e5] pointer-events-auto">
                            <div className="flex items-center gap-2 text-xs text-[#3f4945]">
                                <span className="inline-flex items-center gap-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#006c49]"></span>
                                    <span className="font-semibold text-[#191c1e] truncate max-w-[120px]">{activeSegment.fromName}</span>
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#006c49" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                <span className="inline-flex items-center gap-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span>
                                    <span className="font-semibold text-[#191c1e] truncate max-w-[120px]">{activeSegment.toName}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Sheet */}
            <div className="h-[55%] bg-white z-20 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] flex flex-col relative -mt-6 pt-2">
                <div className="w-12 h-1.5 bg-[#e0e3e5] rounded-full mx-auto mb-3"></div>

                <div className="px-5 flex-1 overflow-y-auto pb-6">
                    {/* Route 14 Header Button — always visible, clickable to show full route */}
                    <button
                        onClick={handleShowFullRoute}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all mb-4 group ${
                            selectedSegmentIdx === null
                                ? 'bg-[#00342b] border-[#00342b] shadow-lg shadow-[#00342b]/20'
                                : 'bg-white border-[#e0e3e5] hover:border-[#006c49] hover:shadow-md'
                        }`}
                    >
                        <div className={`font-bold text-lg px-3 py-1.5 rounded-xl shadow-sm transition-colors ${
                            selectedSegmentIdx === null
                                ? 'bg-white/20 text-white'
                                : 'bg-[#00342b] text-white'
                        }`}>
                            14
                        </div>
                        <div className="flex-1 text-left">
                            <p className={`font-bold text-sm transition-colors ${
                                selectedSegmentIdx === null ? 'text-white' : 'text-[#191c1e]'
                            }`}>
                                Rute 14
                            </p>
                            <p className={`text-[11px] transition-colors ${
                                selectedSegmentIdx === null ? 'text-white/70' : 'text-[#3f4945]'
                            }`}>
                                {route.startPoint} ⇄ {route.endPoint}
                            </p>
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                            selectedSegmentIdx === null
                                ? 'bg-white/20 text-white'
                                : 'bg-[#f2f4f6] text-[#3f4945]'
                        }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3"/><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/></svg>
                            {haltes.length} Halte
                        </div>
                    </button>

                    {/* Search Bar */}
                    <div className="relative mb-3">
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#707975] w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Cari nama halte..."
                            className="w-full pl-9 pr-4 py-2.5 bg-[#f7f9fb] border border-[#e0e3e5] rounded-xl text-sm outline-none focus:border-[#006c49] focus:bg-white transition-colors"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#707975] hover:text-[#191c1e] transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        )}
                    </div>

                    {/* Segment List Title */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-5 rounded-full bg-[#006c49]"></div>
                        <h3 className="font-bold text-sm text-[#191c1e]">Titik Antar Berurutan</h3>
                        <span className="text-[10px] text-[#707975] bg-[#f2f4f6] px-2 py-0.5 rounded-full font-semibold">{filteredSegments.length} segmen</span>
                    </div>

                    {/* Segment List */}
                    {/* Segment List */}
                    <div className="flex flex-col gap-2">
                        {filteredSegments.length === 0 && search.trim() && (
                            <div className="text-center py-8 text-sm text-[#707975]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-[#bfc9c4]"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
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
                                            ? 'bg-[#006c49]/5 border-[#006c49] shadow-md shadow-[#006c49]/10'
                                            : 'bg-white border-[#e0e3e5] hover:border-[#bfc9c4] hover:shadow-sm'
                                    }`}
                                >
                                    {/* Active indicator bar */}
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#006c49] rounded-r-full"></div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        {/* Segment number */}
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                                            isActive
                                                ? 'bg-[#006c49] text-white'
                                                : 'bg-[#f2f4f6] text-[#3f4945] group-hover:bg-[#e0e3e5]'
                                        }`}>
                                            {originalIdx + 1}
                                        </div>

                                        {/* Segment info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="w-2 h-2 rounded-full bg-[#006c49] shrink-0"></span>
                                                <p className={`text-xs font-semibold truncate ${isActive ? 'text-[#006c49]' : 'text-[#191c1e]'}`}>
                                                    {seg.fromName}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-[#ba1a1a] shrink-0"></span>
                                                <p className={`text-xs font-semibold truncate ${isActive ? 'text-[#ba1a1a]' : 'text-[#3f4945]'}`}>
                                                    {seg.toName}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Arrow icon */}
                                        <div className={`shrink-0 transition-colors ${isActive ? 'text-[#006c49]' : 'text-[#bfc9c4] group-hover:text-[#707975]'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                                        </div>
                                    </div>

                                    {/* First / Last labels */}
                                    {originalIdx === 0 && (
                                        <span className="absolute top-1.5 right-2 text-[8px] text-[#006c49] font-bold bg-[#6cf8bb]/25 px-1.5 py-0.5 rounded">AWAL</span>
                                    )}
                                    {originalIdx === segments.length - 1 && (
                                        <span className="absolute top-1.5 right-2 text-[8px] text-[#ba1a1a] font-bold bg-[#ffdad6]/50 px-1.5 py-0.5 rounded">AKHIR</span>
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
