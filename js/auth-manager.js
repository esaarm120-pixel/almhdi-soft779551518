// js/auth-manager.js (NEW CLEAN VERSION)

import { auth } from "../config/firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../config/firebase-config.js";


// ============================================
// 🔐 حماية الصفحات حسب الدور
// ============================================
export function protectPage(allowedRoles = []) {

    onAuthStateChanged(auth, async (user) => {

        // ❌ إذا ما فيه مستخدم
        if (!user) {
            window.location.href = "index.html";
            return;
        }

        try {
            // 🔥 جلب بيانات المستخدم من Firestore
            const userSnap = await getDoc(doc(db, "users", user.uid));

            if (!userSnap.exists()) {
                window.location.href = "index.html";
                return;
            }

            const userData = userSnap.data();

            // 🔒 التحقق من الدور
            if (
                allowedRoles.length > 0 &&
                !allowedRoles.includes(userData.role)
            ) {
                alert("❌ ليس لديك صلاحية للوصول لهذه الصفحة");
                window.location.href = "dashboard.html";
                return;
            }

            console.log("✅ Access granted:", userData.role);

        } catch (error) {
            console.error("Protect Page Error:", error);
            window.location.href = "index.html";
        }
    });
}


// ============================================
// 🚪 تسجيل الخروج
// ============================================
export async function logoutUser() {
    try {
        await signOut(auth);
        window.location.href = "index.html";
    } catch (error) {
        console.error("Logout Error:", error);
    }
}
