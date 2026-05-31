// js/app-initializer.js
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../config/firebase-config.js";

export async function initializeApp() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    // التحقق من وجود المستخدم
    if (!user || !user.uid) {
        console.warn("المستخدم غير مسجل دخوله");
        return;
    }

    try {
        // 1. جلب بيانات المستخدم من مجموعة 'users' للتحقق من صلاحياته
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();

            // 2. تفعيل صلاحية السوبر أدمن (تجاوز قيود المشاريع)
            if (userData.role === 'super_admin') {
                console.log("أهلاً بك يا عصام المهدي، تم تفعيل وضع السوبر أدمن.");
                return; // خروج من الدالة لأنك تملك صلاحية كاملة
            }
        }

        // 3. كود التحقق من المشاريع للمستخدمين العاديين
        if (!user.projectId) {
            console.warn("لا يوجد مشروع مرتبط بهذا المستخدم");
            return;
        }

        const projectDoc = await getDoc(doc(db, "projects", user.projectId));
        if (projectDoc.exists()) {
            const projectData = projectDoc.data();
            
            // نظام الإيقاف (Kill Switch) للمشاريع
            if (projectData.status === 'suspended') {
                showSuspensionModal(projectData);
            }
        }
    } catch (error) {
        console.error("خطأ في التحقق من حالة الصلاحيات:", error);
    }
}

function showSuspensionModal(project) {
    document.body.innerHTML = `
    <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:99999; display:flex; justify-content:center; align-items:center; color:#fff; text-align:center; padding:20px; font-family:sans-serif;">
        <div style="max-width:500px;">
            <h1 style="color:#ffcc00; font-size:40px;">⚠️ تم إيقاف الخدمة</h1>
            <p style="font-size:18px;">المشروع: <strong>${project.name}</strong> متوقف حالياً.</p>
            <p>يرجى التواصل مع المطور لإعادة التفعيل.</p>
            <hr style="border:0; border-top:1px solid #444; margin:20px 0;">
            <p><strong>عصام المهدي</strong></p>
            <a href="https://wa.me/967779551518" style="background:#25d366; color:#fff; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block; font-weight:bold;">📱 تواصل عبر واتساب: 779551518</a>
        </div>
    </div>`;
}
