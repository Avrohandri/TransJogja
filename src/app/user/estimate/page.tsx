"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { halteService, Halte } from "@/services/halteService";
import { busLocationService, BusLocation } from "@/services/busLocationService";
import { calculateDistanceKm, calculateETA } from "@/utils/distance";
import { transactionService } from "@/services/transactionService";

const TRANSIT_URUTAN = 18;

function RouteEstimationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const fromId = searchParams.get("from");
    const toId = searchParams.get("to");

    const [fromHalte, setFromHalte] = useState<Halte | null>(null);
    const [toHalte, setToHalte] = useState<Halte | null>(null);
    const [buses, setBuses] = useState<BusLocation[]>([]);
    const [isBooking, setIsBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState("tunai");

    const paymentOptions = [
        { id: "tunai", label: "Tunai", price: "Rp3.500", desc: "per perjalanan" },
        { id: "nontunai", label: "Non-Tunai (E-Money / QRIS)", price: "Rp2.700", desc: "per perjalanan" },
        { id: "pelajar", label: "Pelajar", price: "Rp500", desc: "Kartu Berlangganan" },
        { id: "lansia", label: "Lansia & Disabilitas", price: "Rp2.000", desc: "per perjalanan" }
    ];
    
    useEffect(() => {
        if (!fromId || !toId) {
            router.push("/user/destination");
            return;
        }

        halteService.getHaltesByRoute("RUTE_14").then(data => {
            setFromHalte(data.find(h => h.halteId === fromId) || null);
            setToHalte(data.find(h => h.halteId === toId) || null);
        });

        const unsub = busLocationService.subscribeLiveBuses("RUTE_14", setBuses);
        return () => unsub();
    }, [fromId, toId, router]);

    if (!fromHalte || !toHalte) return (
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center gap-4">
            <div className="w-10 h-10 border-4 border-[#5C3A21] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#8D7B68] font-medium text-sm">Memuat estimasi...</p>
        </div>
    );

    // Calculate estimations
    const distanceTrip = calculateDistanceKm(fromHalte.latitude, fromHalte.longitude, toHalte.latitude, toHalte.longitude);
    const tripEta = calculateETA(distanceTrip, 25);

    let busEta = 0;
    if (buses.length > 0) {
        const nearestBus = buses.reduce<BusLocation>((closest, b) => {
            const dClosest = calculateDistanceKm(closest.latitude, closest.longitude, fromHalte.latitude, fromHalte.longitude);
            const dCurrent = calculateDistanceKm(b.latitude, b.longitude, fromHalte.latitude, fromHalte.longitude);
            return dCurrent < dClosest ? b : closest;
        }, buses[0]);
        const minBusDist = calculateDistanceKm(nearestBus.latitude, nearestBus.longitude, fromHalte.latitude, fromHalte.longitude);
        busEta = calculateETA(minBusDist, nearestBus.speed || 25);
    }

    // Determine Bus and Clusters
    const fromUrutan = fromHalte.urutan;
    const toUrutan = toHalte.urutan;
    
    const routeInfo = [];
    let requiresTransit = false;

    if (fromUrutan <= TRANSIT_URUTAN && toUrutan <= TRANSIT_URUTAN) {
        routeInfo.push({ name: "Bus 14.A", desc: "Melayani Cluster 1 (Jangkang - Pakem)" });
    } else if (fromUrutan >= TRANSIT_URUTAN && toUrutan >= TRANSIT_URUTAN) {
        routeInfo.push({ name: "Bus 14.B", desc: "Melayani Cluster 2 (Adisucipto - Jangkang)" });
    } else {
        requiresTransit = true;
        if (fromUrutan < TRANSIT_URUTAN) {
            routeInfo.push({ name: "Bus 14.A", desc: "Menuju Simpang Pasar Jangkang" });
            routeInfo.push({ name: "Bus 14.B", desc: "Melanjutkan ke tujuan (Cluster 2)" });
        } else {
            routeInfo.push({ name: "Bus 14.B", desc: "Menuju Simpang Pasar Jangkang" });
            routeInfo.push({ name: "Bus 14.A", desc: "Melanjutkan ke tujuan (Cluster 1)" });
        }
    }

    const handleBooking = async () => {
        setIsBooking(true);
        const success = await transactionService.createTransaction(fromHalte.namaHalte);
        if (success) {
            setShowPaymentModal(false);
            setBookingSuccess(true);
            setTimeout(() => setBookingSuccess(false), 4000);
        } else {
            alert("Gagal melakukan pemesanan. Silakan coba lagi.");
        }
        setIsBooking(false);
    };

    return (
        <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#2D1E12] flex flex-col relative pb-24">
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-cover bg-center" style={{ backgroundImage: "url('/images/batik_bg.png')" }} />
            
            {/* Header */}
            <div className="relative text-white px-4 py-4 flex flex-col pt-8" style={{ backgroundColor: "#5C3A21" }}>
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: "url('/images/batik_bg.png')" }} />
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <button onClick={() => router.back()} className="text-white hover:text-[#C59B6D] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <h1 className="font-serif font-bold text-lg tracking-wide">Estimasi Perjalanan</h1>
                </div>

                <div className="bg-[#4A2E1A] rounded-xl p-4 flex flex-col gap-4 relative shadow-lg border border-[#8D7B68]/30">
                    <div className="absolute left-7 top-8 bottom-8 w-0.5 bg-[#C59B6D] border-l-2 border-dotted border-[#C59B6D]"></div>
                    
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-5 h-5 rounded-full border-[5px] border-[#C59B6D] bg-[#4A2E1A] flex-shrink-0 mt-0.5"></div>
                        <div className="flex-1">
                            <p className="text-[10px] text-[#C59B6D] font-bold tracking-widest uppercase mb-0.5">Saking (Dari)</p>
                            <p className="font-bold text-sm text-white">{fromHalte.namaHalte}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-5 h-5 rounded-full bg-[#E6D5C3] flex-shrink-0 flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-[#A73A3A] rounded-full"></div>
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-[#C59B6D] font-bold tracking-widest uppercase mb-0.5">Dhumateng (Tujuan)</p>
                            <p className="font-bold text-sm text-white">{toHalte.namaHalte}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Available Routes */}
            <div className="flex-1 px-4 py-6 relative z-10">
                <h3 className="font-serif font-bold text-[#5C3A21] mb-4 text-lg">Pilihan Armada (Bus)</h3>
                
                {buses.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center border border-[#E6D5C3] shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.02] bg-cover bg-center" style={{ backgroundImage: "url('/images/batik_bg.png')" }} />
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-[#F2EAE1] rounded-full flex items-center justify-center mx-auto mb-4 text-[#8D7B68] border border-[#E6D5C3]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6"/><path d="M15 6v14"/><path d="M18 6h-6"/><path d="M12 20H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1"/><path d="M8 20v2"/></svg>
                            </div>
                            <p className="text-sm font-bold text-[#2D1E12]">Belum ada bus aktif pada rute ini.</p>
                            <p className="text-xs text-[#8D7B68] mt-1.5">Silakan cek kembali beberapa saat lagi.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {requiresTransit && (
                            <div className="bg-[#FFFDF0] border-2 border-[#C59B6D] rounded-xl p-4 shadow-sm flex gap-3 items-start relative overflow-hidden">
                                <span className="text-xl text-[#C59B6D] font-bold mt-1">ꦠ</span>
                                <div>
                                    <h4 className="font-bold text-[#5C3A21] text-sm">Pemberitahuan Transit</h4>
                                    <p className="text-[11.5px] text-[#8D7B68] mt-1 leading-relaxed">
                                        Perjalanan Anda melewati dua cluster yang berbeda. Anda harus turun di halte <strong className="text-[#5C3A21]">Simpang Pasar Jangkang</strong> dan berganti bus untuk melanjutkan perjalanan.
                                    </p>
                                </div>
                            </div>
                        )}

                        {routeInfo.map((info, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-5 border border-[#C59B6D] shadow-md relative overflow-hidden">
                                {idx === 0 && (
                                    <div className="absolute top-0 right-0 bg-[#5C3A21] text-white text-[9px] font-bold tracking-wider px-3 py-1.5 rounded-bl-lg shadow-sm">
                                        DIREKOMENDASIKAN
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-4 mb-4 mt-1">
                                    <div className="bg-[#FAF8F5] border border-[#5C3A21] text-[#5C3A21] font-serif font-bold text-lg px-4 py-2 rounded-xl shadow-sm whitespace-nowrap">
                                        {info.name}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#2D1E12] text-sm">Armada {info.name}</p>
                                        <p className="text-[11px] text-[#8D7B68]">{info.desc}</p>
                                    </div>
                                </div>

                                {idx === 0 && (
                                    <div className="bg-[#FAF8F5] rounded-xl p-4 flex flex-col gap-3 mb-2 border border-[#E6D5C3]">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[#8D7B68]">Bus tiba sekitar</span>
                                            <span className="font-bold text-sm text-[#A73A3A]">{busEta} menit</span>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-[#E6D5C3] pt-2">
                                            <span className="text-xs font-medium text-[#8D7B68]">Estimasi waktu tempuh</span>
                                            <span className="font-bold text-sm text-[#5C3A21]">{tripEta} menit</span>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-[#E6D5C3] pt-2">
                                            <span className="text-xs font-medium text-[#8D7B68]">Total jarak</span>
                                            <span className="font-bold text-sm text-[#2D1E12]">{distanceTrip.toFixed(1)} km</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Booking Button */}
            {buses.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-[#E6D5C3] z-40">
                    {bookingSuccess ? (
                        <div className="w-full flex flex-col gap-2 animate-in slide-in-from-bottom-2">
                            {['tunai', 'pelajar', 'lansia'].includes(selectedPayment) && (
                                <div className="bg-[#FFFDF0] border border-[#C59B6D] rounded-xl p-3 shadow-sm flex items-start gap-3">
                                    <div className="bg-[#F2EAE1] p-1.5 rounded-full text-[#C59B6D] flex-shrink-0 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#5C3A21] text-xs mb-0.5 uppercase tracking-wide">Arahan Pembayaran</p>
                                        <p className="text-[11px] text-[#8D7B68] font-medium leading-relaxed">
                                            Nyuwun sewu, mohon berkenan menghubungi pramugara/petugas bus guna menyelesaikan pembayaran Anda.
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="w-full bg-[#E8F5E9] border border-[#4CAF50] text-[#2E7D32] py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                Tiket Berhasil Dipesan!
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setShowPaymentModal(true)}
                            className="w-full bg-[#5C3A21] text-white py-3.5 rounded-xl font-bold hover:bg-[#4A2E1A] transition-all shadow-md active:scale-[0.98] flex justify-center items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
                            Pesan Tiket Sekarang
                        </button>
                    )}
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#FAF8F5] w-full max-w-md rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-full border-t border-[#C59B6D] overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="px-6 py-5 border-b border-[#E6D5C3] flex items-center justify-between bg-white flex-shrink-0">
                            <div>
                                <h3 className="font-serif font-bold text-xl text-[#5C3A21]">Pilih Tarif Tiket</h3>
                                <p className="text-xs text-[#8D7B68] mt-0.5">Sesuai dengan kategori penumpang</p>
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F2EAE1] text-[#8D7B68] hover:text-[#A73A3A] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto relative flex-1">
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-cover bg-center" style={{ backgroundImage: "url('/images/batik_bg.png')" }} />
                            <div className="flex flex-col gap-3 relative z-10">
                                {paymentOptions.map((opt) => (
                                    <div 
                                        key={opt.id}
                                        onClick={() => setSelectedPayment(opt.id)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedPayment === opt.id ? 'border-[#5C3A21] bg-[#F2EAE1] shadow-sm' : 'border-[#E6D5C3] bg-white hover:border-[#C59B6D]'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === opt.id ? 'border-[#5C3A21]' : 'border-[#D1C7BD]'}`}>
                                                {selectedPayment === opt.id && <div className="w-2.5 h-2.5 bg-[#5C3A21] rounded-full"></div>}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold text-sm ${selectedPayment === opt.id ? 'text-[#5C3A21]' : 'text-[#2D1E12]'}`}>{opt.label}</h4>
                                                <p className="text-[11px] text-[#8D7B68]">{opt.desc}</p>
                                            </div>
                                        </div>
                                        <span className="font-serif font-bold text-[#A73A3A] text-base">{opt.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-white border-t border-[#E6D5C3] flex-shrink-0">
                            <button 
                                onClick={handleBooking}
                                disabled={isBooking}
                                className="w-full bg-[#5C3A21] text-white py-3.5 rounded-xl font-bold hover:bg-[#4A2E1A] transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {isBooking ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>Konfirmasi & Bayar</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function RouteEstimationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-[#5C3A21] border-t-transparent rounded-full animate-spin"></div>
                <div className="text-[#8D7B68] text-sm">Memuat estimasi...</div>
            </div>
        }>
            <RouteEstimationContent />
        </Suspense>
    );
}
