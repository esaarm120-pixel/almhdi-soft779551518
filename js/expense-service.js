import { db } from "../config/firebase-config.js";
import { 
    collection, 
    addDoc, 
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query, 
    where 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { authService } from "./auth-service.js";

// خدمة إدارة المصروفات (مُحدثة بنظام الصلاحيات)
export const expenseService = {
    
    // 1. إضافة مصروف (يرتبط تلقائياً بمشروع المستخدم)
    addExpense: async (expenseData) => {
        const user = authService.getCurrentUser();
        if (!user) throw new Error("يجب تسجيل الدخول");

        return await addDoc(collection(db, 'expenses'), {
            ...expenseData,
            projectId: user.projectId, // ربط المصروف بمشروع المستخدم
            uid: user.uid,             // معرف صاحب العملية
            date: expenseData.date || new Date().toISOString(),
            status: 'recorded'
        });
    },

    // 2. جلب جميع المصروفات (فلترة ذكية حسب صلاحية المستخدم)
    getAllExpenses: async () => {
        const user = authService.getCurrentUser();
        if (!user) throw new Error("يجب تسجيل الدخول");

        let q;
        // السوبر أدمن يرى كل المصروفات في النظام
        if (authService.isSuperAdmin()) {
            q = collection(db, 'expenses');
        } else {
            // الأدمن العادي يرى مصروفات مشروعه فقط
            q = query(collection(db, 'expenses'), where("projectId", "==", user.projectId));
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // 3. تحديث مصروف
    updateExpense: async (id, data) => {
        return await updateDoc(doc(db, 'expenses', id), data);
    },

    // 4. حذف مصروف
    deleteExpense: async (id) => {
        return await deleteDoc(doc(db, 'expenses', id));
    },

    // 5. حساب الإجمالي (بناءً على النتائج المفلترة)
    getTotalExpenses: async () => {
        const expenses = await expenseService.getAllExpenses();
        return expenses.reduce((total, e) => total + (parseFloat(e.amount) || 0), 0);
    }
};
