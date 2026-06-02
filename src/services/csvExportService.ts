import { Transaction } from "./transactionService";

export const csvExportService = {
  downloadCSV(transactions: Transaction[], dateString: string) {
    if (!transactions || transactions.length === 0) {
      alert("Tidak ada data transaksi untuk tanggal tersebut.");
      return;
    }

    const headers = ["Nomor Transaksi", "Nomor User", "Halte Masuk", "Waktu Transaksi", "Status Pembayaran"];
    const rows = transactions.map((t) => {
      const timeStr = t.waktuTransaksi
        ? new Date(t.waktuTransaksi).toLocaleString("id-ID")
        : "";
      return [
        t.transactionId || "",
        t.userId || "",
        t.halteMasuk || "",
        timeStr,
        t.statusPembayaran || "",
      ]
        .map((val) => `"${val}"`)
        .join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `data_input_${dateString}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
