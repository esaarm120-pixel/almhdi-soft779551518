import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ============================================
// Firebase Configuration - Clean Version
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyBzUUx_A0PyMwtEij_uFyLBwzJPZkVxdnk",
  authDomain: "almhdi-soft779551518.firebaseapp.com",
  projectId: "almhdi-soft779551518",
  storageBucket: "almhdi-soft779551518.firebasestorage.app",
  messagingSenderId: "386533839313",
  appId: "1:386533839313:web:575bc9978c0e38ffd950f0",
  measurementId: "G-MZSN60VZ63"
};

// ============================================
// Initialize Firebase
// ============================================

let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  console.log("✅ Firebase جاهز:", firebaseConfig.projectId);

} catch (error) {
  console.error("❌ Firebase initialization error:", error);
}

// ============================================
// Export services
// ============================================

export { auth, db };

// ============================================
// Error Messages (Arabic)
// ============================================

export const errorMessages = {
  "auth/invalid-email": "البريد الإلكتروني غير صحيح.",
  "auth/user-not-found": "المستخدم غير موجود.",
  "auth/wrong-password": "كلمة المرور خاطئة.",
  "auth/invalid-credential": "بيانات الدخول غير صحيحة.",
  "auth/user-disabled": "الحساب معطل.",
  "auth/email-already-in-use": "البريد مستخدم مسبقاً.",
  "auth/weak-password": "كلمة المرور ضعيفة (6 أحرف على الأقل).",
  "auth/too-many-requests": "محاولات كثيرة، حاول لاحقاً.",
  "auth/network-request-failed": "مشكلة اتصال بالإنترنت."
};
