// استيراد مكتبات Firebase اللازمة للتهيئة والتصدير
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// إعدادات Firebase الخاصة بمشروعك
export const firebaseConfig = {
    apiKey: "AIzaSyBzUUx_A0PyMwtEij_uFyLBwzJPZkVxdnk",
    authDomain: "almhdi-soft779551518.firebaseapp.com",
    databaseURL: "https://almhdi-soft779551518-default-rtdb.firebaseio.com",
    projectId: "almhdi-soft779551518",
    storageBucket: "almhdi-soft779551518.appspot.com",
    messagingSenderId: "386533839313",
    appId: "1:386533839313:web:575bc9978c0e38ffd950f0",
    measurementId: "G-MZSN60VZ63"
};

// تهيئة الخدمة وتصدير المتغيرات المطلوبة للربط التلقائي في الصفحات الأخرى
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// رسائل الأخطاء بالعربية
export const errorMessages = {
    'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
    'auth/user-not-found': 'البريد الإلكتروني غير مسجل',
    'auth/wrong-password': 'كلمة المرور غير صحيحة',
    'auth/invalid-credential': 'بيانات الدخول غير صحيحة',
    'auth/user-disabled': 'الحساب معطل',
    'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
    'auth/weak-password': 'كلمة المرور ضعيفة جداً (8 أحرف على الأقل)',
    'auth/too-many-requests': 'محاولات كثيرة جداً، حاول بعد قليل',
    'auth/network-request-failed': 'فشل الاتصال بالإنترنت',
    'auth/operation-not-allowed': 'هذه العملية غير مسموحة'
};
