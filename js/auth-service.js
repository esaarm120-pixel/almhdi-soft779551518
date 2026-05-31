import { db } from "../config/firebase-config.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// دالة إضافة مستخدم جديد للنظام
export const addUser = async (uid, email, role, projectId) => {
    try {
        // ننشئ وثيقة المستخدم في مجموعة 'users' في Firestore
        await setDoc(doc(db, "users", uid), {
            email: email,
            role: role,         // هنا نحدد: 'admin' أو 'user'
            projectId: projectId, // نربطه بالمشروع الخاص به
            createdAt: new Date()
        });
        console.log("تم إضافة المستخدم بنجاح بصلاحية: " + role);
    } catch (error) {
        console.error("خطأ عند إضافة المستخدم:", error);
    }
};
