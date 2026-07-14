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
  loading: () => <div className="w-full h-full flex items-center justify-center bg-[#E6D5C3] text-[#8D7B68]">Memuat Peta...</div>
});

const WayangIcon = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

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
  const [showNotif, setShowNotif] = useState(false);
  const [adminNotifs, setAdminNotifs] = useState([
    { id: 1, title: "Sistem Terhubung", message: "Koneksi ke database layanan aktif.", time: "1 jam yang lalu" }
  ]);

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
      
      // Push new notification
      setAdminNotifs(prev => [{
        id: Date.now(),
        title: "Pembaruan Data",
        message: `Data penumpang untuk periode ${bulan}/${tahun} berhasil disimpan.`,
        time: "Baru saja"
      }, ...prev]);

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
      <div className="bg-[#FAF8F5] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#5C3A21] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8D7B68] text-sm font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] text-[#2D1E12] font-sans antialiased min-h-screen p-4 relative">
      {/* Background Batik subtle overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-cover bg-center" style={{ backgroundImage: "url('/images/batik_bg.png')" }} />
      
      <div className="relative z-10">
        {/* Top Navbar */}
        <header className="bg-white rounded-xl px-6 py-3 shadow-sm border border-[#E6D5C3] mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3 py-1">
            <div className="relative w-10 h-10 flex items-center justify-center bg-[#F2EAE1] rounded-full border border-[#D1C7BD] text-xl">
              <WayangIcon size={20} color="#5C3A21" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#C59B6D] rounded-full border-2 border-white"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-serif font-bold text-[#2D1E12]">{currentUser?.fullname || currentUser?.email?.split('@')[0] || "Administrator"}</span>
              <span className="text-[10px] text-[#8D7B68] font-medium tracking-wide uppercase">Abdi Dalem (Admin)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 relative">
            <button 
              onClick={() => setShowNotif(!showNotif)}
              className="text-[#8D7B68] hover:bg-[#F2EAE1] hover:text-[#5C3A21] p-2 rounded-full transition-colors relative" 
              title="Notifikasi"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              {adminNotifs.length > 0 && (
                 <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#A73A3A] rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>
            
            {showNotif && (
              <div className="absolute top-full right-12 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E6D5C3] overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                <div className="px-4 py-3 border-b border-[#E6D5C3] flex items-center justify-between bg-[#FAF8F5]">
                  <h3 className="font-serif font-bold text-[#5C3A21] text-sm">Pemberitahuan Admin</h3>
                  <span className="text-[10px] font-bold bg-[#C59B6D] text-white px-2 py-0.5 rounded-full">{adminNotifs.length} Baru</span>
                </div>
                <div className="flex flex-col max-h-60 overflow-y-auto">
                  {adminNotifs.map(notif => (
                    <div key={notif.id} className="p-3 border-b border-[#E6D5C3] bg-white hover:bg-[#F2EAE1] transition-colors cursor-pointer">
                      <p className="text-xs font-bold text-[#2D1E12]">{notif.title}</p>
                      <p className="text-[10px] text-[#8D7B68] mt-0.5 leading-snug">{notif.message}</p>
                      <p className="text-[9px] text-[#C59B6D] mt-1 font-bold">{notif.time}</p>
                    </div>
                  ))}
                  {adminNotifs.length === 0 && (
                    <p className="p-4 text-center text-xs text-[#8D7B68]">Belum ada notifikasi.</p>
                  )}
                </div>
              </div>
            )}

            <button onClick={handleSignOut} className="text-[#8D7B68] hover:bg-[#F2EAE1] hover:text-[#A73A3A] p-2 rounded-full transition-colors" title="Keluar">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column */}
          <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E6D5C3]">
              <div className="mb-4">
                <h2 className="text-xl font-serif font-bold text-[#5C3A21]">Data Riwayat</h2>
                <p className="text-sm text-[#8D7B68] font-light">Laporan masuk pengguna layanan</p>
              </div>
              <div className="flex flex-col gap-2">
                {liveTransactions.length === 0 ? (
                  <p className="text-sm text-center text-[#8D7B68] py-4 italic">Memuat data transaksi...</p>
                ) : (
                  liveTransactions.map((trx, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 border-b border-[#E6D5C3] last:border-0 hover:bg-[#F2EAE1] transition-colors rounded-lg">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-[#2D1E12]">{trx.transactionId}</p>
                        <p className="text-[11px] text-[#8D7B68]">{trx.halteMasuk}</p>
                      </div>
                      <span className="px-3 py-1 bg-[#E6D5C3] text-[#5C3A21] text-[10px] font-bold rounded-full border border-[#D1C7BD]">{trx.statusPembayaran}</span>
                    </div>
                  ))
                )}
              </div>
              <button onClick={() => setIsTransactionsModalOpen(true)} className="w-full mt-5 py-2.5 px-4 border border-[#C59B6D] text-[#5C3A21] font-semibold text-sm rounded-lg hover:bg-[#F2EAE1] transition-colors flex items-center justify-center gap-2">
                Pirsani Sedaya (Lihat Semua) →
              </button>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E6D5C3] flex-grow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#5C3A21]">Kepadatan Halte</h2>
                  <input type="month" value={displayMonth} onChange={e => setDisplayMonth(e.target.value)} className="mt-1.5 bg-white text-[#2D1E12] text-[12px] font-semibold rounded-md border border-[#E6D5C3] px-2 py-1 outline-none focus:border-[#5C3A21] w-32 shadow-sm" />
                </div>
                <button onClick={() => setIsInputModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-[#5C3A21] text-white text-[11px] font-semibold rounded-lg hover:bg-[#4A2E1A] transition-colors shadow-sm">
                  📝 Catat Manual
                </button>
              </div>
              
              {/* INTERACTIVE LINE CHART */}
              <div 
                className="relative border-b border-l border-[#E6D5C3] mt-4 group cursor-crosshair" 
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
                            <stop offset="0%" stopColor="#C59B6D" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#C59B6D" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={dArea} fill="url(#chartGrad)" />
                    <path d={dLine} fill="none" stroke="#5C3A21" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    {points.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#5C3A21" stroke="#fff" strokeWidth="1.5" />
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
                            <div className="bg-[#4A2E1A] text-[#FAF8F5] px-3 py-1.5 rounded shadow-lg flex flex-col items-center gap-0.5 whitespace-nowrap border border-[#C59B6D]">
                                <span className="font-bold text-[13px]">{points[hoverIndex].val.toLocaleString()}</span>
                                <span className="text-[#D1C7BD] text-[10px]">{points[hoverIndex].label}</span>
                            </div>
                            <div className="w-2 h-2 bg-[#4A2E1A] transform rotate-45 -mt-1 border-b border-r border-[#C59B6D]"></div>
                        </div>
                        {/* Hover Line */}
                        <div 
                            className="absolute top-0 bottom-0 border-l border-dashed border-[#C59B6D] pointer-events-none"
                            style={{ left: `${(points[hoverIndex].x / svgWidth) * 100}%` }}
                        ></div>
                    </>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="bg-[#F2EAE1] p-2.5 rounded-lg border border-[#E6D5C3]">
                  <p className="text-[10px] font-bold text-[#8D7B68] mb-1">Gunggung Penumpang</p>
                  <p className="text-lg font-serif font-bold text-[#5C3A21]">{totalDemand.toLocaleString()}</p>
                </div>
                <div className="bg-[#F2EAE1] p-2.5 rounded-lg border border-[#E6D5C3]">
                  <p className="text-[10px] font-bold text-[#8D7B68] mb-1">Halte Tersibuk</p>
                  <p className="text-sm font-serif font-bold text-[#5C3A21] truncate" title={teramai}>{teramai}</p>
                </div>
                <div className="bg-[#F2EAE1] p-2.5 rounded-lg border border-[#E6D5C3]">
                  <p className="text-[10px] font-bold text-[#8D7B68] mb-1">Kenaikan</p>
                  <p className="text-lg font-serif font-bold text-[#8D7B68]">+15%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E6D5C3] flex flex-col relative overflow-hidden h-full">
              <div className="mb-4 z-10 relative flex items-start justify-between">
                <div className="bg-white bg-opacity-95 p-3 rounded-lg inline-block w-max backdrop-blur-md border border-[#E6D5C3] shadow-sm">
                  <h2 className="text-xl font-serif font-bold text-[#5C3A21]">Peta Rute</h2>
                  <p className="text-sm text-[#8D7B68] font-light">Visualisasi jalur operasional Trans Jogja</p>
                </div>
                <button 
                  onClick={() => router.push("/admin/optimization")} 
                  className="flex items-center gap-2 px-4 py-2 bg-[#5C3A21] text-white text-[12px] font-semibold rounded-lg hover:bg-[#4A2E1A] transition-all shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  Optimasi Layanan
                </button>
              </div>
              
              <div className="rounded-xl overflow-hidden relative bg-[#E6D5C3] flex-grow min-h-[400px] border border-[#E6D5C3]">
                <UserMap isDetail={true} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {isInputModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col border border-[#C59B6D]" style={{maxHeight:'90vh'}}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6D5C3] flex-shrink-0 bg-[#FAF8F5] rounded-t-2xl">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#5C3A21]">Catat Data Manual</h3>
                <p className="text-[11px] text-[#8D7B68] mt-0.5 font-light">Rute 14 — 35 Halte</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <label className="text-[10px] text-[#8D7B68] font-bold uppercase mb-1">Sasi / Taun</label>
                    <input 
                      type="month" 
                      value={displayMonth} 
                      onChange={e => setDisplayMonth(e.target.value)} 
                      className="border border-[#E6D5C3] rounded-lg px-3 py-1.5 focus:border-[#5C3A21] outline-none text-[#2D1E12] text-sm shadow-sm" 
                    />
                </div>
                <button onClick={() => setIsInputModalOpen(false)} className="text-[#8D7B68] hover:text-[#A73A3A] p-2 rounded-full font-bold bg-white shadow-sm border border-[#E6D5C3]">✕</button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4 bg-white relative">
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-cover bg-center" style={{ backgroundImage: "url('/images/batik_bg.png')" }} />
              <div className="grid grid-cols-1 gap-2 relative z-10">
                {halteList.map((nama, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F2EAE1] border border-transparent hover:border-[#E6D5C3] transition-colors">
                    <span className="text-[11px] font-bold text-[#5C3A21] bg-[#F2EAE1] border border-[#D1C7BD] rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <label className="text-sm text-[#2D1E12] flex-1 min-w-0 truncate font-medium" title={nama}>{nama}</label>
                    <input 
                      type="number" min="0" 
                      value={inputData[i]}
                      onChange={e => {
                        const newArr = [...inputData];
                        newArr[i] = parseInt(e.target.value) || 0;
                        setInputData(newArr);
                      }}
                      className="w-24 border border-[#E6D5C3] rounded-lg px-3 py-1.5 text-sm text-[#2D1E12] text-right outline-none transition-colors focus:border-[#5C3A21] shadow-inner"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#E6D5C3] bg-[#FAF8F5] rounded-b-2xl flex-shrink-0">
              <p className="text-[11px] text-[#8D7B68] font-light">Priksa malih sakderengipun disimpen (Pastikan kembali).</p>
              <div className="flex gap-3">
                <button onClick={() => setIsInputModalOpen(false)} className="px-4 py-2 border border-[#E6D5C3] text-[#8D7B68] text-[12px] font-bold rounded-lg hover:bg-white shadow-sm">Batal</button>
                <button onClick={handleSaveInput} disabled={isSaving} className="px-5 py-2 bg-[#5C3A21] text-white text-[12px] font-bold rounded-lg hover:bg-[#4A2E1A] shadow-md transition-colors">{isSaving ? "Nyimpen..." : "Simpan Data"}</button>
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

// Sub-component for Transactions Modal
function TransactionsModal({ onClose }: { onClose: () => void }) {
  const [downloadDate, setDownloadDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [modalTransactions, setModalTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    transactionService.getTransactionsByDate(downloadDate).then(data => {
      setModalTransactions(data);
      setIsLoading(false);
    });
  }, [downloadDate]);

  const handleDownload = () => {
    import('@/services/csvExportService').then(({ csvExportService }) => {
       csvExportService.downloadCSV(modalTransactions, downloadDate);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col border border-[#C59B6D]" style={{maxHeight:'85vh'}}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6D5C3] flex-shrink-0 bg-[#FAF8F5] rounded-t-2xl">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#5C3A21]">Riwayat Harian</h3>
            <p className="text-[11px] text-[#8D7B68] mt-0.5 font-light">Seluruh entri pada tanggal terpilih</p>
          </div>
          <button onClick={onClose} className="text-[#8D7B68] hover:text-[#A73A3A] p-2 rounded-full font-bold bg-white shadow-sm border border-[#E6D5C3]">✕</button>
        </div>
        
        <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-3 bg-white relative">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-cover bg-center" style={{ backgroundImage: "url('/images/batik_bg.png')" }} />
          <div className="relative z-10">
            {isLoading ? (
               <p className="text-sm text-center text-[#8D7B68] py-4 italic">Memuat data...</p>
            ) : modalTransactions.length === 0 ? (
               <p className="text-sm text-center text-[#8D7B68] py-4 italic">Kosong pada tanggal ini.</p>
            ) : (
              modalTransactions.map((trx, idx) => {
                const timeStr = trx.waktuTransaksi ? new Date(trx.waktuTransaksi).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) : '';
                return (
                  <div key={idx} className="flex items-center justify-between p-3 mb-2 border border-[#E6D5C3] rounded-xl hover:bg-[#F2EAE1] transition-colors shadow-sm bg-white">
                    <div>
                      <p className="text-sm font-bold text-[#2D1E12]">{trx.transactionId} <span className="font-normal text-[#8D7B68]">| {trx.userId}</span></p>
                      <p className="text-[11px] text-[#8D7B68] mt-0.5">{timeStr} - {trx.halteMasuk}</p>
                    </div>
                    <span className="px-3 py-1 bg-[#E6D5C3] text-[#5C3A21] text-[10px] font-bold rounded-full border border-[#D1C7BD]">{trx.statusPembayaran}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#E6D5C3] flex-shrink-0 bg-[#FAF8F5] rounded-b-2xl">
            <p className="text-[12px] font-bold text-[#5C3A21] mb-2">Pilih Tanggal & Unduh Arsip (.csv)</p>
            <div className="flex gap-2">
                <input 
                  type="date" 
                  value={downloadDate}
                  onChange={e => setDownloadDate(e.target.value)}
                  className="flex-1 text-sm border border-[#E6D5C3] rounded-lg px-3 py-1.5 focus:border-[#5C3A21] outline-none text-[#2D1E12] shadow-sm"
                />
                <button onClick={handleDownload} className="px-4 py-1.5 bg-[#5C3A21] text-white text-[12px] font-bold rounded-lg hover:bg-[#4A2E1A] flex items-center gap-1 shadow-md transition-colors">
                    Unduh Arsip
                </button>
            </div>
            <p className="text-[10px] text-[#A73A3A] mt-2 italic flex items-start gap-1 font-medium">
                <span>ⓘ Arsip lawas (lebih dari 7 hari) dihapus otomatis.</span>
            </p>
        </div>
      </div>
    </div>
  );
}
