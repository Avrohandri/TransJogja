"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { halteService, Halte } from "@/services/halteService";

// ── Cluster constants ──
const TRANSIT_URUTAN = 18; // Simpang Pasar Jangkang

const CLUSTER = {
    cluster1: { label: "Cluster 1", sublabel: "Jangkang → Pakem",        color: "#8C5E3B", bg: "#F2EAE1", border: "#8C5E3B" }, // Terracotta
    cluster2: { label: "Cluster 2", sublabel: "Adisucipto → Jangkang",   color: "#8D7B68", bg: "#F5EFE9", border: "#8D7B68" }, // Taupe
    transit:  { label: "Transit",   sublabel: "Simpang Pasar Jangkang",   color: "#C59B6D", bg: "#FFFDF0", border: "#C59B6D" }, // Gold
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
    ).sort((a, b) => b.urutan - a.urutan);

    const handleSelectHalte = (h: Halte) => {
        if (focusField === "from") {
            setFromHalte(h);
            setFromSearch(h.namaHalte);
            
            if (toHalte) {
                router.push(`/user/estimate?from=${h.halteId}&to=${toHalte.halteId}`);
            } else {
                setFocusField("to");
                setToSearch("");
            }
        } else {
            setToHalte(h);
            setToSearch(h.namaHalte);
            
            if (fromHalte) {
                router.push(`/user/estimate?from=${fromHalte.halteId}&to=${h.halteId}`);
            } else {
                setFocusField("from");
                setFromSearch("");
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
        { key: "all",      label: "Sedaya (Semua)",     color: "#8D7B68", activeColor: "#F2EAE1" },
        { key: "cluster1", label: "Cluster 1", color: CLUSTER.cluster1.color, activeColor: CLUSTER.cluster1.bg },
        { key: "cluster2", label: "Cluster 2", color: CLUSTER.cluster2.color, activeColor: CLUSTER.cluster2.bg },
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-[#2D1E12] flex flex-col relative">
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-cover bg-center" style={{ backgroundImage: "url('/images/batik_bg.png')" }} />
            
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="relative text-white px-4 py-4 flex flex-col pt-8" style={{ backgroundColor: "#5C3A21" }}>
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: "url('/images/batik_bg.png')" }} />
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <Link href="/user" className="text-white hover:text-[#C59B6D] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6"/>
                        </svg>
                    </Link>
                    <h1 className="font-serif font-bold text-lg tracking-wide">Tujuan Anda</h1>
                </div>

                {/* From / To inputs */}
                <div className="bg-[#FAF8F5] rounded-xl p-3 shadow-lg flex flex-col gap-3 relative z-10 border border-[#E6D5C3]">
                    <div className="absolute left-6 top-7 bottom-7 w-0.5 bg-[#E6D5C3] border-l-2 border-dotted border-[#C59B6D]"></div>

                    {/* FROM */}
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-4 h-4 rounded-full border-[4px] border-[#5C3A21] bg-white flex-shrink-0"></div>
                        <div className="flex-1 bg-white rounded-lg px-3 py-2 flex items-center border border-[#E6D5C3] shadow-sm">
                            <input
                                type="text"
                                value={focusField === "from" ? fromSearch : (fromHalte?.namaHalte || "")}
                                onFocus={handleFocusFrom}
                                onChange={e => { if (focusField === "from") setFromSearch(e.target.value); }}
                                placeholder="Cari Halte Awal..."
                                className={`bg-transparent outline-none w-full text-sm font-semibold ${focusField === "from" ? "text-[#5C3A21]" : "text-[#2D1E12]"}`}
                            />
                        </div>
                    </div>

                    {/* TO */}
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-[#A73A3A] flex-shrink-0 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                        <div className="flex-1 bg-white rounded-lg px-3 py-2 flex items-center border border-[#E6D5C3] shadow-sm">
                            <input
                                type="text"
                                value={focusField === "to" ? toSearch : (toHalte?.namaHalte || "")}
                                onFocus={handleFocusTo}
                                onChange={e => { if (focusField === "to") setToSearch(e.target.value); }}
                                placeholder="Cari Halte Tujuan..."
                                className={`bg-transparent outline-none w-full text-sm font-semibold ${focusField === "to" ? "text-[#A73A3A]" : "text-[#2D1E12]"}`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content ──────────────────────────────────────────────────── */}
            <div className="flex-1 bg-[#FAF8F5] px-4 py-4 rounded-t-2xl -mt-4 z-20 overflow-y-auto relative">
                
                {/* Cluster legend strip */}
                <div className="flex items-center gap-3 mb-3 px-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#8D7B68] font-medium">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: CLUSTER.cluster1.color }}></span>
                        Cl. 1 (Jangkang→Pakem)
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#8D7B68] font-medium">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: CLUSTER.cluster2.color }}></span>
                        Cl. 2 (Adisucipto→Jangkang)
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#8D7B68] font-medium">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: CLUSTER.transit.color }}></span>
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
                                    borderColor: isActive ? btn.color : "#E6D5C3",
                                    background: isActive ? btn.activeColor : "#ffffff",
                                    color: isActive ? btn.color : "#8D7B68",
                                }}
                                className="flex-1 py-2 rounded-full text-xs font-bold border transition-all duration-200 shadow-sm"
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
                        style={{ background: CLUSTER.transit.bg, borderColor: CLUSTER.transit.color }}
                    >
                        <span className="text-xl opacity-80" style={{ color: CLUSTER.transit.color }}>ꦠ</span>
                        <div>
                            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: CLUSTER.transit.color }}>TITIK TRANSIT</p>
                            <p className="text-sm font-semibold text-[#2D1E12]">Simpang Pasar Jangkang</p>
                            <p className="text-[10px] text-[#8D7B68]">
                                {clusterFilter === "cluster1"
                                    ? "Titik awal Cluster 1 — dari sini menuju Terminal Pakem"
                                    : "Titik akhir Cluster 2 — dari TJ Adisucipto ke sini"}
                            </p>
                        </div>
                    </div>
                )}

                {/* Halte list — always visible, filtered by cluster + search */}
                <div className="flex flex-col gap-2">
                    <p className="text-xs text-[#8D7B68] mb-1 px-1 font-medium">
                        {filteredHaltes.length} halte ditemukan
                        {clusterFilter !== "all" && <span> — {clusterFilter === "cluster1" ? "Cluster 1 + Transit" : "Cluster 2 + Transit"}</span>}
                    </p>

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
                                className="flex items-center gap-4 py-3 border-b cursor-pointer transition-all duration-150 px-3 rounded-xl border border-transparent hover:border-[#E6D5C3] hover:shadow-sm"
                                style={{
                                    borderColor: isTransit ? CLUSTER.transit.color : "#E6D5C3",
                                    background: isTransit ? CLUSTER.transit.bg : "white",
                                    borderWidth: isTransit ? 2 : 1,
                                    marginBottom: isTransit ? 4 : 0,
                                }}
                            >
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-[#E6D5C3]"
                                    style={{ background: bgClr }}
                                >
                                    {isTransit ? (
                                        <span className="text-sm" style={{ color: CLUSTER.transit.color }}>ꦠ</span>
                                    ) : (
                                        <div className="w-3.5 h-3.5 rounded-full" style={{ background: clr }}></div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-[#2D1E12]">{h.namaHalte}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-[10px] text-[#8D7B68]">Urutan {h.urutan}</p>
                                        {isTransit && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border"
                                                style={{ background: clr, color: "white", borderColor: clr }}>TRANSIT</span>
                                        )}
                                        {!isTransit && (
                                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border"
                                                style={{ background: bgClr, color: clr, borderColor: clr }}>
                                                {type === "cluster1" ? "Cluster 1" : "Cluster 2"}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                    fill="none" stroke="#D1C7BD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m9 18 6-6-6-6"/>
                                </svg>
                            </div>
                        );
                    })}

                    {filteredHaltes.length === 0 && (
                        <div className="text-center py-8">
                            <span className="text-4xl opacity-20 block mb-2" style={{ color: "#5C3A21" }}>ꦗ</span>
                            <p className="text-[#8D7B68] text-sm">Halte tidak ditemukan.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
