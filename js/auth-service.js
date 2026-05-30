// ============================================
// Authentication Service - Version 10.8.0 (Updated)
// ============================================

import { auth, db } from "../config/firebase-config.js";
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc,
    collection,
    query,
    where,
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export const authService = {
    // 🔐 تسجيل الدخول (محدث)
    login: async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // الحصول على بيانات المستخدم من Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.exists() ? userDoc.data() : {
                role: 'user',
                permissions: []
            };
            
            // حفظ البيانات محلياً ليستخدمها التطبيق في التوجيه
            authService.saveUserToLocalStorage(user, userData);
            
            console.log('✅ تسجيل دخول ناجح:', user.email);
            return { user, userData };
        } catch (error) {
            console.error('❌ خطأ في تسجيل الدخول:', error.code, error.message);
            throw error;
        }
    },

    // 🚪 تسجيل الخروج
    logout: async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('currentUser');
            console.log('✅ تسجيل خروج ناجح');
        } catch (error) {
            console.error('❌ خطأ في تسجيل الخروج:', error);
            throw error;
        }
    },

    // 👤 الحصول على المستخدم الحالي
    getCurrentUser: () => {
        try {
            const user = localStorage.getItem('currentUser');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('❌ خطأ في الحصول على المستخدم:', error);
            return null;
        }
    },

    // 💾 حفظ بيانات المستخدم
    saveUserToLocalStorage: (user, userData) => {
        try {
            const userInfo = {
                uid: user.uid,
                email: user.email,
                role: userData.role || 'user',
                displayName: userData.displayName || user.email.split('@')[0],
                // إضافة بيانات إضافية عند الحاجة
            };
            localStorage.setItem('currentUser', JSON.stringify(userInfo));
            return userInfo;
        } catch (error) {
            console.error('❌ خطأ في حفظ بيانات المستخدم:', error);
            throw error;
        }
    },

    // 👁️ مراقبة حالة المستخدم
    onAuthStateChanged: (callback) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const userData = authService.getCurrentUser();
                callback(userData || user);
            } else {
                callback(null);
            }
        });
    }
};

// ============================================
// User Management Service (كما هي)
// ============================================

export const userManagementService = {
    createUser: async (email, password, displayName, role = 'user') => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user, { displayName });
            await setDoc(doc(db, 'users', user.uid), {
                email, displayName, role, permissions: [],
                createdAt: new Date().toISOString(), status: 'active'
            });
            return user;
        } catch (error) {
            throw error;
        }
    },

    getAllUsers: async () => {
        try {
            const q = query(collection(db, 'users'), where('status', '==', 'active'));
            const querySnapshot = await getDocs(q);
            const users = [];
            querySnapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });
            return users;
        } catch (error) {
            return [];
        }
    }
};
