import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase-config";
import { halteList } from "./demandService";

// Stable dummy demand data (same as demandService) — used when Firestore is unreachable
const dummyDemand: number[] = [
    42, 18, 25, 31, 12, 8, 19, 27, 35, 14,
    22, 16, 38, 11, 29, 45, 17, 23, 33, 9,
    20, 15, 41, 26, 13, 37, 10, 28, 44, 21,
    16, 32, 7,
];

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
    isUsingDummyData?: boolean;
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

        let isUsingDummyData = false;
        const firestoreDb = db;
        if (firestoreDb) {
            let totalFetched = 0;
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
                            totalFetched++;
                        }
                    });
                } catch (e) {
                    console.warn(`Firestore read failed for ${tahun}-${bulan}, using dummy data:`, e);
                }
            }
            // If nothing fetched from Firestore, fall back to dummy
            if (totalFetched === 0) {
                isUsingDummyData = true;
                dummyDemand.forEach((val, i) => { aggregated[i] = val * months.length; });
            }
        } else {
            // No Firestore connection at all — use dummy
            isUsingDummyData = true;
            dummyDemand.forEach((val, i) => { aggregated[i] = val * months.length; });
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
            isUsingDummyData,
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
