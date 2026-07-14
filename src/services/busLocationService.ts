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

const dummyBuses: BusLocation[] = [
    {
        busId: "BUS-14A",
        routeId: "RUTE_14",
        latitude: -7.759144, // Coordinates near Adisucipto
        longitude: 110.432653,
        speed: 25,
        heading: 90,
        status: "active",
        updatedAt: null
    }
];

export const busLocationService = {
    subscribeLiveBuses(routeId: string, callback: (buses: BusLocation[]) => void) {
        if (!db) {
            callback(dummyBuses);
            return () => {};
        }

        const q = query(
            collection(db, "bus_locations"),
            where("routeId", "==", routeId),
            where("status", "==", "active")
        );
        return onSnapshot(q, (snapshot) => {
            const buses = snapshot.docs.map(doc => doc.data() as BusLocation);
            if (buses.length === 0) {
                callback(dummyBuses);
            } else {
                callback(buses);
            }
        }, (error) => {
            console.error("Error listening to buses:", error);
            callback(dummyBuses);
        });
    }
};
