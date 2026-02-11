/**
 * Role-Based Access Control (RBAC) Configuration
 *
 * This file defines what features each role can access in the system.
 */

export type UserRole = 'admin' | 'physician' | 'doctor' | 'nurse' | 'receptionist';

export type Permission =
  // Patient Management
  | 'patient:register'
  | 'patient:view'
  | 'patient:edit'
  | 'patient:delete'
  | 'patient:medical-records'

  // Appointments
  | 'appointments:view'
  | 'appointments:create'
  | 'appointments:edit'
  | 'appointments:cancel'

  // Files & Documents
  | 'files:upload'
  | 'files:view'
  | 'files:delete'
  | 'files:migrate'

  // Prescriptions
  | 'prescriptions:view'
  | 'prescriptions:create'
  | 'prescriptions:edit'

  // Lab Results
  | 'lab:view'
  | 'lab:upload'
  | 'lab:edit'

  // Billing & Financial
  | 'billing:view'
  | 'billing:create'
  | 'billing:edit'

  // Analytics & Reports
  | 'analytics:view'

  // Staff Management
  | 'staff:view'
  | 'staff:invite'
  | 'staff:edit'
  | 'staff:delete'

  // Communication
  | 'chat:access'
  | 'alerts:view';

/**
 * Permission matrix defining what each role can do
 */
const rolePermissions: Record<UserRole, Permission[]> = {
  // Admin - Full access to everything
  admin: [
    // Patient Management
    'patient:register',
    'patient:view',
    'patient:edit',
    'patient:delete',
    'patient:medical-records',

    // Appointments
    'appointments:view',
    'appointments:create',
    'appointments:edit',
    'appointments:cancel',

    // Files
    'files:upload',
    'files:view',
    'files:delete',
    'files:migrate',

    // Prescriptions
    'prescriptions:view',
    'prescriptions:create',
    'prescriptions:edit',

    // Lab Results
    'lab:view',
    'lab:upload',
    'lab:edit',

    // Billing
    'billing:view',
    'billing:create',
    'billing:edit',

    // Analytics
    'analytics:view',

    // Staff Management
    'staff:view',
    'staff:invite',
    'staff:edit',
    'staff:delete',

    // Communication
    'chat:access',
    'alerts:view',
  ],

  // Physician/Doctor - Full clinical access, no staff management or billing
  physician: [
    // Patient Management
    'patient:register',
    'patient:view',
    'patient:edit',
    'patient:medical-records',

    // Appointments
    'appointments:view',
    'appointments:create',
    'appointments:edit',
    'appointments:cancel',

    // Files
    'files:upload',
    'files:view',
    'files:migrate',

    // Prescriptions (full access)
    'prescriptions:view',
    'prescriptions:create',
    'prescriptions:edit',

    // Lab Results (full access)
    'lab:view',
    'lab:upload',
    'lab:edit',

    // Billing (view only)
    'billing:view',

    // Analytics
    'analytics:view',

    // Staff (view only)
    'staff:view',

    // Communication
    'chat:access',
    'alerts:view',
  ],

  // Doctor - Same as physician (alias)
  doctor: [
    'patient:register',
    'patient:view',
    'patient:edit',
    'patient:medical-records',
    'appointments:view',
    'appointments:create',
    'appointments:edit',
    'appointments:cancel',
    'files:upload',
    'files:view',
    'files:migrate',
    'prescriptions:view',
    'prescriptions:create',
    'prescriptions:edit',
    'lab:view',
    'lab:upload',
    'lab:edit',
    'billing:view',
    'analytics:view',
    'staff:view',
    'chat:access',
    'alerts:view',
  ],

  // Nurse - Clinical support, can view medical records, cannot prescribe
  nurse: [
    // Patient Management (no delete)
    'patient:register',
    'patient:view',
    'patient:edit',
    'patient:medical-records',

    // Appointments
    'appointments:view',
    'appointments:create',
    'appointments:edit',
    'appointments:cancel',

    // Files
    'files:upload',
    'files:view',
    'files:migrate',

    // Prescriptions (view only, cannot create/edit)
    'prescriptions:view',

    // Lab Results (view and upload, cannot edit)
    'lab:view',
    'lab:upload',

    // No billing access

    // Analytics (view only)
    'analytics:view',

    // Staff (view only)
    'staff:view',

    // Communication
    'chat:access',
    'alerts:view',
  ],

  // Receptionist - Administrative tasks, no medical records access
  receptionist: [
    // Patient Management (limited - no medical records)
    'patient:register',
    'patient:view', // Only demographics, no medical data
    'patient:edit', // Only demographics

    // Appointments (full access)
    'appointments:view',
    'appointments:create',
    'appointments:edit',
    'appointments:cancel',

    // Files (limited - administrative only)
    'files:view',
    'files:migrate',

    // No prescription access

    // No lab results access

    // Billing (full access)
    'billing:view',
    'billing:create',
    'billing:edit',

    // Analytics (view only)
    'analytics:view',

    // Staff (view only)
    'staff:view',

    // Communication
    'chat:access',
    'alerts:view',
  ],
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRole: string | undefined, permission: Permission): boolean {
  if (!userRole) return false;

  const role = userRole.toLowerCase() as UserRole;
  const permissions = rolePermissions[role];

  if (!permissions) return false;

  return permissions.includes(permission);
}

/**
 * Check if a user has ANY of the specified permissions
 */
export function hasAnyPermission(userRole: string | undefined, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Check if a user has ALL of the specified permissions
 */
export function hasAllPermissions(userRole: string | undefined, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(userRole: string | undefined): Permission[] {
  if (!userRole) return [];

  const role = userRole.toLowerCase() as UserRole;
  return rolePermissions[role] || [];
}

/**
 * Check if user can access medical records
 * Receptionists should NOT see medical information
 */
export function canAccessMedicalRecords(userRole: string | undefined): boolean {
  return hasPermission(userRole, 'patient:medical-records');
}
