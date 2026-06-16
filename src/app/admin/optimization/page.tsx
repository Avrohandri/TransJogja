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

// Dynamic import to avoid SSR issues with Leaflet
const OptimizationMap = dynamic(
    () => import("@/components/admin/OptimizationMap"),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-[#e0e3e5] text-[#3f4945] rounded-lg">
                Memuat Peta...
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
            <div className="bg-[#f4f7f6] min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#00342b] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#3f4945] text-sm font-medium">
                        Memuat...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f4f7f6] text-[#191c1e] font-sans antialiased min-h-screen p-4">
            {/* Top Navbar */}
            <header className="bg-white rounded-xl px-6 py-3 shadow-sm mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3 py-1">
                    <button
                        onClick={() => router.push("/admin")}
                        className="text-[#3f4945] hover:text-[#00342b] p-2 rounded-full transition-colors"
                        title="Kembali ke Dashboard"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M19 12H5" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                    </button>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#191c1e]">
                            Optimasi Halte
                        </span>
                        <span className="text-[10px] text-[#3f4945] font-medium">
                            Rute 14 — Analisis Demand
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2 mr-2">
                        <div className="relative w-8 h-8 flex items-center justify-center bg-[#e0e3e5] rounded-full border border-[#bfc9c4] text-lg">
                            🚌
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#006c49] rounded-full border-2 border-white"></span>
                        </div>
                        <span className="text-xs font-medium text-[#3f4945]">
                            {currentUser?.fullname ||
                                currentUser?.email?.split("@")[0] ||
                                "Admin"}
                        </span>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="text-[#3f4945] hover:text-[#ba1a1a] p-2 rounded-full transition-colors"
                        title="Sign out"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" x2="9" y1="12" y2="12" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left Panel — Controls + Results */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    {/* Config Card */}
                    <div className="bg-white rounded-xl p-5 shadow-sm">
                        <div className="mb-4">
                            <h2 className="text-lg font-bold text-[#00342b] flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#00342b] bg-opacity-10 rounded-lg flex items-center justify-center text-base">
                                    ⚙️
                                </span>
                                Konfigurasi Analisis
                            </h2>
                            <p className="text-xs text-[#3f4945] mt-1 ml-10">
                                Pilih periode & sensitivitas untuk evaluasi halte
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <label className="text-[11px] font-semibold text-[#3f4945] mb-1 block">
                                    Bulan Mulai
                                </label>
                                <input
                                    type="month"
                                    value={startMonth}
                                    onChange={(e) =>
                                        setStartMonth(e.target.value)
                                    }
                                    className="w-full border border-[#e0e3e5] rounded-lg px-3 py-2 text-sm text-[#191c1e] outline-none focus:border-[#00342b] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-semibold text-[#3f4945] mb-1 block">
                                    Bulan Akhir
                                </label>
                                <input
                                    type="month"
                                    value={endMonth}
                                    onChange={(e) =>
                                        setEndMonth(e.target.value)
                                    }
                                    className="w-full border border-[#e0e3e5] rounded-lg px-3 py-2 text-sm text-[#191c1e] outline-none focus:border-[#00342b] transition-colors"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="text-[11px] font-semibold text-[#3f4945] mb-1 block">
                                Sensitivitas (Z-Score Threshold)
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="-2.5"
                                    max="0"
                                    step="0.1"
                                    value={threshold}
                                    onChange={(e) =>
                                        setThreshold(parseFloat(e.target.value))
                                    }
                                    className="flex-1 accent-[#00342b]"
                                />
                                <span className="text-sm font-bold text-[#00342b] bg-[#00342b] bg-opacity-10 px-3 py-1 rounded-lg min-w-[52px] text-center">
                                    {threshold.toFixed(1)}
                                </span>
                            </div>
                            <div className="flex justify-between text-[10px] text-[#3f4945] mt-1 px-1">
                                <span>Lebih ketat</span>
                                <span>Lebih longgar</span>
                            </div>
                        </div>

                        <button
                            onClick={handleRunOptimization}
                            disabled={isProcessing}
                            className="w-full py-2.5 bg-[#00342b] text-white font-semibold text-sm rounded-lg hover:bg-[#004d3b] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                                    </svg>
                                    Jalankan Analisis
                                </>
                            )}
                        </button>
                    </div>

                    {/* Summary Stats */}
                    {summary && (
                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-lg font-bold text-[#00342b] flex items-center gap-2">
                                    <span className="w-8 h-8 bg-[#00342b] bg-opacity-10 rounded-lg flex items-center justify-center text-base">
                                        📊
                                    </span>
                                    Ringkasan Hasil
                                </h2>
                                <span className="text-[10px] bg-[#e0e3e5] px-2 py-1 rounded-full font-medium text-[#3f4945]">
                                    {summary.periodLabel}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="bg-[#dcfce7] p-3 rounded-lg border border-[#bbf7d0]">
                                    <p className="text-[10px] font-bold text-[#006c49] mb-1">
                                        Halte Optimal
                                    </p>
                                    <p className="text-2xl font-extrabold text-[#006c49]">
                                        {summary.optimalCount}
                                    </p>
                                </div>
                                <div className="bg-[#fee2e2] p-3 rounded-lg border border-[#fecaca]">
                                    <p className="text-[10px] font-bold text-[#ba1a1a] mb-1">
                                        Tidak Optimal
                                    </p>
                                    <p className="text-2xl font-extrabold text-[#ba1a1a]">
                                        {summary.nonOptimalCount}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="bg-[#f2f4f6] p-2.5 rounded-lg border border-[#e0e3e5]">
                                    <p className="text-[9px] font-bold text-[#3f4945] mb-0.5">
                                        Periode
                                    </p>
                                    <p className="text-sm font-bold text-[#00342b]">
                                        {summary.totalMonths} bln
                                    </p>
                                </div>
                                <div className="bg-[#f2f4f6] p-2.5 rounded-lg border border-[#e0e3e5]">
                                    <p className="text-[9px] font-bold text-[#3f4945] mb-0.5">
                                        Rata-rata Global
                                    </p>
                                    <p className="text-sm font-bold text-[#00342b]">
                                        {summary.globalMean}
                                    </p>
                                </div>
                                <div className="bg-[#f2f4f6] p-2.5 rounded-lg border border-[#e0e3e5]">
                                    <p className="text-[9px] font-bold text-[#3f4945] mb-0.5">
                                        Std. Deviasi
                                    </p>
                                    <p className="text-sm font-bold text-[#00342b]">
                                        {summary.globalStdDev}
                                    </p>
                                </div>
                            </div>

                            {/* Toggle view */}
                            <div className="flex items-center gap-2 px-1">
                                <button
                                    onClick={() =>
                                        setShowOnlyOptimal(!showOnlyOptimal)
                                    }
                                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                                        showOnlyOptimal
                                            ? "bg-[#006c49]"
                                            : "bg-[#bfc9c4]"
                                    }`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                                            showOnlyOptimal
                                                ? "translate-x-5"
                                                : ""
                                        }`}
                                    />
                                </button>
                                <span className="text-xs text-[#3f4945] font-medium">
                                    Tampilkan hanya halte optimal di peta
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Results Table */}
                    {summary && (
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: "400px" }}>
                            <div className="px-5 py-3 border-b border-[#e0e3e5] flex-shrink-0 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-[#00342b]">
                                    Detail Per Halte
                                </h3>
                                <span className="text-[10px] text-[#3f4945] font-medium">
                                    {summary.results.length} halte
                                </span>
                            </div>
                            <div className="overflow-y-auto flex-1">
                                <table className="w-full text-xs">
                                    <thead className="sticky top-0 bg-[#f2f4f6] z-10">
                                        <tr>
                                            <th
                                                className="text-left px-4 py-2.5 font-semibold text-[#3f4945] cursor-pointer hover:text-[#00342b] select-none"
                                                onClick={() => handleSort("halteIndex")}
                                            >
                                                # Halte{" "}
                                                {sortKey === "halteIndex" && (sortAsc ? "↑" : "↓")}
                                            </th>
                                            <th
                                                className="text-right px-4 py-2.5 font-semibold text-[#3f4945] cursor-pointer hover:text-[#00342b] select-none"
                                                onClick={() => handleSort("averageDemand")}
                                            >
                                                Rata-rata{" "}
                                                {sortKey === "averageDemand" && (sortAsc ? "↑" : "↓")}
                                            </th>
                                            <th
                                                className="text-right px-4 py-2.5 font-semibold text-[#3f4945] cursor-pointer hover:text-[#00342b] select-none"
                                                onClick={() => handleSort("zScore")}
                                            >
                                                Z-Score{" "}
                                                {sortKey === "zScore" && (sortAsc ? "↑" : "↓")}
                                            </th>
                                            <th className="text-center px-4 py-2.5 font-semibold text-[#3f4945]">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedResults.map((r) => (
                                            <tr
                                                key={r.halteIndex}
                                                className={`border-b border-[#f2f4f6] transition-colors ${
                                                    r.isOptimal
                                                        ? "hover:bg-[#f0fdf4]"
                                                        : "hover:bg-[#fef2f2] bg-[#fff5f5]"
                                                }`}
                                            >
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-5 h-5 flex items-center justify-center bg-[#00342b] bg-opacity-10 rounded-full text-[10px] font-bold text-[#00342b] flex-shrink-0">
                                                            {r.halteIndex + 1}
                                                        </span>
                                                        <span className="truncate max-w-[150px]" title={r.namaHalte}>
                                                            {r.namaHalte}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-mono font-semibold">
                                                    {r.averageDemand}
                                                </td>
                                                <td
                                                    className={`px-4 py-2.5 text-right font-mono font-bold ${
                                                        r.zScore >= 0
                                                            ? "text-[#006c49]"
                                                            : "text-[#ba1a1a]"
                                                    }`}
                                                >
                                                    {r.zScore > 0 ? "+" : ""}
                                                    {r.zScore}
                                                </td>
                                                <td className="px-4 py-2.5 text-center">
                                                    <span
                                                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                            r.isOptimal
                                                                ? "bg-[#dcfce7] text-[#006c49]"
                                                                : "bg-[#fee2e2] text-[#ba1a1a]"
                                                        }`}
                                                    >
                                                        {r.isOptimal
                                                            ? "Optimal"
                                                            : "Tidak Optimal"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Info card when no results yet */}
                    {!summary && !isProcessing && (
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-dashed border-[#bfc9c4]">
                            <div className="flex flex-col items-center text-center gap-3 py-4">
                                <div className="w-14 h-14 bg-[#00342b] bg-opacity-5 rounded-2xl flex items-center justify-center text-3xl">
                                    🔍
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#00342b] mb-1">
                                        Belum Ada Hasil Analisis
                                    </h3>
                                    <p className="text-xs text-[#3f4945] max-w-xs">
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
                    <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col relative overflow-hidden h-full">
                        <div className="mb-3 z-10 relative bg-white bg-opacity-90 p-2 rounded-lg inline-block w-max backdrop-blur-sm">
                            <h2 className="text-lg font-bold text-[#00342b]">
                                Peta Rute & Optimasi Halte
                            </h2>
                            <p className="text-xs text-[#3f4945]">
                                {summary
                                    ? `${summary.optimalCount} optimal (hijau) · ${summary.nonOptimalCount} tidak optimal (merah)`
                                    : "Jalankan analisis untuk melihat visualisasi"}
                            </p>
                        </div>

                        {/* Legend */}
                        {summary && (
                            <div className="absolute top-16 right-6 z-10 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg border border-[#e0e3e5] px-3 py-2.5 text-xs">
                                <p className="font-bold text-[#191c1e] mb-1.5 text-[10px]">
                                    LEGENDA
                                </p>
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-[#006c49]" />
                                        <span className="text-[#3f4945]">
                                            Halte Optimal
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-[#ba1a1a]" />
                                        <span className="text-[#3f4945]">
                                            Halte Tidak Optimal
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full border-2 border-dashed border-[#ba1a1a] bg-[#ba1a1a] bg-opacity-10" />
                                        <span className="text-[#3f4945]">
                                            Area Perhatian
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="rounded-lg overflow-hidden relative bg-[#e0e3e5] flex-grow min-h-[500px]">
                            <OptimizationMap
                                optimizationResults={
                                    summary?.results || null
                                }
                                showOnlyOptimal={showOnlyOptimal}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
