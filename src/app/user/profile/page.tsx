"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import Link from "next/link";

interface UserProfile {
    email?: string;
    fullname?: string;
    role?: string;
    phone?: string;
    [key: string]: unknown;
}

export default function UserProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [theme, setTheme] = useState<"light" | "dark">("light");
    
    // Modals
    const [showProfileDetails, setShowProfileDetails] = useState(false);
    const [showThemeModal, setShowThemeModal] = useState(false);

    // Form states
    const [fullname, setFullname] = useState("");
    const [phone, setPhone] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Init theme from localStorage
        const savedTheme = localStorage.getItem('transjogja_theme') as "light" | "dark";
        if (savedTheme) {
            setTheme(savedTheme);
        }

        const unsubscribe = authService.onAuthStateChanged((u) => {
            if (!u) router.push("/login");
            else {
                setUser(u);
                setFullname(u.fullname || (typeof u.email === 'string' ? u.email.split('@')[0] : "Pengguna"));
                setPhone(u.phone || "0812-3456-7890");
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleSignOut = async () => {
        await authService.logout();
        router.push("/login");
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await authService.updateProfile(fullname, phone);
            setShowProfileDetails(false);
            alert("Profil berhasil diperbarui!");
        } catch (e) {
            console.error(e);
            alert("Gagal memperbarui profil.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleApplyTheme = () => {
        const targetTheme = theme === "light" ? "dark" : "light";
        setTheme(targetTheme);
        localStorage.setItem('transjogja_theme', targetTheme);
        
        if (targetTheme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        
        setShowThemeModal(false);
    };

    if (!user) return <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">Memuat...</div>;

    const initials = fullname ? fullname.substring(0, 2).toUpperCase() : "US";

    // Theme Variables - using Tailwind override classes when global dark theme is applied
    // But since the profile page has its own variables, we can let the global CSS handle it,
    // or just rely on the body class. Since we applied global overrides, we can just use the standard light colors
    // and let CSS invert them! But the user requested a modal to toggle.
    // If the body has .dark-theme, our colors will automatically switch because of globals.css!
    // So we don't need JS variables for the styles, we just use the base colors.

    return (
        <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#2D1E12] flex flex-col relative transition-colors duration-300">
            {/* Background Batik */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-cover bg-center" style={{ backgroundImage: "url('/images/batik_bg.png')" }} />

            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-[#E6D5C3] transition-colors duration-300 relative z-10">
                <Link href="/user" className="text-[#8D7B68] hover:bg-[#F2EAE1] p-1.5 -ml-1.5 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </Link>
                <h1 className="font-serif font-bold text-lg text-[#5C3A21]">Profile</h1>
                <div className="w-8"></div>
            </div>

            {/* Profile Info */}
            <div className="flex flex-col items-center py-8 bg-white mb-2 border-b border-[#E6D5C3] transition-colors duration-300 relative z-10">
                <div className="w-20 h-20 bg-[#5C3A21] rounded-full flex items-center justify-center text-[#FAF8F5] text-3xl font-serif font-bold mb-3 shadow-md border-2 border-[#C59B6D]">
                    {initials}
                </div>
                <h2 className="font-bold text-xl text-[#5C3A21]">{fullname}</h2>
                <p className="text-sm text-[#8D7B68]">{user.email}</p>
                <div className="mt-3 border border-[#E6D5C3] text-[#8D7B68] bg-[#FAF8F5] text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                    {user.role || "USER"}
                </div>
            </div>

            {/* Menu List */}
            <div className="flex-1 px-4 py-3 relative z-10">
                <div className="bg-white rounded-xl shadow-sm border border-[#E6D5C3] overflow-hidden transition-colors duration-300">
                    <MenuItem 
                        icon="person" 
                        title="Profile Details" 
                        onClick={() => setShowProfileDetails(true)} 
                    />
                    <MenuItem 
                        icon="language" 
                        title="Change Language" 
                        subtitle="Bahasa Indonesia" 
                    />
                    <MenuItem 
                        icon="dark_mode" 
                        title="Theme" 
                        subtitle={theme === "dark" ? "Dark Mode" : "Light Mode"} 
                        onClick={() => setShowThemeModal(true)}
                    />
                    <MenuItem 
                        icon="help" 
                        title="Help Center" 
                    />
                    <MenuItem 
                        icon="info" 
                        title="Version" 
                        subtitle="v1.0.0" 
                        borderBottom={false} 
                    />
                </div>

                <button 
                    onClick={handleSignOut}
                    className="w-full mt-6 bg-white border border-[#A73A3A] text-[#A73A3A] py-3.5 rounded-xl font-bold hover:bg-[#F2EAE1] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                    Logout
                </button>
            </div>

            {/* Theme Confirmation Modal */}
            {showThemeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in px-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#C59B6D] animate-in zoom-in-95">
                        <div className="p-6 text-center border-b border-[#E6D5C3]">
                            <div className="w-14 h-14 bg-[#FFFDF0] rounded-full mx-auto flex items-center justify-center mb-4 border border-[#C59B6D]">
                                {theme === "light" ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5C3A21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C59B6D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                                )}
                            </div>
                            <h3 className="font-serif font-bold text-lg text-[#5C3A21] mb-2">Konfirmasi Tema</h3>
                            <p className="text-sm text-[#8D7B68]">
                                Anda akan mengubah tema aplikasi secara keseluruhan menjadi <strong className="text-[#2D1E12]">{theme === "light" ? "Dark Mode" : "Light Mode"}</strong>. Lanjutkan?
                            </p>
                        </div>
                        <div className="flex items-center p-4 gap-3 bg-[#FAF8F5]">
                            <button 
                                onClick={() => setShowThemeModal(false)}
                                className="flex-1 py-2.5 rounded-xl font-bold text-[#8D7B68] border border-[#D1C7BD] hover:bg-[#E6D5C3] transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleApplyTheme}
                                className="flex-1 py-2.5 rounded-xl font-bold bg-[#5C3A21] text-white hover:bg-[#4A2E1A] shadow-md transition-all"
                            >
                                Terapkan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Details Modal */}
            {showProfileDetails && (
                <div className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="mt-auto h-[85vh] bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-full border-t border-[#C59B6D] overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-[#E6D5C3] flex items-center justify-between">
                            <h3 className="font-serif font-bold text-xl text-[#5C3A21]">Profile Details</h3>
                            <button onClick={() => setShowProfileDetails(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-[#8D7B68] hover:bg-[#F2EAE1] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
                            {/* Edit Photo */}
                            <div className="flex flex-col items-center mb-2">
                                <div className="relative cursor-pointer group">
                                    <div className="w-20 h-20 bg-[#5C3A21] rounded-full flex items-center justify-center text-white text-3xl font-serif font-bold">
                                        {initials}
                                    </div>
                                    <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full border border-[#C59B6D] text-[#5C3A21] shadow-sm group-hover:scale-110 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Username Input */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-[#8D7B68] uppercase tracking-wider">Username</label>
                                <input 
                                    type="text" 
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                    className="w-full bg-[#FAF8F5] border border-[#E6D5C3] rounded-xl py-3 px-4 text-sm font-semibold text-[#2D1E12] outline-none focus:border-[#C59B6D] transition-colors"
                                />
                            </div>

                            {/* Phone Input */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-[#8D7B68] uppercase tracking-wider">Nomor Telepon</label>
                                <input 
                                    type="tel" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-[#FAF8F5] border border-[#E6D5C3] rounded-xl py-3 px-4 text-sm font-semibold text-[#2D1E12] outline-none focus:border-[#C59B6D] transition-colors"
                                />
                            </div>

                            {/* Linked Accounts */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-[#8D7B68] uppercase tracking-wider">Akun Tertaut</label>
                                <div className="w-full bg-[#FAF8F5] border border-[#E6D5C3] rounded-xl p-3.5 flex items-center justify-between opacity-70">
                                    <div className="flex items-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                        <span className="text-sm font-medium">{user.email}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-[#5C3A21] border border-[#5C3A21] px-1.5 rounded">TERTAUT</span>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="p-4 border-t border-[#E6D5C3] bg-white">
                            <button 
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="w-full bg-[#5C3A21] text-white py-3.5 rounded-xl font-bold hover:bg-[#4A2E1A] transition-all flex justify-center items-center gap-2"
                            >
                                {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Simpan Perubahan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Reusable Menu Item
function MenuItem({ icon, title, subtitle, borderBottom = true, onClick }: { 
    icon: string, title: string, subtitle?: string, borderBottom?: boolean, onClick?: () => void
}) {
    const icons: Record<string, React.ReactNode> = {
        person: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
        language: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>,
        dark_mode: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
        help: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>,
        info: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
    };

    return (
        <div 
            onClick={onClick}
            className={`flex items-center justify-between p-4 ${borderBottom ? `border-b border-[#E6D5C3]` : ''} hover:bg-[#F2EAE1] transition-colors cursor-pointer`}
        >
            <div className="flex items-center gap-3">
                <div className="text-[#8D7B68]">
                    {icons[icon]}
                </div>
                <span className="font-semibold text-sm text-[#2D1E12]">{title}</span>
            </div>
            <div className="flex items-center gap-2 text-[#8D7B68]">
                {subtitle && <span className="text-[11px] font-medium">{subtitle}</span>}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
        </div>
    );
}
