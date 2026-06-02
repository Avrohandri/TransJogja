"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import Link from "next/link";

export default function UserProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChanged((u) => {
            if (!u) router.push("/login");
            else setUser(u);
        });
        return () => unsubscribe();
    }, [router]);

    const handleSignOut = async () => {
        await authService.logout();
        router.push("/login");
    };

    if (!user) return <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">Memuat...</div>;

    const initials = user.email ? user.email.substring(0, 2).toUpperCase() : "US";

    return (
        <div className="min-h-screen bg-[#f7f9fb] font-sans text-[#191c1e] flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-[#e0e3e5]">
                <Link href="/user" className="text-[#3f4945] hover:text-[#00342b]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </Link>
                <h1 className="font-bold text-lg text-[#00342b]">Profile</h1>
                <div className="w-6"></div>
            </div>

            {/* Profile Info */}
            <div className="flex flex-col items-center py-8 bg-white mb-2">
                <div className="w-20 h-20 bg-[#006c49] rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-md">
                    {initials}
                </div>
                <h2 className="font-bold text-xl text-[#00342b]">{user.fullname || user.email.split('@')[0]}</h2>
                <p className="text-sm text-[#3f4945]">{user.email}</p>
                <div className="mt-3 bg-[#e0e3e5] text-[#3f4945] text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-widest">
                    {user.role}
                </div>
            </div>

            {/* Menu List */}
            <div className="flex-1 px-4 py-2">
                <div className="bg-white rounded-xl shadow-sm border border-[#e0e3e5] overflow-hidden">
                    <MenuItem icon="person" title="Profile Details" />
                    <MenuItem icon="language" title="Change Language" subtitle="Bahasa Indonesia" />
                    <MenuItem icon="dark_mode" title="Theme" subtitle="Light Mode" />
                    <MenuItem icon="help" title="Help Center" />
                    <MenuItem icon="info" title="Version" subtitle="v1.0.0" borderBottom={false} />
                </div>

                <button 
                    onClick={handleSignOut}
                    className="w-full mt-6 bg-white border border-[#ba1a1a] text-[#ba1a1a] py-3.5 rounded-xl font-bold hover:bg-[#ffdad6] transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                    Logout
                </button>
            </div>
        </div>
    );
}

function MenuItem({ icon, title, subtitle, borderBottom = true }: { icon: string, title: string, subtitle?: string, borderBottom?: boolean }) {
    const icons: Record<string, React.ReactNode> = {
        person: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
        language: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>,
        dark_mode: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
        help: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>,
        info: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
    };

    return (
        <div className={`flex items-center justify-between p-4 ${borderBottom ? 'border-b border-[#e0e3e5]' : ''} hover:bg-[#f7f9fb] transition-colors cursor-pointer`}>
            <div className="flex items-center gap-3">
                <div className="text-[#3f4945]">
                    {icons[icon]}
                </div>
                <span className="font-semibold text-sm">{title}</span>
            </div>
            <div className="flex items-center gap-2 text-[#707975]">
                {subtitle && <span className="text-[11px]">{subtitle}</span>}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
        </div>
    );
}
