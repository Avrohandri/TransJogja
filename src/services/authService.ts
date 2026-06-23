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
            const userDoc = await getDoc(doc(firestoreDb, "users", user.uid));
            const role = userDoc.exists() ? userDoc.data().role : "user";
            
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

    onAuthStateChanged(callback: (user: Record<string, unknown> | null) => void) {
        const checkDemoLogin = () => {
            const isDemoAdmin = typeof window !== 'undefined' ? localStorage.getItem('demo_admin_logged_in') : null;
            if (isDemoAdmin) {
                callback({ email: 'admin@transjogja.id', role: 'admin' });
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
                    const role = userDoc.exists() ? userDoc.data().role : "user";
                    callback({ ...user, role });
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
