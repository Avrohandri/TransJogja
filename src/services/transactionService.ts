import { collection, query, orderBy, limit, getDocs, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase-config";

export interface Transaction {
    id?: string;
    transactionId: string;
    userId: string;
    halteMasuk: string;
    waktuTransaksi: Date | null;
    statusPembayaran: string;
}

const dummyTransactions: Transaction[] = [
    { transactionId: "TRX-001", userId: "USR-014", halteMasuk: "Boulevard UII", waktuTransaksi: new Date(), statusPembayaran: "Paid" },
    { transactionId: "TRX-002", userId: "USR-892", halteMasuk: "UGM", waktuTransaksi: new Date(Date.now()-300000), statusPembayaran: "Paid" },
    { transactionId: "TRX-003", userId: "USR-451", halteMasuk: "Terminal Condongcatur", waktuTransaksi: new Date(Date.now()-600000), statusPembayaran: "Paid" }
];

export const transactionService = {
    subscribeLiveTransactions(callback: (data: Transaction[]) => void) {
        if (!db) {
            callback(dummyTransactions);
            return () => {};
        }

        const q = query(collection(db, "transactions"), orderBy("waktuTransaksi", "desc"), limit(5));
        return onSnapshot(q, (snapshot) => {
            const transactions: Transaction[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    transactionId: data.transactionId,
                    userId: data.userId,
                    halteMasuk: data.halteMasuk,
                    statusPembayaran: data.statusPembayaran,
                    waktuTransaksi: data.waktuTransaksi?.toDate() || null
                };
            });
            if (transactions.length === 0) callback(dummyTransactions);
            else callback(transactions);
        }, (error) => {
            console.error("Error listening to transactions:", error);
            callback(dummyTransactions);
        });
    },

    async getTransactionsByDate(dateString: string): Promise<Transaction[]> {
        if (!db) return dummyTransactions;

        const start = new Date(dateString);
        start.setHours(0,0,0,0);
        const end = new Date(dateString);
        end.setHours(23,59,59,999);

        try {
            const q = query(
                collection(db, "transactions"),
                where("waktuTransaksi", ">=", start),
                where("waktuTransaksi", "<=", end),
                orderBy("waktuTransaksi", "desc")
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    transactionId: data.transactionId,
                    userId: data.userId,
                    halteMasuk: data.halteMasuk,
                    statusPembayaran: data.statusPembayaran,
                    waktuTransaksi: data.waktuTransaksi?.toDate() || null
                };
            });
        } catch(e) {
            console.error("Error getTransactionsByDate", e);
            return dummyTransactions;
        }
    }
};
