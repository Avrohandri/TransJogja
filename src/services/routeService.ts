import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase-config";

export interface Route {
  routeId: string;
  routeName: string;
  startPoint: string;
  endPoint: string;
  fare: number;
  operatingHours: string;
  operatingDays: string;
  status: string;
}

const fallbackRoute: Route = {
  routeId: "RUTE_14",
  routeName: "Rute 14",
  startPoint: "Halte TJ Bandara Adisucipto",
  endPoint: "Terminal Pakem",
  fare: 3500,
  operatingHours: "05.30 - 21.30",
  operatingDays: "Setiap hari",
  status: "active"
};

export const routeService = {
    async getRoute(routeId: string): Promise<Route | null> {
        if (!db) return fallbackRoute;
        try {
            const docRef = doc(db, "routes", routeId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data() as Route;
            }
            return fallbackRoute;
        } catch(e) {
            console.error("Error fetching route", e);
            return fallbackRoute;
        }
    }
};
