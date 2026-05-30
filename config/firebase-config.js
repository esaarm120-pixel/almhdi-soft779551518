// ============================================
// Firebase Configuration - Version 10.8.0 (Unified)
// ============================================
// تم توحيد إصدار Firebase ليكون متوافقاً مع جميع الملفات

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// ✅ بيانات Firebase الحقيقية
const firebaseConfig = {
  apiKey: "AIzaSyBzUUx_A0PyMwtEij_uFyLBwzJPZkVxdnk",
  authDomain: "almhdi-soft779551518.firebaseapp.com",
  projectId: "almhdi-soft779551518",
  storageBucket: "almhdi-soft779551518.firebasestorage.app",
  messagingSenderId: "386533839313",
  appId: "1:386533839313:web:575bc9978c0e38ffd950f0",
  measurementId: "G-MZSN60VZ63"
};

// ✅ تهيئة Firebase
const app = initializeApp(firebaseConfig);

// ✅ تصدير الخدمات الأساسية
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// ✅ رسائل الأخطاء العربية
export const errorMessages = {
  "auth/invalid-email": "البريد الإلكتروني غير صحيح.",
  "auth/user-not-found": "المستخدم غير موجود في النظام.",
  "auth/wrong-password": "كلمة المرور خاطئة.",
  "auth/invalid-credential": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  "auth/user-disabled": "هذا الحساب معطل من قبل المسؤول.",
  "auth/email-already-in-use": "البريد الإلكتروني مستخدم بالفعل.",
  "auth/weak-password": "كلمة المرور ضعيفة جداً (7 أحرف على الأقل).",
  "auth/operation-not-allowed": "هذه العملية غير مسموحة حالياً.",
  "auth/too-many-requests": "تم حظر المحاولات مؤقتاً، حاول لاحقاً.",
  "auth/network-request-failed": "فشل الاتصال بالشبكة، تأكد من اتصال الإنترنت.",
  "auth/account-exists-with-different-credential": "البريد الإلكتروني مسجل بطريقة تسجيل دخول مختلفة."
};

// ✅ قيمة اختبار للتحقق من أن الملف يعمل
console.log('✅ Firebase Config تم تحميله بنجاح - المشروع:', firebaseConfig.projectId);
