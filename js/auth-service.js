// تعريف كائن خدمات الجلسة بشكل صريح دون استيراد دائري تكراري
export const authService = {
    getCurrentUser() {
        try {
            const user = localStorage.getItem('currentUser');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error("خطأ في قراءة بيانات الجلسة من التخزين المحلي:", error);
            return null;
        }
    },
    logout() {
        localStorage.removeItem('currentUser');
    }
};

// التحقق من كون المستخدم سوبر أدمن
export function isSuperAdmin() {
    const currentUser = authService.getCurrentUser();
    return currentUser && currentUser.role === 'super_admin';
}

// التحقق من كون المستخدم مدير مشروع
export function isProjectAdmin() {
    const currentUser = authService.getCurrentUser();
    return currentUser && currentUser.role === 'project_admin';
}

// الحصول على معرف المشروع الحالي
export function getCurrentProjectId() {
    const currentUser = authService.getCurrentUser();
    return currentUser ? currentUser.uid : null;
}

// إعادة التوجيه الذكي بناءً على الدور
export function redirectToDashboard() {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    if (currentUser.role === 'super_admin') {
        window.location.href = 'super-admin-dashboard.html';
    } else {
        window.location.href = 'dashboard.html';
    }
}

// التحقق من الصلاحية والوصول
export function checkPermission(permissionId) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !currentUser.permissions) return false;
    return currentUser.permissions.includes(permissionId);
}

// تسجيل الخروج ونقله لصفحة البداية
export async function logout() {
    await authService.logout();
    window.location.href = 'index.html';
}

// حماية الصفحات من الزوار غير المسجلين
export function protectPage() {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'index.html';
        return null;
    }
    return currentUser;
}
