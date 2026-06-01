/**
 * 🔐 نظام الأدوار والصلاحيات المتقدم (RBAC - Role Based Access Control)
 */

// ============================================
// 👤 تعريف الأدوار (Roles)
// ============================================

export const ROLES = {
  SUPER_ADMIN: 'super_admin',           // سوبر أدمن
  PROJECT_ADMIN: 'project_admin',       // أدمن مشروع
  PROJECT_MANAGER: 'project_manager',   // مدير المشروع
  ACCOUNTANT: 'accountant',             // محاسب
  EMPLOYEE: 'employee',                 // موظف
  VIEWER: 'viewer'                      // عارض فقط
};

// ============================================
// 🔑 تعريف الصلاحيات (Permissions)
// ============================================

export const PERMISSIONS = {
  // صلاحيات المشاريع
  CREATE_PROJECT: 'create_project',
  EDIT_PROJECT: 'edit_project',
  DELETE_PROJECT: 'delete_project',
  MANAGE_PROJECT_STATUS: 'manage_project_status',
  VIEW_ALL_PROJECTS: 'view_all_projects',

  // صلاحيات المستخدمين
  MANAGE_USERS: 'manage_users',
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  ASSIGN_ROLES: 'assign_roles',
  MANAGE_PERMISSIONS: 'manage_permissions',

  // صلاحيات المشتركين
  MANAGE_SUBSCRIBERS: 'manage_subscribers',
  ADD_SUBSCRIBER: 'add_subscriber',
  EDIT_SUBSCRIBER: 'edit_subscriber',
  DELETE_SUBSCRIBER: 'delete_subscriber',
  VIEW_SUBSCRIBERS: 'view_subscribers',

  // صلاحيات القراءات والفواتير
  MANAGE_READINGS: 'manage_readings',
  ADD_READING: 'add_reading',
  EDIT_READING: 'edit_reading',
  GENERATE_INVOICES: 'generate_invoices',

  // صلاحيات المصروفات
  MANAGE_EXPENSES: 'manage_expenses',
  ADD_EXPENSE: 'add_expense',
  EDIT_EXPENSE: 'edit_expense',
  DELETE_EXPENSE: 'delete_expense',

  // صلاحيات الموظفين
  MANAGE_EMPLOYEES: 'manage_employees',
  ADD_EMPLOYEE: 'add_employee',
  EDIT_EMPLOYEE: 'edit_employee',
  DELETE_EMPLOYEE: 'delete_employee',

  // صلاحيات الإعدادات
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data'
};

// ============================================
// 🎯 ربط الأدوار بالصلاحيات
// ============================================

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [ROLES.PROJECT_ADMIN]: [
    PERMISSIONS.EDIT_PROJECT,
    PERMISSIONS.VIEW_ALL_PROJECTS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.ASSIGN_ROLES,
    PERMISSIONS.MANAGE_PERMISSIONS,
    PERMISSIONS.MANAGE_SUBSCRIBERS,
    PERMISSIONS.ADD_SUBSCRIBER,
    PERMISSIONS.EDIT_SUBSCRIBER,
    PERMISSIONS.DELETE_SUBSCRIBER,
    PERMISSIONS.VIEW_SUBSCRIBERS,
    PERMISSIONS.MANAGE_READINGS,
    PERMISSIONS.ADD_READING,
    PERMISSIONS.EDIT_READING,
    PERMISSIONS.GENERATE_INVOICES,
    PERMISSIONS.MANAGE_EXPENSES,
    PERMISSIONS.ADD_EXPENSE,
    PERMISSIONS.EDIT_EXPENSE,
    PERMISSIONS.DELETE_EXPENSE,
    PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.ADD_EMPLOYEE,
    PERMISSIONS.EDIT_EMPLOYEE,
    PERMISSIONS.DELETE_EMPLOYEE,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA
  ],

  [ROLES.PROJECT_MANAGER]: [
    PERMISSIONS.MANAGE_SUBSCRIBERS,
    PERMISSIONS.ADD_SUBSCRIBER,
    PERMISSIONS.EDIT_SUBSCRIBER,
    PERMISSIONS.VIEW_SUBSCRIBERS,
    PERMISSIONS.MANAGE_READINGS,
    PERMISSIONS.ADD_READING,
    PERMISSIONS.EDIT_READING,
    PERMISSIONS.GENERATE_INVOICES,
    PERMISSIONS.MANAGE_EXPENSES,
    PERMISSIONS.ADD_EXPENSE,
    PERMISSIONS.EDIT_EXPENSE,
    PERMISSIONS.VIEW_REPORTS
  ],

  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.VIEW_SUBSCRIBERS,
    PERMISSIONS.MANAGE_READINGS,
    PERMISSIONS.ADD_READING,
    PERMISSIONS.EDIT_READING,
    PERMISSIONS.GENERATE_INVOICES,
    PERMISSIONS.MANAGE_EXPENSES,
    PERMISSIONS.ADD_EXPENSE,
    PERMISSIONS.EDIT_EXPENSE,
    PERMISSIONS.DELETE_EXPENSE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA
  ],

  [ROLES.EMPLOYEE]: [
    PERMISSIONS.ADD_READING,
    PERMISSIONS.VIEW_SUBSCRIBERS,
    PERMISSIONS.VIEW_REPORTS
  ],

  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_SUBSCRIBERS,
    PERMISSIONS.VIEW_REPORTS
  ]
};

