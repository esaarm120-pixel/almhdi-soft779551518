import { auth, db } from "../config/firebase-config.js";
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export const authService = {

    // 🔐 تسجيل الدخول (مصدر واحد Firestore)
    login: async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userSnap = await getDoc(doc(db, "users", user.uid));

        if (!userSnap.exists()) {
            throw new Error("المستخدم غير موجود في Firestore");
        }

        const userData = userSnap.data();

        // ❌ لا localStorage هنا (مهم جدًا)
        console.log("User Login:", userData);

        return { user, userData };
    },

    // 🚪 تسجيل الخروج
    logout: async () => {
        await signOut(auth);
    },

    // 👁️ مراقبة الحالة (مصدر واحد فقط)
    onAuthStateChanged: (callback) => {
        onAuthStateChanged(auth, async (user) => {

            if (!user) {
                callback(null);
                return;
            }

            const userSnap = await getDoc(doc(db, "users", user.uid));

            if (!userSnap.exists()) {
                callback(null);
                return;
            }

            callback({
                uid: user.uid,
                ...userSnap.data()
            });
        });
    }
};


// ============================================
// User Management Service
// ============================================

export const userManagementService = {

    createUser: async (email, password, displayName, role = "user", projectId = null) => {

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName });

        await setDoc(doc(db, "users", user.uid), {
            email,
            displayName,
            role,
            projectId,
            status: "active",
            createdAt: Date.now()
        });

        return user;
    },

    getAllUsers: async () => {
        const q = query(collection(db, "users"), where("status", "==", "active"));
        const snap = await getDocs(q);

        return snap.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));
    }
};
