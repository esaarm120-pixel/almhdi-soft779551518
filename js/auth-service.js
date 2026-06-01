import { authService } from "./auth-service.js";

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

// التحقق من الصلاحية
export function checkPermission(permissionId) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !currentUser.permissions) return false;
    return currentUser.permissions.includes(permissionId);
}

// تسجيل الخروج
export async function logout() {
    await authService.logout();
    window.location.href = 'index.html';
}

// حماية الصفحات
export function protectPage() {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'index.html';
        return null;
    }
    return currentUser;
}
