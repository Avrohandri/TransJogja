import { collection, query, where, getDocs, doc, writeBatch, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { db } from "../firebase-config.js";

// Daftar halte statis sebagai referensi utama
export const halteList = [
    "Halte TJ Bandara Adisucipto", "Kantor Kesehatan Pelabuhan Yogya", "TJ RRU Disnaker", "Disnakertrans DI Yogyakarta", "Halte Jl. Solo Maguwo", "SMKN 1 Depok", "SDN 1 Depok", "Kantor Urusan Agama Depok", "MAN Sleman", "SMA Budi Mulia Dua", "Indomaret Pokoh Sambiroto", "Kantor Desa Wedomartani", "Simpang Babadan", "Simpang Selomartani", "Simpang Kabunan", "Halte Raya Kabunan", "RS Kemasan", "Dusun Kenthi", "Simpang Pasar Jangkang", "Tugu Batas Desa Yapah", "Timur Jembatan Yapah", "SMA Negeri Ngaglik", "Simpang Losari (Cozy)", "SPBU Mindi", "Lapangan Klidon", "SDN Sedomulyo", "RSU Gramedika", "Simpang Besi Jangkang", "Pusat Rehabilitasi YAKKUM", "Boulevard UII", "Simpang Degolan", "Dusun Kledokan (Soto Brakot)", "RS Panti Nugroho", "SMPN 4 Pakem", "Terminal Pakem"
];

let dummyHalteData = Array(35).fill(0).map(() => Math.floor(Math.random() * 50) + 10);

export const demandService = {
    async getDemandByMonth(bulan, tahun) {
        if (!db) return dummyHalteData;

        try {
            const q = query(
                collection(db, "demand"), 
                where("bulan", "==", parseInt(bulan)), 
                where("tahun", "==", parseInt(tahun)),
                where("routeId", "==", "RUTE_14")
            );
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                return dummyHalteData; // kembalikan fallback jika kosong
            }

            let dataArray = Array(35).fill(0);
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

    async saveDemand(bulan, tahun, demandDataArray) {
        if (!db) {
            dummyHalteData = [...demandDataArray];
            return true;
        }

        try {
            const batch = writeBatch(db);
            
            demandDataArray.forEach((jumlah, i) => {
                const namaHalte = halteList[i];
                const safeName = namaHalte.replace(/[^a-zA-Z0-9]/g, '');
                const docId = `RUTE_14_${tahun}_${bulan}_${safeName}`;
                
                const demandRef = doc(db, "demand", docId);
                batch.set(demandRef, {
                    halteId: `HLT-${(i+1).toString().padStart(3, '0')}`,
                    namaHalte: namaHalte,
                    routeId: "RUTE_14",
                    bulan: parseInt(bulan),
                    tahun: parseInt(tahun),
                    jumlahPenumpang: parseInt(jumlah) || 0,
                    updatedAt: serverTimestamp()
                }, { merge: true }); // Menggunakan pola Upsert (create or update)
            });

            await batch.commit();
            return true;
        } catch(e) {
            console.error("Error saving demand", e);
            throw e;
        }
    }
};
