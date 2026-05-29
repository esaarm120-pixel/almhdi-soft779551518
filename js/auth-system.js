// 🔐 نظام المصادقة والأدوار والصلاحيات المتقدم

/**
 * 👤 أنواع الأدوار المتاحة
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',      // التحكم الكامل (أنت)
  PROJECT_ADMIN: 'project_admin',  // إدارة المشروع
  USER: 'user'                      // موظف عادي
};

/**
 * 🔑 الصلاحيات المتاحة
 */
export const PERMISSIONS = {
  // صلاحيات المشتركين
  VIEW_SUBSCRIBERS: 'view_subscribers',
  ADD_SUBSCRIBER: 'add_subscriber',
  EDIT_SUBSCRIBER: 'edit_subscriber',
  DELETE_SUBSCRIBER: 'delete_subscriber',
  PRINT_SUBSCRIBER_INVOICE: 'print_subscriber_invoice',
  SEND_SUBSCRIBER_WHATSAPP: 'send_subscriber_whatsapp',

  // صلاحيات قراءات الاستهلاك
  VIEW_READINGS: 'view_readings',
  ADD_READING: 'add_reading',
  EDIT_READING: 'edit_reading',
  DELETE_READING: 'delete_reading',

  // صلاحيات سندات القبض
  VIEW_RECEIPTS: 'view_receipts',
  ADD_RECEIPT: 'add_receipt',
  EDIT_RECEIPT: 'edit_receipt',
  DELETE_RECEIPT: 'delete_receipt',

  // صلاحيات الموظفين
  VIEW_EMPLOYEES: 'view_employees',
  ADD_EMPLOYEE: 'add_employee',
  EDIT_EMPLOYEE: 'edit_employee',
  DELETE_EMPLOYEE: 'delete_employee',
  MANAGE_EMPLOYEE_WITHDRAWALS: 'manage_employee_withdrawals',

  // صلاحيات المصروفات
  VIEW_EXPENSES: 'view_expenses',
  ADD_EXPENSE: 'add_expense',
  EDIT_EXPENSE: 'edit_expense',
  DELETE_EXPENSE: 'delete_expense',

  // صلاحيات التقارير
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',

  // صلاحيات الإعدادات
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
  MANAGE_USERS: 'manage_users',
  MANAGE_PROJECTS: 'manage_projects'
};

/**
 * 🎯 مجموعات الصلاحيات الافتراضية لكل دور
 */
export const DEFAULT_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    // جميع الصلاحيات
    ...Object.values(PERMISSIONS)
  ],
  
  [ROLES.PROJECT_ADMIN]: [
    // جميع الصلاحيات ما عدا إدارة المشاريع
    ...Object.values(PERMISSIONS).filter(p => p !== PERMISSIONS.MANAGE_PROJECTS)
  ],
  
  [ROLES.USER]: [
    // صلاحيات محدودة للموظفين
    PERMISSIONS.VIEW_SUBSCRIBERS,
    PERMISSIONS.VIEW_READINGS,
    PERMISSIONS.ADD_READING,
    PERMISSIONS.EDIT_READING,
    PERMISSIONS.VIEW_RECEIPTS,
    PERMISSIONS.ADD_RECEIPT,
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.VIEW_EXPENSES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.PRINT_SUBSCRIBER_INVOICE,
    PERMISSIONS.SEND_SUBSCRIBER_WHATSAPP
  ]
};

/**
 * ✅ دالة التحقق من وجود صلاحية معينة
 * @param {array} userPermissions - قائمة صلاحيات المستخدم
 * @param {string} requiredPermission - الصلاحية المطلوبة
 * @returns {boolean}
 */
export function hasPermission(userPermissions, requiredPermission) {
  if (!userPermissions) return false;
  return userPermissions.includes(requiredPermission);
}

/**
 * ✅ دالة التحقق من وجود أي من الصلاحيات المطلوبة
 * @param {array} userPermissions - قائمة صلاحيات المستخدم
 * @param {array} requiredPermissions - قائمة الصلاحيات المطلوبة
 * @returns {boolean}
 */
export function hasAnyPermission(userPermissions, requiredPermissions) {
  if (!userPermissions) return false;
  return requiredPermissions.some(p => userPermissions.includes(p));
}

