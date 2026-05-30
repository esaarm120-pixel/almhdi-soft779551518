import { auth, db, errorMessages } from "../config/firebase-config.js";
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    updateProfile 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc,
    collection,
    query,
    where,
    getDocs 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

export const authService = {
    // تسجيل الدخول
    login: async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // الحصول على بيانات المستخدم من Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.exists() ? userDoc.data() : {};
            
            return { user, userData };
        } catch (error) {
            throw error;
        }
    },

    // تسجيل الخروج
    logout: async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('currentUser');
        } catch (error) {
            console.error('خطأ في تسجيل الخروج:', error);
            throw error;
        }
    },

    // الحصول على المستخدم الحالي
    getCurrentUser: () => {
        try {
            const user = localStorage.getItem('currentUser');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('خطأ في الحصول على المستخدم:', error);
            return null;
        }
    },

    // حفظ بيانات المستخدم في LocalStorage
    saveUserToLocalStorage: (user, userData) => {
        try {
            const userInfo = {
                uid: user.uid,
                email: user.email,
                displayName: userData.displayName || user.email.split('@')[0],
                role: userData.role || 'user',
                projectId: userData.projectId || null,
                phone: userData.phone || '',
                createdAt: userData.createdAt || new Date().toISOString()
            };
            localStorage.setItem('currentUser', JSON.stringify(userInfo));
            return userInfo;
        } catch (error) {
            console.error('خطأ في حفظ بيانات المستخدم:', error);
            throw error;
        }
    },

    // مراقبة حالة المستخدم
    onAuthStateChanged: (callback) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const userData = authService.getCurrentUser();
                callback(userData);
            } else {
                callback(null);
            }
        });
    }
};

// خدمة إدارة المستخدمين
export const userManagementService = {
    // إنشاء مستخدم جديد
    createUser: async (email, password, displayName, role = 'user') => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // تحديث الملف الشخصي
            await updateProfile(user, { displayName });
            
            // حفظ بيانات إضافية في Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email,
                displayName,
                role,
                createdAt: new Date().toISOString(),
                status: 'active'
            });
            
            return user;
        } catch (error) {
            throw error;
        }
    },

    // الحصول على جميع المستخدمين
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
            console.error('خطأ في جلب المستخدمين:', error);
            return [];
        }
    }
};