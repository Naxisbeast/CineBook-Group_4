export const ADMIN_ROLES = ['Administrator', 'System Administrator'];
export const MANAGER_ROLE = 'Cinema Manager';

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(role);
}

export function isManagerRole(role) {
  return role === MANAGER_ROLE;
}

export function dashboardPathForRole(role) {
  if (isAdminRole(role)) return '/admin';
  if (isManagerRole(role)) return '/manager';
  return '/profile';
}
