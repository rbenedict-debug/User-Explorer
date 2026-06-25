// Single source of truth for the User Explorer roles.
// Used by the Section 1 cards and the role detail (child) pages.
export type RoleColor = 'blue' | 'teal' | 'purple' | 'orange' | 'green' | 'pink' | 'neutral';

export interface UserRole {
  slug: string;
  name: string;
  icon: string;
  color: RoleColor;
  count: string; // filler — to be refined
}

// "All Roles" leads the grid as the everyone-in-one-table entry point — it's an
// aggregate, not a peer role, so it gets the neutral treatment. "Agent" is the
// merged Administrator + Technician role (one operational support role); its count
// is the two former roles combined (128 + 342). "Guest" is a limited/external role.
export const USER_ROLES: UserRole[] = [
  { slug: 'all-roles',       name: 'All Roles',         icon: 'groups',          color: 'neutral', count: '16,034 users' },
  { slug: 'agent',           name: 'Agent',             icon: 'support_agent',   color: 'blue',    count: '470 users' },
  { slug: 'teacher',         name: 'Teacher',           icon: 'school',          color: 'purple',  count: '1,024 users' },
  { slug: 'staff',           name: 'Staff',             icon: 'badge',           color: 'orange',  count: '256 users' },
  { slug: 'student',         name: 'Student',           icon: 'backpack',        color: 'green',   count: '8,932 users' },
  { slug: 'parent-guardian', name: 'Parent / Guardian', icon: 'family_restroom', color: 'pink',    count: '5,310 users' },
  { slug: 'guest',           name: 'Guest',             icon: 'account_circle',  color: 'teal',    count: '42 users' },
];
