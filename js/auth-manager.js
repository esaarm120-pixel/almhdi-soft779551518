// js/auth-manager.js (NEW CLEAN VERSION WITH AUTO-HEALING & SYNC)

import { auth } from "../config/firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../config/firebase-config.js";


// ============================================
// 🔐 حماية الصفحات حسب الدور والعلاج التلقائي للبنية
// ============================================
export function protectPage(allowedRoles = []) {

    onAuthStateChanged(auth, async (user) => {

        // ❌ إذا ما فيه مستخدم مسجل
        if (!user) {
            window.location.href = "index.html";
            return;
        }

        try {
            // 🔥 جلب بيانات المستخدم من Firestore بـ UID
            let userSnap = await getDoc(doc(db, "users", user.uid));
            let userData;

            if (!userSnap.exists()) {
                console.log("مستند جلسة المستخدم غير موجود بـ UID، جاري مطابقة البريد الإلكتروني للشفاء التلقائي...");
                const emailQuery = query(collection(db, "users"), where("email", "==", user.email));
                const querySnap = await getDocs(emailQuery);

                if (!querySnap.empty) {
                    const originalDoc = querySnap.docs[0];
                    userData = originalDoc.data();
                    
                    console.log("تم كشف مستند مسبق مسجل بالبريد، نقله وربطه بـ UID الحالي للتفعيل...");
                    await setDoc(doc(db, "users", user.uid), {
                        ...userData,
                        updatedFromRandomId: originalDoc.id
                    });
                    
                    // إعادة قراءة المستند المهيأ
                    userSnap = await getDoc(doc(db, "users", user.uid));
                } else {
                    // بناء حساب طوارئ جديد عند غياب المستند بالكامل
                    console.log("الحساب مفقود بالكامل، تم البناء الذاتي كمشرف للمشروع...");
                    const emailLower = user.email.toLowerCase();
                    const isSuper = emailLower === 'esaarm120@gmail.com' || emailLower === 'benfhmi322@gmail.com' || emailLower === 'esam@gmail.com' || emailLower.includes('admin');
                    
                    const initialData = {
                        firstName: isSuper ? "عصام" : "مدير",
                        lastName: isSuper ? "المهدي" : "مشروع",
                        email: user.email,
                        phone: "779551518",
                        role: isSuper ? "super_admin" : "project_admin",
                        projectId: isSuper ? null : "project_auto_gen",
                        createdAt: new Date().toISOString(),
                        status: "active"
                    };
                    
                    await setDoc(doc(db, "users", user.uid), initialData);
                    userSnap = await getDoc(doc(db, "users", user.uid));
                }
            }

            userData = userSnap.data();

            // تحديث currentUser في localStorage لضمان الاتساق
            localStorage.setItem('currentUser', JSON.stringify({
                uid: user.uid,
                email: user.email,
                role: userData.role,
                projectId: userData.projectId || null,
                firstName: userData.firstName,
                lastName: userData.lastName
            }));

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
// 🚪 دالة تسجيل الخروج للبرنامج بأكمله
// ============================================
export async function logoutUser() {
    try {
        await signOut(auth);
        localStorage.removeItem('currentUser');
        window.location.href = "index.html";
    } catch (error) {
        console.error("Logout Error:", error);
    }
}
