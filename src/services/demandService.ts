import { collection, query, where, getDocs, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase-config";

export const halteList = [
    // Segmen 1 — Halte 1–9
    "Halte TJ Bandara Adisucipto",      // 1
    "Kantor Kesehatan Pelabuhan Yogya",  // 2
    "TJ RRU Disnaker",                   // 3
    "Disnakertrans DI Yogyakarta",       // 4
    "SMKN 1 Depok",                      // 5
    "SDN 1 Depok",                       // 6
    "Kantor Urusan Agama Depok",         // 7
    "MAN 2 Sleman",                      // 8
    "SMA Budi Mulia Dua",                // 9
    // Segmen 2 — Halte 9–18
    "Indomaret Pokoh Sambiroto",         // 10
    "Kantor Kalurahan Wedomartani",      // 11
    "Simpang Babadan",                   // 12
    "Simpang Selomartani",               // 13
    "Simpang Kabunan",                   // 14
    "Raya Kabunan",                      // 15
    "RS Mitra Paramedika",               // 16
    "Dusun Kenthi Kemasan",              // 17
    "Simpang Pasar Jangkang",            // 18
    // Segmen 3 — Halte 18–27
    "Tugu Batas Desa Yapah",             // 19
    "Timur Jembatan Yapah",              // 20
    "SMA Negeri 2 Ngaglik",              // 21
    "Simpang Losari (Cozy)",             // 22
    "SPBU Mindi",                        // 23
    "Lapangan Klidon",                   // 24
    "SDN Selomulyo",                     // 25
    "RSU Gramedika",                     // 26
    "Simpang Besi Jangkang",             // 27
    // Segmen 4 — Halte 27–34
    "Pusat Rehabilitasi YAKKUM",         // 28
    "Boulevard UII",                     // 29
    "Simpang Degolan",                   // 30
    "Dusun Kledokan (Soto Brakot)",      // 31
    "RS Panti Nugroho",                  // 32
    "SMPN 4 Pakem",                      // 33
    "Terminal Pakem",                    // 34
];

const HALTE_COUNT = halteList.length; // 34
let dummyHalteData = Array(HALTE_COUNT).fill(0).map(() => Math.floor(Math.random() * 50) + 10);

export const demandService = {
    async getDemandByMonth(bulan: string | number, tahun: string | number): Promise<number[]> {
        const firestoreDb = db;
        if (!firestoreDb) return dummyHalteData;

        try {
            const q = query(
                collection(firestoreDb, "demand"), 
                where("bulan", "==", Number(bulan)), 
                where("tahun", "==", Number(tahun)),
                where("routeId", "==", "RUTE_14")
            );
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                return dummyHalteData;
            }

            const dataArray = Array(HALTE_COUNT).fill(0);
            snapshot.forEach(doc => {
                const data = doc.data();
                const index = halteList.indexOf(data.namaHalte);
                if(index !== -1) {
                    dataArray[index] = data.jumlahPenumpang;
                }
            });
            return dataArray;
        } catch(e) {
            console.error("Error fetching demand", e);
            return dummyHalteData;
        }
    },

    async saveDemand(bulan: string | number, tahun: string | number, demandDataArray: number[]) {
        const firestoreDb = db;
        if (!firestoreDb) {
            dummyHalteData = [...demandDataArray];
            return true;
        }

        try {
            const batch = writeBatch(firestoreDb);
            
            demandDataArray.forEach((jumlah, i) => {
                const namaHalte = halteList[i];
                const safeName = namaHalte.replace(/[^a-zA-Z0-9]/g, '');
                const docId = `RUTE_14_${tahun}_${bulan}_${safeName}`;
                
                const demandRef = doc(firestoreDb, "demand", docId);
                batch.set(demandRef, {
                    halteId: `HLT-${(i+1).toString().padStart(3, '0')}`,
                    namaHalte: namaHalte,
                    routeId: "RUTE_14",
                    bulan: Number(bulan),
                    tahun: Number(tahun),
                    jumlahPenumpang: Number(jumlah) || 0,
                    updatedAt: serverTimestamp()
                }, { merge: true });
            });

            await batch.commit();
            return true;
        } catch(e) {
            console.error("Error saving demand", e);
            throw e;
        }
    }
};
