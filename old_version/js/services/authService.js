import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { auth, db } from "../firebase-config.js";

export const authService = {
    async login(email, password) {
        if (!auth) {
            // Fallback for demo without real firebase config
            console.warn("Using demo login fallback");
            if (email === 'admin@transjogja.id' && password === 'admin123') {
                localStorage.setItem('demo_admin_logged_in', 'true');
                return { success: true, user: { email } };
            }
            throw new Error("Email atau password admin salah");
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Periksa role user di firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().role === 'admin') {
                return { success: true, user };
            } else {
                await this.logout();
                throw new Error("Akses ditolak. Anda bukan admin.");
            }
        } catch (error) {
            console.error("Login error:", error);
            throw new Error(error.message || "Terjadi kesalahan saat login");
        }
    },

    async logout() {
        if (!auth) {
            localStorage.removeItem('demo_admin_logged_in');
            return;
        }
        return signOut(auth);
    },

    onAuthStateChanged(callback) {
        if (!auth) {
            const isDemoAdmin = localStorage.getItem('demo_admin_logged_in');
            callback(isDemoAdmin ? { email: 'admin@transjogja.id', role: 'admin' } : null);
            return () => {};
        }

        return onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists() && userDoc.data().role === 'admin') {
                        callback(user);
                    } else {
                        await this.logout();
                        callback(null);
                    }
                } catch(e) {
                    console.error("Error checking role", e);
                    callback(null);
                }
            } else {
                callback(null);
            }
        });
    }
};
