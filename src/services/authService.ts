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

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Check role
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const role = userDoc.exists() ? userDoc.data().role : "user";
            
            return { success: true, user: { ...user, role } };
        } catch (error: unknown) {
            console.error("Login error:", error);
            throw new Error("Email atau Password salah (atau belum terdaftar di Firebase).");
        }
    },

    async register(email: string, password: string, fullname: string, phone: string) {
        if (!auth || !db) throw new Error("Koneksi Firebase gagal.");
        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", userCred.user.uid), {
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
