"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { halteService, Halte } from "@/services/halteService";
import { calculateDistanceKm } from "@/utils/distance";

// ── Cluster constants (mirrors roadRoute.ts TRANSIT_HALTE_INDEX = 17, urutan 18) ──
const TRANSIT_URUTAN = 18; // Simpang Pasar Jangkang

const CLUSTER = {
    cluster1: { label: "Cluster 1", sublabel: "Jangkang → Pakem",        color: "#2980d9", bg: "#e8f2fb", border: "#2980d9" },
    cluster2: { label: "Cluster 2", sublabel: "Adisucipto → Jangkang",   color: "#22c55e", bg: "#e8faf0", border: "#22c55e" },
    transit:  { label: "Transit",   sublabel: "Simpang Pasar Jangkang",   color: "#f59e0b", bg: "#fef9e7", border: "#f59e0b" },
};

type ClusterFilter = "all" | "cluster1" | "cluster2";

function getHalteType(urutan: number): "transit" | "cluster1" | "cluster2" {
    if (urutan === TRANSIT_URUTAN) return "transit";
    return urutan > TRANSIT_URUTAN ? "cluster1" : "cluster2";
}

export default function DestinationSearchPage() {
    const router = useRouter();
    const [haltes, setHaltes]               = useState<Halte[]>([]);
    const [fromHalte, setFromHalte]         = useState<Halte | null>(null);
    const [toHalte, setToHalte]             = useState<Halte | null>(null);
    const [fromSearch, setFromSearch]       = useState("");
    const [toSearch, setToSearch]           = useState("");
    const [focusField, setFocusField]       = useState<"from" | "to">("to");
    const [clusterFilter, setClusterFilter] = useState<ClusterFilter>("all");

    useEffect(() => {
        halteService.getHaltesByRoute("RUTE_14").then(data => {
            setHaltes(data);
            if (navigator.geolocation && data.length > 0) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    let minDistance = Infinity;
                    let nearest = data[0];
                    data.forEach(h => {
                        const dist = calculateDistanceKm(pos.coords.latitude, pos.coords.longitude, h.latitude, h.longitude);
                        if (dist < minDistance) { minDistance = dist; nearest = h; }
                    });
                    setFromHalte(nearest);
                }, () => setFromHalte(data[0]));
            } else if (data.length > 0) {
                setFromHalte(data[0]);
            }
        });
    }, []);

    // Active search text — depends on which field is focused
    const activeSearch = focusField === "from" ? fromSearch : toSearch;

    // Filter by cluster, then by active search
    const haltesByCluster = haltes.filter(h => {
        const type = getHalteType(h.urutan);
        if (clusterFilter === "cluster1") return type === "cluster1" || type === "transit";
        if (clusterFilter === "cluster2") return type === "cluster2" || type === "transit";
        return true;
    });
    const filteredHaltes = haltesByCluster.filter(h =>
        h.namaHalte.toLowerCase().includes(activeSearch.toLowerCase())
    );

    const handleSelectHalte = (h: Halte) => {
        if (focusField === "from") {
            setFromHalte(h);
            setFromSearch(h.namaHalte);
            setToSearch("");           // clear to-field so list opens fresh
            setFocusField("to");
        } else {
            setToHalte(h);
            setToSearch(h.namaHalte);
            if (fromHalte && h) {
                router.push(`/user/estimate?from=${fromHalte.halteId}&to=${h.halteId}`);
            }
        }
    };

    const handleFocusFrom = () => {
        setFocusField("from");
        // Pre-fill with current value so user can edit it
        setFromSearch(fromHalte?.namaHalte || "");
    };

    const handleFocusTo = () => {
        setFocusField("to");
        setToSearch(toHalte?.namaHalte || "");
    };

    const clusterFilterBtns: { key: ClusterFilter; label: string; color: string; activeColor: string }[] = [
        { key: "cluster2", label: "Cluster 2", color: "#22c55e", activeColor: "#e8faf0" },
        { key: "all",      label: "Semua",     color: "#707975", activeColor: "#f2f4f6" },
        { key: "cluster1", label: "Cluster 1", color: "#2980d9", activeColor: "#e8f2fb" },
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-[#191c1e] flex flex-col">

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="bg-[#00342b] text-white px-4 py-4 flex flex-col pt-8">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/user" className="text-white hover:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6"/>
                        </svg>
                    </Link>
                    <h1 className="font-bold text-lg">Your Destination</h1>
                </div>

                {/* From / To inputs */}
                <div className="bg-white rounded-xl p-3 shadow-lg flex flex-col gap-3 relative">
                    <div className="absolute left-6 top-7 bottom-7 w-0.5 bg-[#e0e3e5] border-l-2 border-dotted border-[#bfc9c4]"></div>

                    {/* FROM */}
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-4 h-4 rounded-full border-[4px] border-[#006c49] bg-white flex-shrink-0"></div>
                        <div className="flex-1 bg-[#f2f4f6] rounded-lg px-3 py-2 flex items-center">
                            <input
                                type="text"
                                value={focusField === "from" ? fromSearch : (fromHalte?.namaHalte || "")}
                                onFocus={handleFocusFrom}
                                onChange={e => { if (focusField === "from") setFromSearch(e.target.value); }}
                                placeholder="Cari Halte Awal..."
                                className={`bg-transparent outline-none w-full text-sm font-semibold ${focusField === "from" ? "text-[#006c49]" : "text-[#191c1e]"}`}
                            />
                        </div>
                    </div>

                    {/* TO */}
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-[#ba1a1a] flex-shrink-0 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                        <div className="flex-1 bg-[#f2f4f6] rounded-lg px-3 py-2 flex items-center">
                            <input
                                type="text"
                                value={focusField === "to" ? toSearch : (toHalte?.namaHalte || "")}
                                onFocus={handleFocusTo}
                                onChange={e => { if (focusField === "to") setToSearch(e.target.value); }}
                                placeholder="Cari Halte Tujuan..."
                                className={`bg-transparent outline-none w-full text-sm font-semibold ${focusField === "to" ? "text-[#ba1a1a]" : "text-[#191c1e]"}`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content ──────────────────────────────────────────────────── */}
            <div className="flex-1 bg-[#f7f9fb] px-4 py-4 rounded-t-2xl -mt-4 z-20 overflow-y-auto">

                {/* Cluster legend strip */}
                <div className="flex items-center gap-3 mb-3 px-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#707975]">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#2980d9" }}></span>
                        Cluster 1 (Jangkang→Pakem)
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#707975]">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#22c55e" }}></span>
                        Cluster 2 (Adisucipto→Jangkang)
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#707975]">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#f59e0b" }}></span>
                        Transit
                    </div>
                </div>

                {/* Cluster filter pill tabs */}
                <div className="flex gap-2 mb-4">
                    {clusterFilterBtns.map(btn => {
                        const isActive = clusterFilter === btn.key;
                        return (
                            <button
                                key={btn.key}
                                onClick={() => setClusterFilter(btn.key)}
                                style={{
                                    borderColor: isActive ? btn.color : "#e0e3e5",
                                    background: isActive ? btn.activeColor : "#ffffff",
                                    color: isActive ? btn.color : "#707975",
                                }}
                                className="flex-1 py-2 rounded-full text-xs font-bold border-2 transition-all duration-200 shadow-sm"
                            >
                                {btn.label}
                            </button>
                        );
                    })}
                </div>

                {/* Transit info card — shown when a cluster is selected */}
                {clusterFilter !== "all" && (
                    <div
                        className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl border-2"
                        style={{ background: "#fef9e7", borderColor: "#f59e0b" }}
                    >
                        <span className="text-xl">🔀</span>
                        <div>
                            <p className="text-xs font-bold" style={{ color: "#f59e0b" }}>TITIK TRANSIT</p>
                            <p className="text-sm font-semibold text-[#191c1e]">Simpang Pasar Jangkang</p>
                            <p className="text-[10px] text-[#707975]">
                                {clusterFilter === "cluster1"
                                    ? "Titik awal Cluster 1 — dari sini menuju Terminal Pakem"
                                    : "Titik akhir Cluster 2 — dari TJ Adisucipto ke sini"}
                            </p>
                        </div>
                    </div>
                )}

                {/* Halte count */}
                <p className="text-xs text-[#707975] mb-2 px-1">
                    {filteredHaltes.length} halte ditemukan
                    {clusterFilter !== "all" && <span> — {clusterFilter === "cluster1" ? "Cluster 1 + Transit" : "Cluster 2 + Transit"}</span>}
                </p>

                {/* Halte list */}
                <div className="flex flex-col gap-1">
                    {filteredHaltes.map(h => {
                        const type = getHalteType(h.urutan);
                        const clr   = type === "transit"  ? CLUSTER.transit.color  :
                                      type === "cluster1" ? CLUSTER.cluster1.color :
                                                            CLUSTER.cluster2.color;
                        const bgClr = type === "transit"  ? CLUSTER.transit.bg     :
                                      type === "cluster1" ? CLUSTER.cluster1.bg    :
                                                            CLUSTER.cluster2.bg;
                        const isTransit = type === "transit";

                        return (
                            <div
                                key={h.halteId}
                                onClick={() => handleSelectHalte(h)}
                                className="flex items-center gap-4 py-3 border-b cursor-pointer transition-all duration-150 px-2 rounded-xl"
                                style={{
                                    borderColor: isTransit ? "#f59e0b" : "#e0e3e5",
                                    background: isTransit ? "#fef9e7" : "white",
                                    borderWidth: isTransit ? 2 : 1,
                                    marginBottom: isTransit ? 4 : 0,
                                }}
                            >
                                {/* Cluster colour dot */}
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                                    style={{ background: bgClr }}
                                >
                                    {isTransit ? (
                                        <span className="text-base">🔀</span>
                                    ) : (
                                        <div className="w-3.5 h-3.5 rounded-full" style={{ background: clr }}></div>
                                    )}
                                </div>

                                {/* Halte info */}
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-[#191c1e]">{h.namaHalte}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-[10px] text-[#707975]">Urutan {h.urutan}</p>
                                        {isTransit && (
                                            <span
                                                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                                style={{ background: "#f59e0b", color: "white" }}
                                            >TRANSIT</span>
                                        )}
                                        {!isTransit && (
                                            <span
                                                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                                                style={{ background: bgClr, color: clr }}
                                            >
                                                {type === "cluster1" ? "Cluster 1" : "Cluster 2"}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Arrow */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                    fill="none" stroke="#bfc9c4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m9 18 6-6-6-6"/>
                                </svg>
                            </div>
                        );
                    })}

                    {filteredHaltes.length === 0 && (
                        <p className="text-center text-[#707975] py-8 text-sm">Halte tidak ditemukan.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