/**
 * ✅ دالة التحقق من وجود جميع الصلاحيات المطلوبة
 * @param {array} userPermissions - قائمة صلاحيات المستخدم
 * @param {array} requiredPermissions - قائمة الصلاحيات المطلوبة
 * @returns {boolean}
 */
export function hasAllPermissions(userPermissions, requiredPermissions) {
  if (!userPermissions) return false;
  return requiredPermissions.every(p => userPermissions.includes(p));
}

/**
 * 🛡️ دالة الحماية من الوصول غير المصرح
 * @param {string} requiredPermission - الصلاحية المطلوبة
 * @returns {boolean}
 */
export function checkPermissionOrRedirect(requiredPermission) {
  const userData = JSON.parse(localStorage.getItem('currentUser'));
  
  if (!userData || !hasPermission(userData.permissions, requiredPermission)) {
    alert('❌ ليس لديك صلاحية للوصول إلى هذه الصفحة');
    window.location.href = 'dashboard.html';
    return false;
  }
  
  return true;
}

/**
 * 🔄 دالة تحديث صلاحيات المستخدم
 * @param {string} userId - معرف المستخدم
 * @param {array} permissions - قائمة الصلاحيات الجديدة
 */
export async function updateUserPermissions(db, userId, permissions) {
  try {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    
    await setDoc(
      doc(db, 'users', userId),
      { permissions, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    
    return { success: true, message: 'تم تحديث الصلاحيات بنجاح' };
  } catch (error) {
    console.error('❌ خطأ في تحديث الصلاحيات:', error);
    return { success: false, message: error.message };
  }
}

/**
 * 🎯 دالة إنشاء مستخدم جديد مع صلاحيات
 * @param {object} db - Firestore instance
 * @param {string} userId - معرف المستخدم
 * @param {string} projectId - معرف المشروع
 * @param {string} role - الدور
 * @param {array} customPermissions - صلاحيات مخصصة (اختياري)
 */
export async function createUserWithRole(db, userId, projectId, role, customPermissions = null) {
  try {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    
    const permissions = customPermissions || DEFAULT_PERMISSIONS[role] || [];
    
    await setDoc(doc(db, 'users', userId), {
      userId,
      projectId,
      role,
      permissions,
      createdAt: new Date().toISOString(),
      status: 'active'
    });
    
    return { success: true, message: 'تم إنشاء المستخدم بنجاح' };
  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم:', error);
    return { success: false, message: error.message };
  }
}

/**
 * 🔒 دالة التحقق من صلاحيات Super Admin
 * @returns {boolean}
 */
export function isSuperAdmin() {
  const userData = JSON.parse(localStorage.getItem('currentUser'));
  return userData && userData.role === ROLES.SUPER_ADMIN;
}

/**
 * 🔒 دالة التحقق من صلاحيات Project Admin
 * @returns {boolean}
 */
export function isProjectAdmin() {
  const userData = JSON.parse(localStorage.getItem('currentUser'));
  return userData && userData.role === ROLES.PROJECT_ADMIN;
}

/**
 * 🔒 دالة التحقق من صلاحيات المستخدم العادي
 * @returns {boolean}
 */
export function isRegularUser() {
  const userData = JSON.parse(localStorage.getItem('currentUser'));
  return userData && userData.role === ROLES.USER;
}

/**
 * 📋 دالة الحصول على جميع الصلاحيات المتاحة
 */
export function getAllAvailablePermissions() {
  return Object.entries(PERMISSIONS).map(([key, value]) => ({
    key,
    value,
    label: key.replace(/_/g, ' ').toUpperCase()
  }));
}

/**
 * 🏢 دالة التحقق من أن المستخدم ينتمي إلى المشروع الحالي
 * @param {string} projectId - معرف المشروع
 * @returns {boolean}
 */
export function belongsToProject(projectId) {
  const userData = JSON.parse(localStorage.getItem('currentUser'));
  
  // Super Admin ينتمي إلى جميع المشاريع
  if (userData.role === ROLES.SUPER_ADMIN) {
    return true;
  }
  
  return userData.projectId === projectId;
}
