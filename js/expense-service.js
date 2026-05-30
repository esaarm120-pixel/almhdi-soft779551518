import { db } from "../config/firebase-config.js";
import { 
    collection, 
    addDoc, 
    getDocs,
    updateDoc,
    deleteDoc,
    doc 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { storageService } from "./storage-service.js";

// خدمة إدارة المصروفات
export const expenseService = {
    // إضافة مصروف
    addExpense: async (expense) => {
        try {
            const docRef = await addDoc(collection(db, 'expenses'), {
                ...expense,
                date: expense.date || new Date().toISOString(),
                status: 'recorded'
            });
            
            // حفظ في LocalStorage
            const expenses = storageService.get('expenses') || [];
            expenses.push({ id: docRef.id, ...expense });
            storageService.save('expenses', expenses);
            
            return { id: docRef.id, ...expense };
        } catch (error) {
            console.error('خطأ في إضافة المصروف:', error);
            throw error;
        }
    },

    // جلب جميع المصروفات
    getAllExpenses: async () => {
        try {
            let expenses = storageService.get('expenses');
            if (expenses) return expenses;
            
            const querySnapshot = await getDocs(collection(db, 'expenses'));
            expenses = [];
            querySnapshot.forEach((doc) => {
                expenses.push({ id: doc.id, ...doc.data() });
            });
            
            storageService.save('expenses', expenses);
            return expenses;
        } catch (error) {
            console.error('خطأ في جلب المصروفات:', error);
            return storageService.get('expenses') || [];
        }
    },

    // جلب المصروفات حسب الفئة
    getExpensesByCategory: async (category) => {
        try {
            const expenses = await expenseService.getAllExpenses();
            return expenses.filter(e => e.category === category);
        } catch (error) {
            console.error('خطأ في جلب المصروفات:', error);
            return [];
        }
    },

    // حساب إجمالي المصروفات
    getTotalExpenses: async () => {
        try {
            const expenses = await expenseService.getAllExpenses();
            return expenses.reduce((total, expense) => total + (parseFloat(expense.amount) || 0), 0);
        } catch (error) {
            console.error('خطأ في حساب المصروفات:', error);
            return 0;
        }
    },

    // تحديث مصروف
    updateExpense: async (id, data) => {
        try {
            await updateDoc(doc(db, 'expenses', id), data);
            
            const expenses = storageService.get('expenses') || [];
            const index = expenses.findIndex(e => e.id === id);
            if (index !== -1) {
                expenses[index] = { ...expenses[index], ...data };
                storageService.save('expenses', expenses);
            }
            
            return { id, ...data };
        } catch (error) {
            console.error('خطأ في تحديث المصروف:', error);
            throw error;
        }
    },

    // حذف مصروف
    deleteExpense: async (id) => {
        try {
            await deleteDoc(doc(db, 'expenses', id));
            
            const expenses = storageService.get('expenses') || [];
            const filtered = expenses.filter(e => e.id !== id);
            storageService.save('expenses', filtered);
            
            return true;
        } catch (error) {
            console.error('خطأ في حذف المصروف:', error);
            throw error;
        }
    }
};