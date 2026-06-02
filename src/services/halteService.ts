import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase-config";
import { halteList as fallbackHalteNames } from "./demandService";

export interface Halte {
  halteId: string;
  routeId: string;
  namaHalte: string;
  latitude: number;
  longitude: number;
  urutan: number;
  status: string;
}

// Import verified coordinates from roadRoute to keep them in sync
import { RUTE_14_HALTE_COORDS } from "../utils/roadRoute";

export const fallbackHaltes: Halte[] = fallbackHalteNames.map((nama, idx) => {
    const coordIndex = idx < RUTE_14_HALTE_COORDS.length ? idx : RUTE_14_HALTE_COORDS.length - 1;
    const lat = RUTE_14_HALTE_COORDS[coordIndex][0];
    const lon = RUTE_14_HALTE_COORDS[coordIndex][1];

    return {
        halteId: `HLT_${(idx + 1).toString().padStart(3, '0')}`,
        routeId: "RUTE_14",
        namaHalte: nama,
        latitude: lat,
        longitude: lon,
        urutan: idx + 1,
        status: "active"
    };
});

export const halteService = {
    async getHaltesByRoute(routeId: string): Promise<Halte[]> {
        if (!db) return fallbackHaltes;
        try {
            const q = query(
                collection(db, "halte"),
                where("routeId", "==", routeId),
                orderBy("urutan", "asc")
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                return fallbackHaltes;
            }
            return snapshot.docs.map(doc => doc.data() as Halte);
        } catch(e) {
            console.error("Error fetching haltes", e);
            return fallbackHaltes;
        }
    }
};
