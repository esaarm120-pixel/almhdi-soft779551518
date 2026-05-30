// js/app-initializer.js
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../config/firebase-config.js";

export async function initializeApp() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || !user.projectId) {
        console.warn("لا يوجد مشروع مرتبط بهذا المستخدم");
        return;
    }

    try {
        const projectDoc = await getDoc(doc(db, "projects", user.projectId));
        if (projectDoc.exists()) {
            const projectData = projectDoc.data();
            // نظام الإيقاف (Kill Switch)
            if (projectData.status === 'suspended') {
                showSuspensionModal(projectData);
            }
        }
    } catch (error) {
        console.error("خطأ في التحقق من حالة المشروع:", error);
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
