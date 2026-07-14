import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase-config";

export const authService = {
    async login(email: string, password: string):Promise<{success: boolean, user: Record<string, unknown>}> {
        // ALWAYS check for demo credentials first, so you can test easily
        if (email === 'admin@transjogja.id' && password === 'admin123') {
            if(typeof window !== 'undefined') localStorage.setItem('demo_admin_logged_in', 'true');
            return { success: true, user: { email, role: 'admin' } };
        }

        if (!auth || !db) {
            throw new Error("Koneksi Firebase gagal, dan email/password demo salah.");
        }

        const firestoreDb = db;
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Check role
            let role = "user";
            try {
                const userDoc = await getDoc(doc(firestoreDb, "users", user.uid));
                if (userDoc.exists()) {
                    role = userDoc.data().role || "user";
                }
            } catch (firestoreError) {
                console.warn("Gagal mengambil role dari Firestore, default ke 'user':", firestoreError);
            }
            
            return { success: true, user: { ...user, role } };
        } catch (error: unknown) {
            console.error("Login error:", error);
            // Expose actual Firebase error code for debugging
            const firebaseError = error as { code?: string; message?: string };
            const code = firebaseError.code ?? "";
            if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
                throw new Error(`Akun tidak ditemukan di Firebase Auth. Daftarkan dulu. (${code})`);
            }
            if (code === "auth/wrong-password") {
                throw new Error(`Password salah. (${code})`);
            }
            if (code === "auth/invalid-email") {
                throw new Error(`Format email tidak valid. (${code})`);
            }
            if (code === "auth/too-many-requests") {
                throw new Error(`Terlalu banyak percobaan. Coba lagi nanti. (${code})`);
            }
            throw new Error(`Login gagal: ${firebaseError.message ?? code ?? "unknown error"}`);
        }
    },

    async register(email: string, password: string, fullname: string, phone: string) {
        if (!auth || !db) throw new Error("Koneksi Firebase gagal.");
        const firestoreDb = db;
        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(firestoreDb, "users", userCred.user.uid), {
                fullname,
                email,
                phone,
                role: "user",
                createdAt: serverTimestamp()
            });
            return userCred.user;
        } catch (e: unknown) {
            console.error("Register error:", e);
            const msg = e instanceof Error ? e.message : "Gagal mendaftar";
            throw new Error(msg);
        }
    },

    async logout() {
        if(typeof window !== 'undefined') {
            localStorage.removeItem('demo_admin_logged_in');
        }
        if (auth) {
            return signOut(auth);
        }
    },

    async updateProfile(fullname: string, phone: string) {
        if (typeof window !== 'undefined') {
            // Save locally as a fallback or for demo users
            const localProfile = JSON.parse(localStorage.getItem('transjogja_profile_cache') || '{}');
            localProfile.fullname = fullname;
            localProfile.phone = phone;
            localStorage.setItem('transjogja_profile_cache', JSON.stringify(localProfile));
        }

        if (auth?.currentUser && db) {
            try {
                await setDoc(doc(db, "users", auth.currentUser.uid), {
                    fullname,
                    phone
                }, { merge: true });
            } catch (e) {
                console.warn("Failed to update profile in Firestore (might be permission issue)", e);
            }
        }
    },

    onAuthStateChanged(callback: (user: Record<string, unknown> | null) => void) {
        const checkDemoLogin = () => {
            const isDemoAdmin = typeof window !== 'undefined' ? localStorage.getItem('demo_admin_logged_in') : null;
            if (isDemoAdmin) {
                let localCache: { fullname?: string; phone?: string } = {};
                if (typeof window !== 'undefined') {
                    const saved = localStorage.getItem('transjogja_profile_cache');
                    if (saved) localCache = JSON.parse(saved);
                }
                callback({ 
                    email: 'admin@transjogja.id', 
                    role: 'admin',
                    fullname: localCache.fullname || 'Administrator',
                    phone: localCache.phone || ''
                });
                return true;
            }
            return false;
        };

        if (!auth || !db) {
            if (!checkDemoLogin()) callback(null);
            return () => {};
        }

        const firestoreDb = db;
        return onAuthStateChanged(auth, async (user: User | null) => {
            if (user) {
                try {
                    if (!firestoreDb) { callback({ ...user, role: "user" }); return; }
                    const userDoc = await getDoc(doc(firestoreDb, "users", user.uid));
                    const dbData = userDoc.exists() ? userDoc.data() : {};
                    const role = dbData.role || "user";
                    
                    // Merge with local cache if available
                    let localCache: { fullname?: string; phone?: string } = {};
                    if (typeof window !== 'undefined') {
                        const saved = localStorage.getItem('transjogja_profile_cache');
                        if (saved) localCache = JSON.parse(saved);
                    }

                    callback({ 
                        ...user, 
                        role, 
                        fullname: localCache.fullname || dbData.fullname,
                        phone: localCache.phone || dbData.phone
                    });
                } catch {
                    callback({ ...user, role: "user" });
                }
            } else {
                if (!checkDemoLogin()) {
                    callback(null);
                }
            }
        });
    }
};
