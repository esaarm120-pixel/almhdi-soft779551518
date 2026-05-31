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

  VIEW_READINGS: 'view_readings',
  ADD_READING: 'add_reading',
  EDIT_READING: 'edit_reading',
  DELETE_READING: 'delete_reading',

  VIEW_EXPENSES: 'view_expenses',
  ADD_EXPENSE: 'add_expense',
  EDIT_EXPENSE: 'edit_expense',
  DELETE_EXPENSE: 'delete_expense',

  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',

  MANAGE_USERS: 'manage_users'
};

// ============================================
// Helpers فقط (بدون localStorage)
// ============================================

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

export function getAllAvailablePermissions() {
  return Object.entries(PERMISSIONS).map(([key, value]) => ({
    key,
    value,
    label: key.replace(/_/g, ' ')
  }));
}
