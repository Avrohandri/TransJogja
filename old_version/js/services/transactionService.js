import { collection, query, orderBy, onSnapshot, limit, getDocs, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { db } from "../firebase-config.js";

// Dummy fallback
const dummyTransactions = [
    { transactionId: "TRX-001", userId: "USR-014", halteMasuk: "Boulevard UII", waktuTransaksi: new Date(), statusPembayaran: "Paid" },
    { transactionId: "TRX-002", userId: "USR-892", halteMasuk: "UGM", waktuTransaksi: new Date(Date.now()-300000), statusPembayaran: "Paid" },
    { transactionId: "TRX-003", userId: "USR-451", halteMasuk: "Terminal Condongcatur", waktuTransaksi: new Date(Date.now()-600000), statusPembayaran: "Paid" }
];

export const transactionService = {
    subscribeLiveTransactions(callback) {
        if (!db) {
            callback(dummyTransactions);
            return () => {};
        }

        const q = query(collection(db, "transactions"), orderBy("waktuTransaksi", "desc"), limit(5));
        return onSnapshot(q, (snapshot) => {
            const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), waktuTransaksi: doc.data().waktuTransaksi?.toDate() }));
            if (transactions.length === 0) callback(dummyTransactions); // fallback if empty DB
            else callback(transactions);
        }, (error) => {
            console.error("Error listening to transactions:", error);
            callback(dummyTransactions);
        });
    },

    async getTransactionsByDate(dateString) {
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
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), waktuTransaksi: doc.data().waktuTransaksi?.toDate() }));
        } catch(e) {
            console.error("Error getTransactionsByDate", e);
            return dummyTransactions;
        }
    }
};
