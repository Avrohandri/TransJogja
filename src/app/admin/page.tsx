"use client";
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { transactionService, Transaction } from '@/services/transactionService';
import { demandService, halteList } from '@/services/demandService';
import { authService } from '@/services/authService';

// Dynamic import at module level — prevents remount on every parent render
const UserMap = dynamic(() => import('@/components/user/UserMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-[#e0e3e5] text-[#3f4945]">Memuat Peta...</div>
});

export default function Dashboard() {
  const router = useRouter();
  const [liveTransactions, setLiveTransactions] = useState<Transaction[]>([]);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [halteData, setHalteData] = useState<number[]>(Array(35).fill(0));
  const [displayMonth, setDisplayMonth] = useState("");
  const [inputData, setInputData] = useState<number[]>(Array(35).fill(0));
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ fullname?: string; email?: string; role?: string } | null>(null);
  
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Auth Guard
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login");
      } else {
        setCurrentUser(user);
        setIsAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    setDisplayMonth(currentMonth);

    const unsubscribe = transactionService.subscribeLiveTransactions((data) => {
      setLiveTransactions(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (displayMonth) {
      const [tahun, bulan] = displayMonth.split('-');
      demandService.getDemandByMonth(bulan, tahun).then(data => {
        setHalteData(data);
        setInputData(data);
      });
    }
  }, [displayMonth]);

  const handleSignOut = async () => {
    await authService.logout();
    router.push("/login");
  };

  const totalDemand = halteData.reduce((a, b) => a + b, 0);
  const teramaiIndex = halteData.reduce((maxIdx, val, idx, arr) => val > arr[maxIdx] ? idx : maxIdx, 0);
  const teramai = halteData[teramaiIndex] > 0 ? halteList[teramaiIndex] : "-";

  const handleSaveInput = async () => {
    setIsSaving(true);
    try {
      const [tahun, bulan] = displayMonth.split('-');
      await demandService.saveDemand(bulan, tahun, inputData);
      setHalteData([...inputData]);
      setIsInputModalOpen(false);
      alert("Data demand berhasil disimpan!");
    } catch {
      alert("Gagal menyimpan data");
    } finally {
      setIsSaving(false);
    }
  };

  // Chart Rendering Logic
  const svgWidth = 700;
  const svgHeight = 120;
  const padding = 10;
  const maxVal = Math.max(...halteData, 10) * 1.2;

  const points = halteData.map((val, i) => {
      const x = padding + (i / (halteData.length - 1 || 1)) * (svgWidth - 2 * padding);
      const y = svgHeight - padding - (val / maxVal) * (svgHeight - 2 * padding);
      return { x, y, val, label: halteList[i] };
  });

  let dLine = points.length > 0 ? `M ${points[0].x},${points[0].y} ` : "";
  points.forEach(p => dLine += `L ${p.x},${p.y} `);
  const dArea = points.length > 0 ? dLine + `L ${points[points.length - 1].x},${svgHeight} L ${points[0].x},${svgHeight} Z` : "";

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (isAuthLoading) {
    return (
      <div className="bg-[#f4f7f6] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#00342b] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#3f4945] text-sm font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f7f6] text-[#191c1e] font-sans antialiased min-h-screen p-4">
      {/* Top Navbar */}
      <header className="bg-white rounded-xl px-6 py-3 shadow-sm mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 py-1">
          <div className="relative w-9 h-9 flex items-center justify-center bg-[#e0e3e5] rounded-full border border-[#bfc9c4] text-xl">
            🚌
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#006c49] rounded-full border-2 border-white"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#191c1e]">{currentUser?.fullname || currentUser?.email?.split('@')[0] || "Administrator"}</span>
            <span className="text-[10px] text-[#3f4945] font-medium">Administrator</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-[#3f4945] hover:text-[#00342b] p-2 rounded-full transition-colors relative" title="Notifikasi">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#ba1a1a] rounded-full border border-white animate-pulse"></span>
          </button>
          <button onClick={handleSignOut} className="text-[#3f4945] hover:text-[#ba1a1a] p-2 rounded-full transition-colors" title="Sign out">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column */}
        <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-[#00342b]">Data Input</h2>
              <p className="text-sm text-[#3f4945]">Data input harian penumpang masuk bus</p>
            </div>
            <div className="flex flex-col gap-2">
              {liveTransactions.length === 0 ? (
                <p className="text-sm text-center text-[#3f4945] py-4">Memuat data transaksi...</p>
              ) : (
                liveTransactions.map((trx, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border-b border-[#e0e3e5] last:border-0 hover:bg-[#f2f4f6] transition-colors rounded-lg">
                    <div className="flex flex-col">
                      <p className="text-sm font-bold">{trx.transactionId}</p>
                      <p className="text-[11px] text-[#3f4945]">{trx.halteMasuk}</p>
                    </div>
                    <span className="px-2 py-1 bg-[#6cf8bb] text-[#00714d] text-[10px] font-bold rounded-full bg-opacity-20 border border-[#6cf8bb]">{trx.statusPembayaran}</span>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setIsTransactionsModalOpen(true)} className="w-full mt-4 py-2 px-4 border border-[#006c49] text-[#006c49] font-semibold text-sm rounded-lg hover:bg-[#f2f4f6] transition-colors flex items-center justify-center gap-2">
              Lihat Semua Input →
            </button>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm flex-grow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-xl font-bold text-[#00342b]">Data Demand Terakhir</h2>
                <input type="month" value={displayMonth} onChange={e => setDisplayMonth(e.target.value)} className="mt-1 bg-white text-[#191c1e] text-[12px] font-semibold rounded-md border border-[#e0e3e5] px-2 py-1 outline-none focus:border-[#00342b] w-32" />
              </div>
              <button onClick={() => setIsInputModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-[#00342b] text-white text-[11px] font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm">
                📝 Input Manual
              </button>
            </div>
            
            {/* INTERACTIVE LINE CHART */}
            <div 
              className="relative border-b border-l border-[#e0e3e5] mt-2 group cursor-crosshair" 
              style={{ height: '150px', overflow: 'visible' }}
              onMouseMove={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const xPos = e.clientX - rect.left;
                 const ratioX = svgWidth / rect.width;
                 const svgXPos = xPos * ratioX;
                 
                 let minDiff = Infinity;
                 let closestIdx = 0;
                 points.forEach((p, idx) => {
                    const diff = Math.abs(svgXPos - p.x);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestIdx = idx;
                    }
                 });
                 setHoverIndex(closestIdx);
              }}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                  <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00342b" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#00342b" stopOpacity="0" />
                      </linearGradient>
                  </defs>
                  <path d={dArea} fill="url(#chartGrad)" />
                  <path d={dLine} fill="none" stroke="#00342b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  {points.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="3" fill="#00342b" />
                  ))}
              </svg>

              {hoverIndex !== null && (
                  <>
                      {/* Tooltip */}
                      <div 
                          className="absolute flex flex-col items-center pointer-events-none z-10"
                          style={{
                              left: `${(points[hoverIndex].x / svgWidth) * 100}%`,
                              top: `${(points[hoverIndex].y / svgHeight) * 100}%`,
                              transform: 'translate(-50%, -100%)',
                              marginTop: '-8px'
                          }}
                      >
                          <div className="bg-[#2a2e33] text-white px-3 py-1.5 rounded shadow-lg flex flex-col items-center gap-0.5 whitespace-nowrap">
                              <span className="font-bold text-[13px]">{points[hoverIndex].val.toLocaleString()}</span>
                              <span className="text-gray-300 text-[10px]">{points[hoverIndex].label}</span>
                          </div>
                          <div className="w-2 h-2 bg-[#2a2e33] transform rotate-45 -mt-1"></div>
                      </div>
                      {/* Hover Line */}
                      <div 
                          className="absolute top-0 bottom-0 border-l border-dashed border-gray-400 pointer-events-none"
                          style={{ left: `${(points[hoverIndex].x / svgWidth) * 100}%` }}
                      ></div>
                  </>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-[#f2f4f6] p-2 rounded-lg border border-[#e0e3e5]">
                <p className="text-[10px] font-bold text-[#3f4945] mb-1">Total Penumpang</p>
                <p className="text-lg font-bold text-[#00342b]">{totalDemand.toLocaleString()}</p>
              </div>
              <div className="bg-[#f2f4f6] p-2 rounded-lg border border-[#e0e3e5]">
                <p className="text-[10px] font-bold text-[#3f4945] mb-1">Halte Teramai</p>
                <p className="text-sm font-bold text-[#00342b] truncate" title={teramai}>{teramai}</p>
              </div>
              <div className="bg-[#f2f4f6] p-2 rounded-lg border border-[#e0e3e5]">
                <p className="text-[10px] font-bold text-[#3f4945] mb-1">Kenaikan Demand</p>
                <p className="text-lg font-bold text-[#006c49]">+15%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col relative overflow-hidden h-full">
            <div className="mb-4 z-10 relative flex items-start justify-between">
              <div className="bg-white bg-opacity-90 p-2 rounded-lg inline-block w-max backdrop-blur-sm">
                <h2 className="text-xl font-bold text-[#00342b]">Peta Rute</h2>
                <p className="text-sm text-[#3f4945]">Visualisasi rute Trans Jogja berdasarkan halte aktif</p>
              </div>
              <button 
                onClick={() => router.push("/admin/optimization")} 
                className="flex items-center gap-2 px-4 py-2 bg-[#00342b] text-white text-[12px] font-semibold rounded-lg hover:bg-[#004d3b] transition-all shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Optimasi Halte
              </button>
            </div>
            
            <div className="rounded-lg overflow-hidden relative bg-[#e0e3e5] flex-grow min-h-[400px]">
              <UserMap isDetail={true} />
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {isInputModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col" style={{maxHeight:'90vh'}}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0e3e5] flex-shrink-0">
              <div>
                <h3 className="text-xl font-bold text-[#00342b]">Input Data Demand Manual</h3>
                <p className="text-[11px] text-[#3f4945] mt-0.5">Rute 14 — 35 Halte</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                    <label className="text-[10px] text-[#3f4945] font-medium mb-1">Bulan / Tahun</label>
                    <input 
                      type="month" 
                      value={displayMonth} 
                      onChange={e => setDisplayMonth(e.target.value)} 
                      className="border border-[#e0e3e5] rounded-lg px-3 py-1.5 focus:border-[#00342b] outline-none text-[#191c1e] text-sm" 
                    />
                </div>
                <button onClick={() => setIsInputModalOpen(false)} className="text-[#3f4945] hover:text-[#ba1a1a] p-2 rounded-full font-bold">✕</button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <div className="grid grid-cols-1 gap-2">
                {halteList.map((nama, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f2f4f6] transition-colors">
                    <span className="text-[11px] font-semibold text-[#00342b] bg-[#00342b] bg-opacity-10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <label className="text-sm text-[#191c1e] flex-1 min-w-0 truncate" title={nama}>{nama}</label>
                    <input 
                      type="number" min="0" 
                      value={inputData[i]}
                      onChange={e => {
                        const newArr = [...inputData];
                        newArr[i] = parseInt(e.target.value) || 0;
                        setInputData(newArr);
                      }}
                      className="w-24 border border-[#e0e3e5] rounded-lg px-3 py-1.5 text-sm text-[#191c1e] text-right outline-none transition-colors focus:border-[#00342b]"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#e0e3e5] bg-[#f2f4f6] rounded-b-2xl flex-shrink-0">
              <p className="text-[11px] text-[#3f4945]">Pastikan data sudah benar sebelum menyimpan.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsInputModalOpen(false)} className="px-4 py-2 border border-[#e0e3e5] text-[#3f4945] text-[12px] font-semibold rounded-lg hover:bg-white">Batal</button>
                <button onClick={handleSaveInput} disabled={isSaving} className="px-5 py-2 bg-[#00342b] text-white text-[12px] font-semibold rounded-lg hover:opacity-90">{isSaving ? "Menyimpan..." : "Simpan Data"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isTransactionsModalOpen && (
        <TransactionsModal 
          onClose={() => setIsTransactionsModalOpen(false)} 
        />
      )}
    </div>
  );
}

// Sub-component for Transactions Modal to manage its own complex state
function TransactionsModal({ onClose }: { onClose: () => void }) {
  const [downloadDate, setDownloadDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [modalTransactions, setModalTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    transactionService.getTransactionsByDate(downloadDate).then(data => {
      setModalTransactions(data);
      setIsLoading(false);
      
      // Auto cleanup older than 7 days (triggered gracefully in the background)
      // transactionService.cleanupOldTransactions?.();
    });
  }, [downloadDate]);

  const handleDownload = () => {
    import('@/services/csvExportService').then(({ csvExportService }) => {
       csvExportService.downloadCSV(modalTransactions, downloadDate);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col" style={{maxHeight:'85vh'}}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0e3e5] flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-[#00342b]">Data Input Harian</h3>
            <p className="text-[11px] text-[#3f4945] mt-0.5">Seluruh input penumpang pada tanggal terpilih</p>
          </div>
          <button onClick={onClose} className="text-[#3f4945] hover:text-[#ba1a1a] p-2 rounded-full font-bold">✕</button>
        </div>
        
        <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-2">
          {isLoading ? (
             <p className="text-sm text-center text-[#3f4945] py-4">Memuat data...</p>
          ) : modalTransactions.length === 0 ? (
             <p className="text-sm text-center text-[#3f4945] py-4">Tidak ada transaksi pada tanggal ini.</p>
          ) : (
            modalTransactions.map((trx, idx) => {
              const timeStr = trx.waktuTransaksi ? new Date(trx.waktuTransaksi).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) : '';
              return (
                <div key={idx} className="flex items-center justify-between p-3 border border-[#e0e3e5] rounded-lg hover:bg-[#f2f4f6] transition-colors">
                  <div>
                    <p className="text-sm font-bold text-[#191c1e]">{trx.transactionId} <span className="font-normal text-[#3f4945]">| {trx.userId}</span></p>
                    <p className="text-[11px] text-[#3f4945] mt-0.5">{timeStr} - {trx.halteMasuk}</p>
                  </div>
                  <span className="px-3 py-1 bg-[#6cf8bb] text-[#00714d] text-[10px] font-bold rounded-full bg-opacity-20 border border-[#6cf8bb]">{trx.statusPembayaran}</span>
                </div>
              );
            })
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#e0e3e5] flex-shrink-0 bg-[#f2f4f6] rounded-b-2xl">
            <p className="text-[12px] font-semibold text-[#00342b] mb-2">Pilih Tanggal & Unduh Data (.csv)</p>
            <div className="flex gap-2">
                <input 
                  type="date" 
                  value={downloadDate}
                  onChange={e => setDownloadDate(e.target.value)}
                  className="flex-1 text-sm border border-[#e0e3e5] rounded-lg px-3 py-1.5 focus:border-[#00342b] outline-none text-[#191c1e]"
                />
                <button onClick={handleDownload} className="px-4 py-1.5 bg-[#00342b] text-white text-[12px] font-semibold rounded-lg hover:opacity-90 flex items-center gap-1 shadow-sm transition-opacity">
                    Unduh
                </button>
            </div>
            <p className="text-[10px] text-[#ba1a1a] mt-2 italic flex items-start gap-1">
                <span>ⓘ File lama (lebih dari 7 hari) akan terhapus otomatis dari database untuk menghemat kapasitas.</span>
            </p>
        </div>
      </div>
    </div>
  );
}
