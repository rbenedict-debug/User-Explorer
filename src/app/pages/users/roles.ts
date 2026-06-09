// Single source of truth for the User Explorer roles.
// Used by the Section 1 cards and the role detail (child) pages.
export type RoleColor = 'blue' | 'teal' | 'purple' | 'orange' | 'green' | 'pink';

export interface UserRole {
  slug: string;
  name: string;
  icon: string;
  color: RoleColor;
  count: string; // filler — to be refined
}

export const USER_ROLES: UserRole[] = [
  { slug: 'administrator',   name: 'Administrator',     icon: 'admin_panel_settings', color: 'blue',   count: '128 users' },
  { slug: 'technician',      name: 'Technician',        icon: 'engineering',          color: 'teal',   count: '342 users' },
  { slug: 'teacher',         name: 'Teacher',           icon: 'school',               color: 'purple', count: '1,024 users' },
  { slug: 'staff',           name: 'Staff',             icon: 'badge',                color: 'orange', count: '256 users' },
  { slug: 'student',         name: 'Student',           icon: 'backpack',             color: 'green',  count: '8,932 users' },
  { slug: 'parent-guardian', name: 'Parent / Guardian', icon: 'family_restroom',      color: 'pink',   count: '5,310 users' },
];
