import { db } from "../config/firebase-config.js";
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc,
    updateDoc,
    deleteDoc,
    query,
    where 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { storageService } from "./storage-service.js";

// خدمة إدارة المشتركين
export const subscriberService = {
    // إضافة مشترك جديد
    addSubscriber: async (subscriber) => {
        try {
            // حفظ في Firestore
            const docRef = await addDoc(collection(db, 'subscribers'), {
                ...subscriber,
                createdAt: new Date().toISOString(),
                status: 'active'
            });
            
            // حفظ في LocalStorage أيضاً
            const subscribers = storageService.get('subscribers') || [];
            subscribers.push({ id: docRef.id, ...subscriber });
            storageService.save('subscribers', subscribers);
            
            return { id: docRef.id, ...subscriber };
        } catch (error) {
            console.error('خطأ في إضافة المشترك:', error);
            throw error;
        }
    },

    // جلب جميع المشتركين
    getAllSubscribers: async () => {
        try {
            // محاولة جلب من LocalStorage أولاً
            let subscribers = storageService.get('subscribers');
            if (subscribers) return subscribers;
            
            // إذا لم توجد، جلب من Firestore
            const querySnapshot = await getDocs(collection(db, 'subscribers'));
            subscribers = [];
            querySnapshot.forEach((doc) => {
                subscribers.push({ id: doc.id, ...doc.data() });
            });
            
            // حفظ في LocalStorage
            storageService.save('subscribers', subscribers);
            return subscribers;
        } catch (error) {
            console.error('خطأ في جلب المشتركين:', error);
            return storageService.get('subscribers') || [];
        }
    },

    // البحث عن مشترك
    searchSubscriber: async (searchTerm) => {
        try {
            const subscribers = await subscriberService.getAllSubscribers();
            return subscribers.filter(sub => 
                sub.name.includes(searchTerm) || 
                sub.phone.includes(searchTerm) ||
                sub.id.includes(searchTerm)
            );
        } catch (error) {
            console.error('خطأ في البحث:', error);
            return [];
        }
    },

    // تحديث بيانات المشترك
    updateSubscriber: async (id, data) => {
        try {
            await updateDoc(doc(db, 'subscribers', id), data);
            
            // تحديث في LocalStorage
            const subscribers = storageService.get('subscribers') || [];
            const index = subscribers.findIndex(s => s.id === id);
            if (index !== -1) {
                subscribers[index] = { ...subscribers[index], ...data };
                storageService.save('subscribers', subscribers);
            }
            
            return { id, ...data };
        } catch (error) {
            console.error('خطأ في تحديث المشترك:', error);
            throw error;
        }
    },

    // حذف مشترك
    deleteSubscriber: async (id) => {
        try {
            await deleteDoc(doc(db, 'subscribers', id));
            
            // حذف من LocalStorage
            const subscribers = storageService.get('subscribers') || [];
            const filtered = subscribers.filter(s => s.id !== id);
            storageService.save('subscribers', filtered);
            
            return true;
        } catch (error) {
            console.error('خطأ في حذف المشترك:', error);
            throw error;
        }
    },

    // الحصول على إجمالي المشتركين
    getTotalSubscribers: async () => {
        try {
            const subscribers = await subscriberService.getAllSubscribers();
            return subscribers.length;
        } catch (error) {
            console.error('خطأ في حساب المشتركين:', error);
            return 0;
        }
    }
};