"use client";
import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import {
    optimizationService,
    OptimizationSummary,
    OptimizationResult,
} from "@/services/optimizationService";
import { halteService } from "@/services/halteService";

// Dynamic import to avoid SSR issues with Leaflet
const OptimizationMap = dynamic(
    () => import("@/components/admin/OptimizationMap"),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-[#F2EAE1] text-[#8D7B68] rounded-lg border border-[#E6D5C3]">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-[#C59B6D] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-semibold">Memuat Peta...</span>
                </div>
            </div>
        ),
    }
);

export default function OptimizationPage() {
    const router = useRouter();
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<{
        fullname?: string;
        email?: string;
        role?: string;
    } | null>(null);

    // Period state
    const today = new Date();
    const [startMonth, setStartMonth] = useState(
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
    );
    const [endMonth, setEndMonth] = useState(
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
    );
    const [threshold, setThreshold] = useState(-1.0);

    // Results
    const [summary, setSummary] = useState<OptimizationSummary | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showOnlyOptimal, setShowOnlyOptimal] = useState(false);

    // Sorting for results table
    const [sortKey, setSortKey] = useState<"halteIndex" | "averageDemand" | "zScore">("halteIndex");
    const [sortAsc, setSortAsc] = useState(true);

    // Auth guard
    useEffect(() => {
        const unsubscribe = authService.onAuthStateChanged((user) => {
            if (!user) {
                router.push("/login");
            } else {
                setCurrentUser(user);
                setIsAuthLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleRunOptimization = async () => {
        setIsProcessing(true);
        try {
            const result = await optimizationService.runOptimization(
                startMonth,
                endMonth,
                threshold
            );
            setSummary(result);
        } catch (e) {
            console.error("Optimization error:", e);
            alert("Gagal menjalankan optimasi. Silakan coba lagi.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSignOut = async () => {
        await authService.logout();
        router.push("/login");
    };

    const handleApplyOptimization = async () => {
        if (!summary) return;
        const inactiveUrutans = summary.results.filter(r => !r.isOptimal).map(r => r.halteIndex + 1);
        await halteService.applyOptimization(inactiveUrutans);
        alert(`Berhasil menerapkan ${35 - inactiveUrutans.length} halte optimal ke sisi pengguna!`);
    };

    const handleResetOptimization = async () => {
        await halteService.resetOptimization();
        alert("Berhasil mengembalikan rute ke pengaturan awal (seluruh halte aktif).");
    };

    // Sorted results
    const sortedResults: OptimizationResult[] = summary
        ? [...summary.results].sort((a, b) => {
              const multiplier = sortAsc ? 1 : -1;
              if (sortKey === "halteIndex")
                  return (a.halteIndex - b.halteIndex) * multiplier;
              if (sortKey === "averageDemand")
                  return (a.averageDemand - b.averageDemand) * multiplier;
              return (a.zScore - b.zScore) * multiplier;
          })
        : [];

    const handleSort = (key: typeof sortKey) => {
        if (sortKey === key) {
            setSortAsc(!sortAsc);
        } else {
            setSortKey(key);
            setSortAsc(key === "halteIndex" ? true : false);
        }
    };

    if (isAuthLoading) {
        return (
            <div className="bg-[#FAF8F5] min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#5C3A21] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#8D7B68] text-sm font-bold tracking-widest uppercase">
                        Memuat...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#FAF8F5] text-[#2D1E12] font-sans antialiased min-h-screen p-4 relative transition-colors duration-300">
            {/* Background Batik */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-cover bg-center" style={{ backgroundImage: "url('/images/batik_bg.png')" }} />
            
            {/* Top Navbar */}
            <header className="bg-white rounded-xl px-4 sm:px-6 py-3 shadow-sm mb-4 flex items-center justify-between border border-[#E6D5C3] relative z-10 transition-colors duration-300">
                <div className="flex items-center gap-2 sm:gap-3 py-1">
                    <button
                        onClick={() => router.push("/admin")}
                        className="text-[#8D7B68] hover:bg-[#F2EAE1] hover:text-[#5C3A21] p-1.5 sm:p-2 -ml-1.5 sm:ml-0 rounded-full transition-colors"
                        title="Kembali ke Dashboard"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
                    </button>
                    <div className="flex flex-col">
                        <span className="text-sm sm:text-base font-serif font-bold text-[#5C3A21] leading-tight">
                            Optimasi
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-[#8D7B68] font-medium hidden sm:inline-block">
                            Rute 14 — Analisis
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-2 mr-1 sm:mr-2">
                        <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-[#FAF8F5] rounded-full border border-[#C59B6D] text-sm sm:text-lg shadow-sm">
                            🚌
                            <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#5C3A21] rounded-full border-2 border-white"></span>
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-[#5C3A21] max-w-[70px] sm:max-w-none truncate">
                            {currentUser?.fullname || currentUser?.email?.split("@")[0] || "Admin"}
                        </span>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="text-[#A73A3A] hover:bg-[#F2EAE1] p-1.5 sm:p-2 rounded-full transition-colors"
                        title="Sign out"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10">
                {/* Left Panel — Controls + Results */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    {/* Config Card */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E6D5C3] transition-colors duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none bg-cover bg-center" style={{ backgroundImage: "url('/images/batik_bg.png')" }} />
                        <div className="mb-4 relative z-10">
                            <h2 className="text-lg font-serif font-bold text-[#5C3A21] flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#FAF8F5] border border-[#C59B6D] rounded-lg flex items-center justify-center text-base shadow-sm">
                                    ⚙️
                                </span>
                                Konfigurasi Analisis
                            </h2>
                            <p className="text-xs text-[#8D7B68] mt-1 ml-10">
                                Pilih periode & sensitivitas untuk evaluasi halte
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                            <div>
                                <label className="text-[11px] font-bold text-[#8D7B68] uppercase tracking-wider mb-1 block">
                                    Bulan Mulai
                                </label>
                                <input
                                    type="month"
                                    value={startMonth}
                                    onChange={(e) => setStartMonth(e.target.value)}
                                    className="w-full bg-[#FAF8F5] border border-[#E6D5C3] rounded-lg px-3 py-2 text-sm font-semibold text-[#2D1E12] outline-none focus:border-[#C59B6D] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-[#8D7B68] uppercase tracking-wider mb-1 block">
                                    Bulan Akhir
                                </label>
                                <input
                                    type="month"
                                    value={endMonth}
                                    onChange={(e) => setEndMonth(e.target.value)}
                                    className="w-full bg-[#FAF8F5] border border-[#E6D5C3] rounded-lg px-3 py-2 text-sm font-semibold text-[#2D1E12] outline-none focus:border-[#C59B6D] transition-colors"
                                />
                            </div>
                        </div>

                        <div className="mb-4 relative z-10">
                            <label className="text-[11px] font-bold text-[#8D7B68] uppercase tracking-wider mb-1 block">
                                Sensitivitas (Z-Score Threshold)
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="-2.5"
                                    max="0"
                                    step="0.1"
                                    value={threshold}
                                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                    className="flex-1 accent-[#5C3A21]"
                                />
                                <span className="text-sm font-bold text-[#5C3A21] bg-[#FAF8F5] border border-[#C59B6D] px-3 py-1 rounded-lg min-w-[52px] text-center shadow-sm">
                                    {threshold.toFixed(1)}
                                </span>
                            </div>
                            <div className="flex justify-between text-[10px] text-[#8D7B68] mt-1 px-1 font-semibold">
                                <span>Lebih longgar</span>
                                <span>Lebih ketat</span>
                            </div>
                        </div>

                        <button
                            onClick={handleRunOptimization}
                            disabled={isProcessing}
                            className="w-full py-2.5 bg-[#5C3A21] text-white font-bold text-sm rounded-lg hover:bg-[#4A2E1A] disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm relative z-10"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                                    Jalankan Analisis
                                </>
                            )}
                        </button>
                    </div>

                    {/* Dummy data warning */}
                    {summary?.isUsingDummyData && (
                        <div className="bg-[#FFFDF0] border border-[#C59B6D] text-[#5C3A21] px-4 py-3 rounded-xl text-xs flex items-start gap-2 shadow-sm transition-colors duration-300">
                            <span className="text-base flex-shrink-0">⚠️</span>
                            <div>
                                <p className="font-bold mb-0.5">Menggunakan Data Demo</p>
                                <p className="text-[#8D7B68] font-medium">Firestore tidak dapat diakses (permission denied). Hasil analisis berdasarkan data dummy. Aktifkan Firestore Rules untuk menggunakan data nyata.</p>
                            </div>
                        </div>
                    )}

                    {/* Summary Stats */}
                    {summary && (
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E6D5C3] transition-colors duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.02] pointer-events-none bg-cover bg-center" style={{ backgroundImage: "url('/images/batik_bg.png')" }} />
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <h2 className="text-lg font-serif font-bold text-[#5C3A21] flex items-center gap-2">
                                    <span className="w-8 h-8 bg-[#FAF8F5] border border-[#C59B6D] rounded-lg flex items-center justify-center text-base shadow-sm">
                                        📊
                                    </span>
                                    Ringkasan Hasil
                                </h2>
                                <span className="text-[10px] bg-[#F2EAE1] border border-[#E6D5C3] px-2 py-1 rounded-full font-bold text-[#5C3A21]">
                                    {summary.periodLabel}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#4C6A43]/30 shadow-sm relative overflow-hidden group">
                                    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-[#4C6A43]/10 rounded-full group-hover:scale-150 transition-transform"></div>
                                    <p className="text-[10px] font-bold text-[#4C6A43] mb-1 uppercase tracking-wider relative z-10">
                                        Halte Optimal
                                    </p>
                                    <p className="text-3xl font-serif font-extrabold text-[#4C6A43] relative z-10">
                                        {summary.optimalCount}
                                    </p>
                                </div>
                                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#A73A3A]/30 shadow-sm relative overflow-hidden group">
                                    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-[#A73A3A]/10 rounded-full group-hover:scale-150 transition-transform"></div>
                                    <p className="text-[10px] font-bold text-[#A73A3A] mb-1 uppercase tracking-wider relative z-10">
                                        Tidak Optimal
                                    </p>
                                    <p className="text-3xl font-serif font-extrabold text-[#A73A3A] relative z-10">
                                        {summary.nonOptimalCount}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-4 relative z-10">
                                <div className="bg-[#F2EAE1] p-2.5 rounded-lg border border-[#E6D5C3]">
                                    <p className="text-[9px] font-bold text-[#8D7B68] mb-0.5 uppercase tracking-wide">Periode</p>
                                    <p className="text-sm font-bold text-[#5C3A21]">{summary.totalMonths} bln</p>
                                </div>
                                <div className="bg-[#F2EAE1] p-2.5 rounded-lg border border-[#E6D5C3]">
                                    <p className="text-[9px] font-bold text-[#8D7B68] mb-0.5 uppercase tracking-wide">Rata-rata Global</p>
                                    <p className="text-sm font-bold text-[#5C3A21]">{summary.globalMean}</p>
                                </div>
                                <div className="bg-[#F2EAE1] p-2.5 rounded-lg border border-[#E6D5C3]">
                                    <p className="text-[9px] font-bold text-[#8D7B68] mb-0.5 uppercase tracking-wide">Std. Deviasi</p>
                                    <p className="text-sm font-bold text-[#5C3A21]">{summary.globalStdDev}</p>
                                </div>
                            </div>

                            {/* Toggle view */}
                            <div className="flex items-center gap-3 px-1 relative z-10">
                                <button
                                    onClick={() => setShowOnlyOptimal(!showOnlyOptimal)}
                                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 border ${
                                        showOnlyOptimal ? "bg-[#5C3A21] border-[#5C3A21]" : "bg-[#F2EAE1] border-[#D1C7BD]"
                                    }`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-transform duration-200 ${
                                        showOnlyOptimal ? "translate-x-5" : ""
                                    }`} />
                                </button>
                                <span className="text-xs text-[#8D7B68] font-bold">
                                    Tampilkan hanya halte optimal di peta
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Results Table */}
                    {summary && (
                        <div className="bg-white rounded-xl shadow-sm border border-[#E6D5C3] overflow-hidden flex flex-col transition-colors duration-300" style={{ maxHeight: "400px" }}>
                            <div className="px-5 py-3 border-b border-[#E6D5C3] flex-shrink-0 flex items-center justify-between bg-[#FAF8F5]">
                                <h3 className="text-sm font-bold text-[#5C3A21]">Detail Per Halte</h3>
                                <span className="text-[10px] text-[#8D7B68] font-bold border border-[#D1C7BD] px-2 py-0.5 rounded-full">
                                    {summary.results.length} halte
                                </span>
                            </div>
                            <div className="overflow-y-auto flex-1 custom-scrollbar">
                                <table className="w-full text-xs">
                                    <thead className="sticky top-0 bg-[#F2EAE1] z-10 border-b border-[#E6D5C3] shadow-sm">
                                        <tr>
                                            <th className="text-left px-4 py-3 font-bold text-[#5C3A21] cursor-pointer hover:bg-[#E6D5C3] transition-colors select-none" onClick={() => handleSort("halteIndex")}>
                                                # Halte {sortKey === "halteIndex" && (sortAsc ? "↑" : "↓")}
                                            </th>
                                            <th className="text-right px-4 py-3 font-bold text-[#5C3A21] cursor-pointer hover:bg-[#E6D5C3] transition-colors select-none" onClick={() => handleSort("averageDemand")}>
                                                Rata-rata {sortKey === "averageDemand" && (sortAsc ? "↑" : "↓")}
                                            </th>
                                            <th className="text-right px-4 py-3 font-bold text-[#5C3A21] cursor-pointer hover:bg-[#E6D5C3] transition-colors select-none" onClick={() => handleSort("zScore")}>
                                                Z-Score {sortKey === "zScore" && (sortAsc ? "↑" : "↓")}
                                            </th>
                                            <th className="text-center px-4 py-3 font-bold text-[#5C3A21]">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedResults.map((r) => (
                                            <tr key={r.halteIndex} className="border-b border-[#F2EAE1] transition-colors hover:bg-[#FAF8F5] bg-white group">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-5 h-5 flex items-center justify-center bg-[#F2EAE1] border border-[#C59B6D] rounded text-[10px] font-bold text-[#5C3A21] flex-shrink-0 group-hover:bg-[#5C3A21] group-hover:text-white transition-colors">
                                                            {r.halteIndex + 1}
                                                        </span>
                                                        <span className="truncate max-w-[150px] font-semibold text-[#2D1E12]" title={r.namaHalte}>
                                                            {r.namaHalte}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono font-bold text-[#5C3A21]">
                                                    {r.averageDemand}
                                                </td>
                                                <td className={`px-4 py-3 text-right font-mono font-bold ${r.zScore >= 0 ? "text-[#4C6A43]" : "text-[#A73A3A]"}`}>
                                                    {r.zScore > 0 ? "+" : ""}{r.zScore}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-block px-2.5 py-1 rounded text-[9px] font-bold border tracking-wider ${
                                                        r.isOptimal ? "bg-[#4C6A43]/10 text-[#4C6A43] border-[#4C6A43]/30" : "bg-[#A73A3A]/10 text-[#A73A3A] border-[#A73A3A]/30"
                                                    }`}>
                                                        {r.isOptimal ? "OPTIMAL" : "KURANG"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    
                    {/* Action Buttons */}
                    {summary && (
                        <div className="grid grid-cols-2 gap-3 z-10 relative">
                            <button 
                                onClick={handleResetOptimization}
                                className="py-2.5 bg-white border border-[#A73A3A] text-[#A73A3A] font-bold text-sm rounded-lg hover:bg-[#A73A3A]/10 transition-colors shadow-sm"
                            >
                                ↺ Reset ke Awal
                            </button>
                            <button 
                                onClick={handleApplyOptimization}
                                className="py-2.5 bg-[#4C6A43] text-white font-bold text-sm rounded-lg hover:bg-[#3A5032] transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                Terapkan Halte Optimal
                            </button>
                        </div>
                    )}

                    {/* Info card when no results yet */}
                    {!summary && !isProcessing && (
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-dashed border-[#C59B6D] transition-colors duration-300">
                            <div className="flex flex-col items-center text-center gap-3 py-4">
                                <div className="w-14 h-14 bg-[#FAF8F5] border border-[#C59B6D] rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                                    🔍
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#5C3A21] mb-1">
                                        Belum Ada Hasil Analisis
                                    </h3>
                                    <p className="text-xs text-[#8D7B68] max-w-xs leading-relaxed">
                                        Pilih periode & jalankan analisis untuk
                                        melihat halte mana yang masih optimal
                                        berdasarkan data demand.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel — Map */}
                <div className="lg:col-span-7 flex flex-col">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E6D5C3] flex flex-col relative overflow-hidden h-full transition-colors duration-300">
                        <div className="mb-3 z-10 relative bg-white/90 border border-[#E6D5C3] p-2.5 rounded-lg inline-block w-max backdrop-blur-md shadow-sm">
                            <h2 className="text-sm font-serif font-bold text-[#5C3A21]">
                                Peta Rute & Optimasi Halte
                            </h2>
                            <p className="text-[11px] text-[#8D7B68] font-medium mt-0.5">
                                {summary
                                    ? `${summary.optimalCount} optimal (hijau) · ${summary.nonOptimalCount} tidak optimal (merah)`
                                    : "Jalankan analisis untuk melihat visualisasi"}
                            </p>
                        </div>

                        {/* Legend */}
                        {summary && (
                            <div className="absolute top-16 right-6 z-10 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-[#E6D5C3] px-3.5 py-3 text-xs">
                                <p className="font-bold text-[#5C3A21] mb-2 text-[10px] tracking-widest border-b border-[#E6D5C3] pb-1.5">
                                    LEGENDA
                                </p>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-3.5 h-3.5 rounded-full bg-[#4C6A43] shadow-inner" />
                                        <span className="text-[#2D1E12] font-semibold text-[11px]">Halte Optimal</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-3.5 h-3.5 rounded-full bg-[#A73A3A] shadow-inner" />
                                        <span className="text-[#2D1E12] font-semibold text-[11px]">Halte Tidak Optimal</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-3.5 h-3.5 rounded-full border-[2.5px] border-dashed border-[#A73A3A] bg-[#A73A3A]/10" />
                                        <span className="text-[#2D1E12] font-semibold text-[11px]">Area Perhatian</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="rounded-lg overflow-hidden relative bg-[#FAF8F5] border border-[#E6D5C3] flex-grow min-h-[500px]">
                            <OptimizationMap
                                optimizationResults={summary?.results || null}
                                showOnlyOptimal={showOnlyOptimal}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
