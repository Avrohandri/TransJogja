import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase-config";


export interface BusLocation {
    busId: string;
    routeId: string;
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    status: string;
    updatedAt: Timestamp | null;
}

export const busLocationService = {
    subscribeLiveBuses(routeId: string, callback: (buses: BusLocation[]) => void) {
        if (!db) {
            // Fallback empty buses
            callback([]);
            return () => {};
        }

        const q = query(
            collection(db, "bus_locations"),
            where("routeId", "==", routeId),
            where("status", "==", "active")
        );
        return onSnapshot(q, (snapshot) => {
            const buses = snapshot.docs.map(doc => doc.data() as BusLocation);
            callback(buses);
        }, (error) => {
            console.error("Error listening to buses:", error);
            callback([]);
        });
    }
};
