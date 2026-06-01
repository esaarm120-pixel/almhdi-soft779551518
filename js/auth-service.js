import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { firebaseConfig } from "../config/firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export const authService = {
    // تسجيل حساب جديد
    async signup(email, password, userData) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // حفظ بيانات المستخدم في Realtime Database
            await set(ref(db, `users/${user.uid}`), {
                uid: user.uid,
                email: email,
                ...userData,
                createdAt: new Date().toISOString()
            });

            // إنشاء مشروع خاص به إذا كان مدير مشروع
            if (userData.role === 'project_admin') {
                await set(ref(db, `projects/${user.uid}`), {
                    projectId: user.uid,
                    projectName: userData.projectName,
                    owner: userData.displayName,
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    users: {},
                    settings: {
                        village: userData.village,
                        district: userData.district,
                        governorate: userData.governorate,
                        themeColor: '#00e676'
                    }
                });
            }

            return { user, userData };
        } catch (error) {
            console.error('خطأ في التسجيل:', error);
            throw error;
        }
    },

    // تسجيل الدخول
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            const userSnapshot = await get(ref(db, `users/${user.uid}`));
            if (!userSnapshot.exists()) {
                throw new Error('بيانات المستخدم غير موجودة');
            }
            const userData = userSnapshot.val();

            return { user, userData };
        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error);
            throw error;
        }
    },

    // تسجيل الخروج
    async logout() {
        try {
            await signOut(auth);
            localStorage.removeItem('currentUser');
            localStorage.removeItem('currentProject');
        } catch (error) {
            console.error('خطأ في تسجيل الخروج:', error);
            throw error;
        }
    },

    // الاستماع لتغييرات الجلسة
    onAuthStateChanged(callback) {
        return onAuthStateChanged(auth, callback);
    },

    // حفظ المستخدم في localStorage
    saveUserToLocalStorage(user, userData) {
        localStorage.setItem('currentUser', JSON.stringify({
            uid: user.uid,
            email: user.email,
            ...userData
        }));
    },

    // الحصول على المستخدم من localStorage
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }
};

// خدمة إدارة المستخدمين
export const userManagementService = {
    // الحصول على جميع المستخدمين
    async getAllUsers() {
        try {
            const snapshot = await get(ref(db, 'users'));
            if (snapshot.exists()) {
                return Object.values(snapshot.val());
            }
            return [];
        } catch (error) {
            console.error('خطأ في جلب المستخدمين:', error);
            return [];
        }
    },

    // الحصول على مستخدمي مشروع معين
    async getProjectUsers(projectId) {
        try {
            const snapshot = await get(ref(db, `projects/${projectId}/users`));
            if (snapshot.exists()) {
                return Object.entries(snapshot.val()).map(([uid, data]) => ({ uid, ...data }));
            }
            return [];
        } catch (error) {
            console.error('خطأ في جلب مستخدمي المشروع:', error);
            return [];
        }
    },

    // إضافة مستخدم جديد إلى المشروع
    async addProjectUser(projectId, userData) {
        try {
            const userId = userData.uid || Date.now().toString();
            await set(ref(db, `projects/${projectId}/users/${userId}`), {
                uid: userId,
                displayName: userData.displayName,
                email: userData.email,
                role: userData.role,
                permissions: userData.permissions || [],
                addedAt: new Date().toISOString()
            });
            return userId;
        } catch (error) {
            console.error('خطأ في إضافة مستخدم:', error);
            throw error;
        }
    },

    // تحديث صلاحيات المستخدم
    async updateUserPermissions(projectId, userId, permissions) {
        try {
            await update(ref(db, `projects/${projectId}/users/${userId}`), {
                permissions: permissions
            });
        } catch (error) {
            console.error('خطأ في تحديث الصلاحيات:', error);
            throw error;
        }
    },

    // تفعيل/إيقاف مشروع
    async toggleProjectStatus(projectId, status) {
        try {
            await update(ref(db, `projects/${projectId}`), {
                status: status
            });
        } catch (error) {
            console.error('خطأ في تغيير حالة المشروع:', error);
            throw error;
        }
    },

    // الحصول على جميع المشاريع
    async getAllProjects() {
        try {
            const snapshot = await get(ref(db, 'projects'));
            if (snapshot.exists()) {
                return Object.values(snapshot.val());
            }
            return [];
        } catch (error) {
            console.error('خطأ في جلب المشاريع:', error);
            return [];
        }
    }
};

// خدمة الصلاحيات
export const permissionsService = {
    // قائمة الصلاحيات المتاحة
    availablePermissions: [
        { id: 'view_subscribers', name: '👥 عرض المشتركين' },
        { id: 'add_subscribers', name: '➕ إضافة مشتركين' },
        { id: 'edit_subscribers', name: '✏️ تعديل المشتركين' },
        { id: 'delete_subscribers', name: '🗑️ حذف المشتركين' },
        { id: 'view_readings', name: '💧 عرض القراءات' },
        { id: 'add_readings', name: '📝 إضافة قراءات' },
        { id: 'view_expenses', name: '📊 عرض المصروفات' },
        { id: 'add_expenses', name: '💸 إضافة مصروفات' },
        { id: 'view_reports', name: '📈 عرض التقارير' },
        { id: 'view_receipts', name: '🧾 عرض سندات القبض' },
        { id: 'add_receipts', name: '📄 إضافة سندات' },
        { id: 'manage_users', name: '👨‍💼 إدارة المستخدمين' },
        { id: 'manage_permissions', name: '🔐 إدارة الصلاحيات' }
    ],

    // الأدوار الافتراضية
    defaultRoles: {
        project_admin: [
            'view_subscribers', 'add_subscribers', 'edit_subscribers', 'delete_subscribers',
            'view_readings', 'add_readings',
            'view_expenses', 'add_expenses',
            'view_reports',
            'view_receipts', 'add_receipts',
            'manage_users', 'manage_permissions'
        ],
        cashier: [
            'view_subscribers', 'view_receipts', 'add_receipts'
        ],
        reader: [
            'view_readings', 'add_readings', 'view_subscribers'
        ],
        accountant: [
            'view_subscribers', 'view_readings', 'view_expenses', 'add_expenses', 'view_reports', 'view_receipts'
        ]
    },

    // التحقق من وجود صلاحية
    hasPermission(permissions, permissionId) {
        return Array.isArray(permissions) && permissions.includes(permissionId);
    },

    // الحصول على قائمة الصلاحيات المتاحة
    getAvailablePermissions() {
        return this.availablePermissions;
    }
};
