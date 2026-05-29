// 🔐 إعدادات Firebase (يمكن نقلها لـ .env لاحقاً)
// ⚠️ ملاحظة: في بيئة الإنتاج، استخدم متغيرات البيئة

export const firebaseConfig = {
  apiKey: "AIzaSyBzUUx_A0PyMwtEij_uFyLBwzJPZkVxdnk",
  authDomain: "almhdi-soft779551518.firebaseapp.com",
  projectId: "almhdi-soft779551518",
  storageBucket: "almhdi-soft779551518.firebasestorage.app",
  messagingSenderId: "386533839313",
  appId: "1:386533839313:web:575bc9978c0e38ffd950f0"
};

// 🌐 جميع رموز الأخطاء الممكنة
export const errorMessages = {
  'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
  'auth/user-not-found': 'المستخدم غير موجود',
  'auth/wrong-password': 'كلمة المرور غير صحيحة',
  'auth/weak-password': 'كلمة المرور ضعيفة جداً',
  'auth/email-already-in-use': 'البريد الإلكتروني مسجل بالفعل',
  'auth/user-disabled': 'هذا الحساب معطل',
  'auth/too-many-requests': 'عدد محاولات كثيرة، حاول لاحقاً'
};

// 🎨 الألوان والثوابت
export const appTheme = {
  primary: '#007bff',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  dark: '#333',
  light: '#eef2f7'
};

// 📊 إعدادات المشروع الافتراضية
export const defaultSettings = {
  unitPrice: 150,        // سعر الوحدة بالريال
  subscriptionFee: 400,  // رسم الاشتراك الشهري
  currency: 'ريال يمني 🇾🇪',
  companyName: 'مياه قرية الحسينية',
  governorate: 'الحديدة',
  directorate: 'المنصورية',
  village: 'الحسينية',
  manager: 'كامل المهدي'
};

// ✅ دالة للتحقق من البيانات المطلوبة
export function validateFirebaseConfig() {
  const required = ['apiKey', 'authDomain', 'projectId'];
  return required.every(key => firebaseConfig[key]);
}
