// ============================================
// Authentication Service - System - Version 10.8.0
// ============================================

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  PROJECT_ADMIN: 'project_admin',
  USER: 'user'
};

export const PERMISSIONS = {
  VIEW_SUBSCRIBERS: 'view_subscribers',
  ADD_SUBSCRIBER: 'add_subscriber',
  EDIT_SUBSCRIBER: 'edit_subscriber',
  DELETE_SUBSCRIBER: 'delete_subscriber',
  PRINT_SUBSCRIBER_INVOICE: 'print_subscriber_invoice',
  SEND_SUBSCRIBER_WHATSAPP: 'send_subscriber_whatsapp',
  VIEW_READINGS: 'view_readings',
  ADD_READING: 'add_reading',
  EDIT_READING: 'edit_reading',
  DELETE_READING: 'delete_reading',
  VIEW_RECEIPTS: 'view_receipts',
  ADD_RECEIPT: 'add_receipt',
  EDIT_RECEIPT: 'edit_receipt',
  DELETE_RECEIPT: 'delete_receipt',
  VIEW_EMPLOYEES: 'view_employees',
  ADD_EMPLOYEE: 'add_employee',
  EDIT_EMPLOYEE: 'edit_employee',
  DELETE_EMPLOYEE: 'delete_employee',
  MANAGE_EMPLOYEE_WITHDRAWALS: 'manage_employee_withdrawals',
  VIEW_EXPENSES: 'view_expenses',
  ADD_EXPENSE: 'add_expense',
  EDIT_EXPENSE: 'edit_expense',
  DELETE_EXPENSE: 'delete_expense',
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
  MANAGE_USERS: 'manage_users',
  MANAGE_PROJECTS: 'manage_projects'
};

export const DEFAULT_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [...Object.values(PERMISSIONS)],
  [ROLES.PROJECT_ADMIN]: [...Object.values(PERMISSIONS).filter(p => p !== PERMISSIONS.MANAGE_PROJECTS)],
  [ROLES.USER]: [
    PERMISSIONS.VIEW_SUBSCRIBERS, PERMISSIONS.VIEW_READINGS, PERMISSIONS.ADD_READING,
    PERMISSIONS.EDIT_READING, PERMISSIONS.VIEW_RECEIPTS, PERMISSIONS.ADD_RECEIPT,
    PERMISSIONS.VIEW_EMPLOYEES, PERMISSIONS.VIEW_EXPENSES, PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.PRINT_SUBSCRIBER_INVOICE, PERMISSIONS.SEND_SUBSCRIBER_WHATSAPP
  ]
};

export function hasPermission(userPermissions, requiredPermission) {
  if (!userPermissions) return false;
  return userPermissions.includes(requiredPermission);
}

export function hasAnyPermission(userPermissions, requiredPermissions) {
  if (!userPermissions) return false;
  return requiredPermissions.some(p => userPermissions.includes(p));
}

export function hasAllPermissions(userPermissions, requiredPermissions) {
  if (!userPermissions) return false;
  return requiredPermissions.every(p => userPermissions.includes(p));
}

export function checkPermissionOrRedirect(requiredPermission) {
  const userData = JSON.parse(localStorage.getItem('currentUser'));
  if (!userData || !hasPermission(userData.permissions, requiredPermission)) {
    alert('❌ ليس لديك صلاحية للوصول إلى هذه الصفحة');
    window.location.href = 'dashboard.html';
    return false;
  }
  return true;
}

export async function updateUserPermissions(db, userId, permissions) {
  try {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    await setDoc(doc(db, 'users', userId), { permissions, updatedAt: new Date().toISOString() }, { merge: true });
    return { success: true, message: 'تم تحديث الصلاحيات بنجاح' };
  } catch (error) {
    console.error('❌ خطأ في تحديث الصلاحيات:', error);
    return { success: false, message: error.message };
  }
}

export async function createUserWithRole(db, userId, projectId, role, customPermissions = null) {
  try {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const permissions = customPermissions || DEFAULT_PERMISSIONS[role] || [];
    await setDoc(doc(db, 'users', userId), {
      userId, projectId, role, permissions,
      createdAt: new Date().toISOString(), status: 'active'
    });
    return { success: true, message: 'تم إنشاء المستخدم بنجاح' };
  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم:', error);
    return { success: false, message: error.message };
  }
}

export function isSuperAdmin() {
  const userData = JSON.parse(localStorage.getItem('currentUser'));
  return userData && userData.role === ROLES.SUPER_ADMIN;
}

export function isProjectAdmin() {
  const userData = JSON.parse(localStorage.getItem('currentUser'));
  return userData && userData.role === ROLES.PROJECT_ADMIN;
}

export function isRegularUser() {
  const userData = JSON.parse(localStorage.getItem('currentUser'));
  return userData && userData.role === ROLES.USER;
}

export function getAllAvailablePermissions() {
  return Object.entries(PERMISSIONS).map(([key, value]) => ({
    key, value, label: key.replace(/_/g, ' ').toUpperCase()
  }));
}

export function belongsToProject(projectId) {
  const userData = JSON.parse(localStorage.getItem('currentUser'));
  if (userData.role === ROLES.SUPER_ADMIN) return true;
  return userData.projectId === projectId;
}

// ✅ دالة التوجيه الذكي الجديدة
export function redirectToDashboard() {
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    if (userData && userData.role === ROLES.SUPER_ADMIN) {
        window.location.href = 'admin-dashboard.html';
    } else {
        window.location.href = 'dashboard.html';
    }
}