// ============================================
// 🔍 دوال التحقق من الصلاحيات
// ============================================

export function hasPermission(userRole, requiredPermission) {
  if (!userRole || !requiredPermission) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(requiredPermission);
}

export function hasAllPermissions(userRole, requiredPermissions) {
  return requiredPermissions.every(perm => hasPermission(userRole, perm));
}

export function hasAnyPermission(userRole, requiredPermissions) {
  return requiredPermissions.some(perm => hasPermission(userRole, perm));
}

// ============================================
// 📋 فئة نظام الصلاحيات
// ============================================

export class PermissionsManager {
  constructor(userRole, projectId = null) {
    this.userRole = userRole;
    this.projectId = projectId;
    this.permissions = ROLE_PERMISSIONS[userRole] || [];
  }

  can(permission) {
    return this.permissions.includes(permission);
  }

  canAll(permissions) {
    return permissions.every(p => this.can(p));
  }

  canAny(permissions) {
    return permissions.some(p => this.can(p));
  }

  getAllPermissions() {
    return [...this.permissions];
  }

  isSuperAdmin() {
    return this.userRole === ROLES.SUPER_ADMIN;
  }

  isProjectAdmin() {
    return this.userRole === ROLES.PROJECT_ADMIN;
  }

  getRoleLevel() {
    const levels = {
      [ROLES.SUPER_ADMIN]: 5,
      [ROLES.PROJECT_ADMIN]: 4,
      [ROLES.PROJECT_MANAGER]: 3,
      [ROLES.ACCOUNTANT]: 2,
      [ROLES.EMPLOYEE]: 1,
      [ROLES.VIEWER]: 0
    };
    return levels[this.userRole] || -1;
  }

  isAtLeast(role) {
    return this.getRoleLevel() >= PermissionsManager.getLevel(role);
  }

  static getLevel(role) {
    const levels = {
      [ROLES.SUPER_ADMIN]: 5,
      [ROLES.PROJECT_ADMIN]: 4,
      [ROLES.PROJECT_MANAGER]: 3,
      [ROLES.ACCOUNTANT]: 2,
      [ROLES.EMPLOYEE]: 1,
      [ROLES.VIEWER]: 0
    };
    return levels[role] || -1;
  }
}

// ============================================
// 🏷️ وصف الأدوار
// ============================================

export const ROLE_DESCRIPTIONS = {
  [ROLES.SUPER_ADMIN]: {
    name: 'سوبر أدمن',
    description: 'تحكم كامل على النظام بالكامل',
    icon: '👑'
  },
  [ROLES.PROJECT_ADMIN]: {
    name: 'أدمن المشروع',
    description: 'إدارة كاملة للمشروع والمستخدمين',
    icon: '🔐'
  },
  [ROLES.PROJECT_MANAGER]: {
    name: 'مدير المشروع',
    description: 'إدارة العمليات اليومية',
    icon: '👨‍💼'
  },
  [ROLES.ACCOUNTANT]: {
    name: 'محاسب',
    description: 'إدارة المالية والفواتير',
    icon: '💰'
  },
  [ROLES.EMPLOYEE]: {
    name: 'موظف',
    description: 'صلاحيات محدودة للعمل',
    icon: '👤'
  },
  [ROLES.VIEWER]: {
    name: 'عارض',
    description: 'عرض البيانات فقط',
    icon: '👁️'
  }
};

// ============================================
// 📦 تصدير النظام
// ============================================

export const PermissionSystem = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_DESCRIPTIONS,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  PermissionsManager
};

export default PermissionSystem;
