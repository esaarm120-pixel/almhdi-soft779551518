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
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


// ============================================
// 🔐 تسجيل الدخول (FIXED - بسيط وموثوق)
// ============================================
export const authService = {

    login: async (email, password) => {
        try {

            // 1. تسجيل الدخول من Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. جلب بيانات المستخدم من Firestore
            const userSnap = await getDoc(doc(db, "users", user.uid));

            if (!userSnap.exists()) {
                alert("المستخدم غير موجود في قاعدة البيانات");
                return;
            }

            const userData = userSnap.data();

            // 3. حفظ بيانات بسيطة فقط (بدون تعقيد)
            const sessionUser = {
                uid: user.uid,
                email: user.email,
                role: userData.role || "user",
                projectId: userData.projectId || null
            };

            localStorage.setItem("currentUser", JSON.stringify(sessionUser));

            console.log("✅ Login Success:", sessionUser);

            // 4. تحويل مباشر
            window.location.href = "dashboard.html";

            return sessionUser;

        } catch (error) {
            console.error("❌ Login Error:", error);
            alert("خطأ في تسجيل الدخول: " + error.message);
        }
    },


    // ============================================
    // 🚪 تسجيل الخروج
    // ============================================
    logout: async () => {
        try {
            await signOut(auth);
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        } catch (error) {
            console.error(error);
        }
    },


    // ============================================
    // 👤 المستخدم الحالي
    // ============================================
    getCurrentUser: () => {
        try {
            return JSON.parse(localStorage.getItem("currentUser"));
        } catch {
            return null;
        }
    },


    // ============================================
    // 👁️ مراقبة الحالة (بسيط)
    // ============================================
    onAuthStateChanged: (callback) => {
        onAuthStateChanged(auth, async (user) => {

            if (!user) {
                callback(null);
                return;
            }

            const snap = await getDoc(doc(db, "users", user.uid
