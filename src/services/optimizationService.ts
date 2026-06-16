import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase-config";
import { halteList } from "./demandService";

export interface OptimizationResult {
    halteIndex: number;
    namaHalte: string;
    totalDemand: number;
    averageDemand: number;
    isOptimal: boolean;
    /** z-score relative to all haltes — negative means below average */
    zScore: number;
}

export interface OptimizationSummary {
    results: OptimizationResult[];
    periodLabel: string;
    totalMonths: number;
    globalMean: number;
    globalStdDev: number;
    optimalCount: number;
    nonOptimalCount: number;
    threshold: number;
}

/**
 * Fetches demand data for multiple months (period range) from Firestore,
 * then runs z-score analysis to flag optimal/non-optimal haltes.
 *
 * @param startMonth  e.g. "2026-01"
 * @param endMonth    e.g. "2026-06"
 * @param zThreshold  z-score below which a halte is non-optimal (default -1.0)
 */
export const optimizationService = {
    async runOptimization(
        startMonth: string,
        endMonth: string,
        zThreshold: number = -1.0
    ): Promise<OptimizationSummary> {
        // Parse start/end into year+month pairs
        const months = getMonthRange(startMonth, endMonth);

        // Aggregate demand per halte across all months
        const aggregated = Array(halteList.length).fill(0);

        const firestoreDb = db;
        if (firestoreDb) {
            for (const { bulan, tahun } of months) {
                try {
                    const q = query(
                        collection(firestoreDb, "demand"),
                        where("bulan", "==", bulan),
                        where("tahun", "==", tahun),
                        where("routeId", "==", "RUTE_14")
                    );
                    const snapshot = await getDocs(q);
                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        const idx = halteList.indexOf(data.namaHalte);
                        if (idx !== -1) {
                            aggregated[idx] += data.jumlahPenumpang || 0;
                        }
                    });
                } catch (e) {
                    console.error(`Error fetching demand for ${tahun}-${bulan}`, e);
                }
            }
        }

        // Compute statistics
        const totalMonths = months.length || 1;
        const averages = aggregated.map((total) => total / totalMonths);

        const globalMean =
            averages.reduce((sum, v) => sum + v, 0) / averages.length;
        const variance =
            averages.reduce((sum, v) => sum + Math.pow(v - globalMean, 2), 0) /
            averages.length;
        const globalStdDev = Math.sqrt(variance);

        // Build results
        const results: OptimizationResult[] = halteList.map((nama, i) => {
            const zScore =
                globalStdDev > 0
                    ? (averages[i] - globalMean) / globalStdDev
                    : 0;
            return {
                halteIndex: i,
                namaHalte: nama,
                totalDemand: aggregated[i],
                averageDemand: Math.round(averages[i] * 10) / 10,
                isOptimal: zScore >= zThreshold,
                zScore: Math.round(zScore * 100) / 100,
            };
        });

        const optimalCount = results.filter((r) => r.isOptimal).length;

        const periodLabel = `${startMonth} s/d ${endMonth}`;

        return {
            results,
            periodLabel,
            totalMonths,
            globalMean: Math.round(globalMean * 10) / 10,
            globalStdDev: Math.round(globalStdDev * 10) / 10,
            optimalCount,
            nonOptimalCount: results.length - optimalCount,
            threshold: zThreshold,
        };
    },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getMonthRange(
    start: string,
    end: string
): { bulan: number; tahun: number }[] {
    const [sy, sm] = start.split("-").map(Number);
    const [ey, em] = end.split("-").map(Number);

    const result: { bulan: number; tahun: number }[] = [];
    let y = sy;
    let m = sm;

    while (y < ey || (y === ey && m <= em)) {
        result.push({ bulan: m, tahun: y });
        m++;
        if (m > 12) {
            m = 1;
            y++;
        }
    }
    return result;
}
