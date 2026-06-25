// Single source of truth for user rows — used by every drill-down table
// (role / grade / location), the level-3 user page, and the Explorer search.
// All data is filler for the design prototype.
//
// One enriched pool feeds every table; each table picks the columns it cares
// about (see the per-table components) and selects its rows via the helpers
// below. Optional fields are role-specific (e.g. only students carry `grade`
// and `guardian`; only parents carry `linkedStudents`).
import { USER_ROLES } from './roles';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;         // role slug (matches roles.ts)
  location: string;     // building display name (matches explorer-groups LOCATIONS name)
  locationSlug: string; // building slug (matches LOCATIONS slug)
  status: 'Active' | 'Inactive';
  lastActive: string;
  dateAdded: string;

  // ── Role-specific filler (optional) ──────────────────────────────────────
  grade?: string;          // grade slug — students
  gradeLabel?: string;     // 'Grade 3' — students
  homeroom?: string;       // students
  studentId?: string;      // students
  guardian?: string;       // students — primary guardian name
  assignedAssets?: number; // students, teachers, agents
  openTickets?: number;    // agents, staff
  department?: string;     // agents, staff, teachers
  title?: string;          // agents, staff
  phone?: string;          // parent/guardian, staff, agents
  linkedStudents?: number; // parent/guardian
}

export const USERS: UserRow[] = [
  // Agent is the merged Administrator + Technician role: both groups below carry
  // role: 'agent'. They're kept as separate blocks only to show the title range.
  // ── Agents · Administrators ────────────────────────────────────────────────────────
  { id: 'adm1', name: 'Taylor Morgan',   email: 'tmorgan@district.k12.us',   role: 'agent', location: 'District Office',      locationSlug: 'district-office',      status: 'Active',   lastActive: 'Jun 15, 2026', dateAdded: 'Feb 3, 2021',  department: 'District Administration', title: 'Superintendent',         phone: '(555) 740-3301' },
  { id: 'adm2', name: 'Avery Sullivan',  email: 'asullivan@district.k12.us', role: 'agent', location: 'Lincoln High',         locationSlug: 'lincoln-high',         status: 'Active',   lastActive: 'Jun 14, 2026', dateAdded: 'Jun 1, 2022',  department: 'School Administration',   title: 'Principal',              phone: '(555) 740-3312' },
  { id: 'adm3', name: 'Dana Whitfield',  email: 'dwhitfield@district.k12.us', role: 'agent', location: 'Washington Middle',   locationSlug: 'washington-middle',    status: 'Active',   lastActive: 'Jun 12, 2026', dateAdded: 'Aug 9, 2020',  department: 'School Administration',   title: 'Assistant Principal',    phone: '(555) 740-3327' },
  { id: 'adm4', name: 'Priya Raman',     email: 'praman@district.k12.us',     role: 'agent', location: 'District Office',      locationSlug: 'district-office',      status: 'Active',   lastActive: 'Jun 13, 2026', dateAdded: 'Jan 18, 2023', department: 'Curriculum & Instruction', title: 'Director of Curriculum', phone: '(555) 740-3344' },
  { id: 'adm5', name: 'Gregory Pena',    email: 'gpena@district.k12.us',      role: 'agent', location: 'Kennedy High',         locationSlug: 'kennedy-high',         status: 'Inactive', lastActive: 'Apr 2, 2026',  dateAdded: 'Sep 1, 2019',  department: 'School Administration',   title: 'Principal',              phone: '(555) 740-3359' },

  // ── Agents · Technicians ───────────────────────────────────────────────────────────
  { id: 'tec1', name: 'Jordan Lee',      email: 'jlee@district.k12.us',       role: 'agent', location: 'Washington Middle',  locationSlug: 'washington-middle',  status: 'Active',   lastActive: 'Jun 15, 2026', dateAdded: 'Jan 10, 2024', department: 'IT Services', title: 'Field Technician',      assignedAssets: 142, openTickets: 7 },
  { id: 'tec2', name: 'Marcus Bell',     email: 'mbell@district.k12.us',      role: 'agent', location: 'District Office',    locationSlug: 'district-office',    status: 'Active',   lastActive: 'Jun 14, 2026', dateAdded: 'Mar 22, 2022', department: 'IT Services', title: 'Senior Technician',     assignedAssets: 310, openTickets: 3 },
  { id: 'tec3', name: 'Hannah Voss',     email: 'hvoss@district.k12.us',      role: 'agent', location: 'Lincoln High',       locationSlug: 'lincoln-high',       status: 'Active',   lastActive: 'Jun 11, 2026', dateAdded: 'Oct 5, 2023',  department: 'IT Services', title: 'Field Technician',      assignedAssets: 198, openTickets: 12 },
  { id: 'tec4', name: 'Diego Ramos',     email: 'dramos@district.k12.us',     role: 'agent', location: 'Eastview Middle',    locationSlug: 'eastview-middle',    status: 'Active',   lastActive: 'Jun 9, 2026',  dateAdded: 'Jul 14, 2021', department: 'IT Services', title: 'Field Technician',      assignedAssets: 167, openTickets: 5 },
  { id: 'tec5', name: 'Olivia Brennan',  email: 'obrennan@district.k12.us',   role: 'agent', location: 'Kennedy High',       locationSlug: 'kennedy-high',       status: 'Active',   lastActive: 'Jun 13, 2026', dateAdded: 'Feb 28, 2024', department: 'IT Services', title: 'Deployment Technician', assignedAssets: 256, openTickets: 9 },
  { id: 'tec6', name: 'Sean Okafor',     email: 'sokafor@district.k12.us',    role: 'agent', location: 'Crestwood Middle',   locationSlug: 'crestwood-middle',   status: 'Inactive', lastActive: 'Feb 19, 2026', dateAdded: 'May 3, 2020',  department: 'IT Services', title: 'Field Technician',      assignedAssets: 88,  openTickets: 0 },

  // ── Teachers ──────────────────────────────────────────────────────────────
  { id: 'tch1', name: 'Alex Johnson',    email: 'ajohnson@district.k12.us',   role: 'teacher', location: 'Lincoln High',         locationSlug: 'lincoln-high',         status: 'Active',   lastActive: 'Jun 15, 2026', dateAdded: 'Aug 14, 2023', department: 'Mathematics',     assignedAssets: 2 },
  { id: 'tch2', name: 'Sam Rivera',      email: 'srivera@district.k12.us',    role: 'teacher', location: 'Roosevelt Elementary', locationSlug: 'roosevelt-elementary', status: 'Active',   lastActive: 'Jun 14, 2026', dateAdded: 'Sep 1, 2022',  department: 'Elementary Education', assignedAssets: 1 },
  { id: 'tch3', name: 'Riley Patel',     email: 'rpatel@district.k12.us',     role: 'teacher', location: 'Jefferson Elementary', locationSlug: 'jefferson-elementary', status: 'Active',   lastActive: 'Jun 13, 2026', dateAdded: 'Aug 25, 2022', department: 'Science',         assignedAssets: 2 },
  { id: 'tch4', name: 'Cameron Hayes',   email: 'chayes@district.k12.us',     role: 'teacher', location: 'Washington Middle',    locationSlug: 'washington-middle',    status: 'Active',   lastActive: 'Jun 10, 2026', dateAdded: 'Apr 5, 2022',  department: 'English Language Arts', assignedAssets: 1 },
  { id: 'tch5', name: 'Nadia Hassan',    email: 'nhassan@district.k12.us',    role: 'teacher', location: 'Kennedy High',         locationSlug: 'kennedy-high',         status: 'Active',   lastActive: 'Jun 12, 2026', dateAdded: 'Nov 14, 2023', department: 'Social Studies',  assignedAssets: 2 },
  { id: 'tch6', name: 'Eric Thompson',   email: 'ethompson@district.k12.us',  role: 'teacher', location: 'Lincoln High',         locationSlug: 'lincoln-high',         status: 'Active',   lastActive: 'Jun 9, 2026',  dateAdded: 'Aug 19, 2021', department: 'Physical Education', assignedAssets: 1 },
  { id: 'tch7', name: 'Grace Kim',       email: 'gkim@district.k12.us',       role: 'teacher', location: 'Adams Elementary',     locationSlug: 'adams-elementary',     status: 'Inactive', lastActive: 'Mar 30, 2026', dateAdded: 'Sep 6, 2020',  department: 'Art',             assignedAssets: 1 },
  { id: 'tch8', name: 'Leo Martinez',    email: 'lmartinez@district.k12.us',  role: 'teacher', location: 'Eastview Middle',      locationSlug: 'eastview-middle',      status: 'Active',   lastActive: 'Jun 14, 2026', dateAdded: 'Jan 9, 2024',  department: 'Music',           assignedAssets: 2 },

  // ── Staff ───────────────────────────────────────────────────────────────
  { id: 'stf1', name: 'Morgan Brooks',   email: 'mbrooks@district.k12.us',    role: 'staff', location: 'Washington Middle',    locationSlug: 'washington-middle',    status: 'Active',   lastActive: 'Jun 13, 2026', dateAdded: 'Mar 14, 2024', department: 'Front Office',    title: 'Office Coordinator', phone: '(555) 902-1156', openTickets: 1 },
  { id: 'stf2', name: 'Quinn Reyes',     email: 'qreyes@district.k12.us',     role: 'staff', location: 'Jefferson Elementary', locationSlug: 'jefferson-elementary', status: 'Active',   lastActive: 'Jun 12, 2026', dateAdded: 'Jan 30, 2024', department: 'Counseling',      title: 'School Counselor',   phone: '(555) 902-1187', openTickets: 0 },
  { id: 'stf3', name: 'Bianca Ferraro',  email: 'bferraro@district.k12.us',   role: 'staff', location: 'Kennedy High',         locationSlug: 'kennedy-high',         status: 'Active',   lastActive: 'Jun 11, 2026', dateAdded: 'Aug 22, 2021', department: 'Nutrition Services', title: 'Cafeteria Manager', phone: '(555) 902-1203', openTickets: 2 },
  { id: 'stf4', name: 'Victor Nunez',    email: 'vnunez@district.k12.us',     role: 'staff', location: 'Transportation & Operations', locationSlug: 'transportation-operations', status: 'Active', lastActive: 'Jun 10, 2026', dateAdded: 'Jun 7, 2020', department: 'Transportation', title: 'Dispatch Lead',      phone: '(555) 902-1244', openTickets: 4 },
  { id: 'stf5', name: 'Amara Okeke',     email: 'aokeke@district.k12.us',     role: 'staff', location: 'Lincoln High',         locationSlug: 'lincoln-high',         status: 'Inactive', lastActive: 'Jan 12, 2026', dateAdded: 'Sep 1, 2019',  department: 'Front Office',    title: 'Registrar',          phone: '(555) 902-1260', openTickets: 0 },

  // ── Students ────────────────────────────────────────────────────────────
  { id: 'stu1',  name: 'Casey Nguyen',   email: 'cnguyen@student.district.k12.us',  role: 'student', location: 'Lincoln High',         locationSlug: 'lincoln-high',         status: 'Active',   lastActive: 'Jun 15, 2026', dateAdded: 'Nov 18, 2023', grade: 'grade-10', gradeLabel: 'Grade 10', homeroom: 'Room 214', studentId: 'S-100482', guardian: 'Patricia Nguyen', assignedAssets: 2 },
  { id: 'stu2',  name: 'Drew Foster',    email: 'dfoster@student.district.k12.us',  role: 'student', location: 'Lincoln High',         locationSlug: 'lincoln-high',         status: 'Active',   lastActive: 'Jun 14, 2026', dateAdded: 'Sep 19, 2021', grade: 'grade-11', gradeLabel: 'Grade 11', homeroom: 'Room 118', studentId: 'S-100731', guardian: 'Marcus Foster',  assignedAssets: 1 },
  { id: 'stu3',  name: 'Maya Patel',     email: 'mpatel@student.district.k12.us',   role: 'student', location: 'Washington Middle',    locationSlug: 'washington-middle',    status: 'Active',   lastActive: 'Jun 13, 2026', dateAdded: 'Aug 24, 2024', grade: 'grade-7',  gradeLabel: 'Grade 7',  homeroom: 'Room 204', studentId: 'S-100920', guardian: 'Anita Patel',    assignedAssets: 1 },
  { id: 'stu4',  name: 'Liam Carter',    email: 'lcarter@student.district.k12.us',  role: 'student', location: 'Adams Elementary',     locationSlug: 'adams-elementary',     status: 'Active',   lastActive: 'Jun 12, 2026', dateAdded: 'Aug 20, 2025', grade: 'grade-3',  gradeLabel: 'Grade 3',  homeroom: 'Room 11',  studentId: 'S-101044', guardian: 'Jamie Carter',   assignedAssets: 1 },
  { id: 'stu5',  name: 'Sofia Reyes',    email: 'sreyes@student.district.k12.us',   role: 'student', location: 'Roosevelt Elementary', locationSlug: 'roosevelt-elementary', status: 'Active',   lastActive: 'Jun 11, 2026', dateAdded: 'Aug 21, 2024', grade: 'grade-5',  gradeLabel: 'Grade 5',  homeroom: 'Room 8',   studentId: 'S-101188', guardian: 'Elena Reyes',    assignedAssets: 1 },
  { id: 'stu6',  name: 'Noah Williams',  email: 'nwilliams@student.district.k12.us', role: 'student', location: 'Kennedy High',        locationSlug: 'kennedy-high',         status: 'Active',   lastActive: 'Jun 15, 2026', dateAdded: 'Sep 2, 2022',  grade: 'grade-12', gradeLabel: 'Grade 12', homeroom: 'Room 301', studentId: 'S-100210', guardian: 'Denise Williams', assignedAssets: 2 },
  { id: 'stu7',  name: 'Ava Thompson',   email: 'athompson@student.district.k12.us', role: 'student', location: 'Eastview Middle',     locationSlug: 'eastview-middle',      status: 'Active',   lastActive: 'Jun 10, 2026', dateAdded: 'Aug 23, 2023', grade: 'grade-8',  gradeLabel: 'Grade 8',  homeroom: 'Room 142', studentId: 'S-100655', guardian: 'Robert Thompson', assignedAssets: 1 },
  { id: 'stu8',  name: 'Ethan Brooks',   email: 'ebrooks@student.district.k12.us',  role: 'student', location: 'Crestwood Middle',     locationSlug: 'crestwood-middle',     status: 'Inactive', lastActive: 'Feb 14, 2026', dateAdded: 'Aug 25, 2023', grade: 'grade-6',  gradeLabel: 'Grade 6',  homeroom: 'Room 90',  studentId: 'S-100788', guardian: 'Karen Brooks',   assignedAssets: 1 },
  { id: 'stu9',  name: 'Isabella Cruz',  email: 'icruz@student.district.k12.us',    role: 'student', location: 'Franklin Early Learning Center', locationSlug: 'franklin-early-learning', status: 'Active', lastActive: 'Jun 9, 2026', dateAdded: 'Aug 26, 2025', grade: 'kindergarten', gradeLabel: 'Kindergarten', homeroom: 'Room K2', studentId: 'S-101302', guardian: 'Maria Cruz', assignedAssets: 0 },
  { id: 'stu10', name: 'Mason Clark',    email: 'mclark@student.district.k12.us',   role: 'student', location: 'Jefferson Elementary', locationSlug: 'jefferson-elementary', status: 'Active',   lastActive: 'Jun 13, 2026', dateAdded: 'Aug 22, 2025', grade: 'grade-1',  gradeLabel: 'Grade 1',  homeroom: 'Room 4',   studentId: 'S-101410', guardian: 'Devon Clark',    assignedAssets: 0 },

  // ── Parents / Guardians ───────────────────────────────────────────────────
  { id: 'par1', name: 'Jamie Carter',    email: 'jcarter@example.com',    role: 'parent-guardian', location: 'Adams Elementary',     locationSlug: 'adams-elementary',     status: 'Active',   lastActive: 'Jun 8, 2026',  dateAdded: 'Oct 9, 2020',  phone: '(555) 228-4471', linkedStudents: 1 },
  { id: 'par2', name: 'Patricia Nguyen', email: 'pnguyen@example.com',    role: 'parent-guardian', location: 'Lincoln High',         locationSlug: 'lincoln-high',         status: 'Active',   lastActive: 'Jun 7, 2026',  dateAdded: 'Aug 30, 2023', phone: '(555) 228-4490', linkedStudents: 2 },
  { id: 'par3', name: 'Elena Reyes',     email: 'ereyes@example.com',     role: 'parent-guardian', location: 'Roosevelt Elementary', locationSlug: 'roosevelt-elementary', status: 'Active',   lastActive: 'Jun 5, 2026',  dateAdded: 'Aug 21, 2024', phone: '(555) 228-4512', linkedStudents: 3 },
  { id: 'par4', name: 'Robert Thompson', email: 'rthompson@example.com',  role: 'parent-guardian', location: 'Eastview Middle',      locationSlug: 'eastview-middle',      status: 'Active',   lastActive: 'Jun 2, 2026',  dateAdded: 'Aug 23, 2023', phone: '(555) 228-4538', linkedStudents: 2 },
  { id: 'par5', name: 'Denise Williams', email: 'dwilliams@example.com',  role: 'parent-guardian', location: 'Kennedy High',         locationSlug: 'kennedy-high',         status: 'Inactive', lastActive: 'Dec 12, 2025', dateAdded: 'Sep 2, 2022',  phone: '(555) 228-4559', linkedStudents: 1 },
  { id: 'par6', name: 'Maria Cruz',      email: 'mcruz@example.com',      role: 'parent-guardian', location: 'Franklin Early Learning Center', locationSlug: 'franklin-early-learning', status: 'Active', lastActive: 'Jun 6, 2026', dateAdded: 'Aug 26, 2025', phone: '(555) 228-4577', linkedStudents: 1 },

  // ── Guests ──────────────────────────────────────────────────────────────
  // Limited / external accounts — substitutes, contractors, volunteers. Minimal
  // directory info and often time-boxed access (no department / title).
  { id: 'gst1', name: 'Pat Sullivan',    email: 'psullivan@guest.district.k12.us', role: 'guest', location: 'Lincoln High',         locationSlug: 'lincoln-high',         status: 'Active',   lastActive: 'Jun 14, 2026', dateAdded: 'May 1, 2026'  },
  { id: 'gst2', name: 'Robin Avery',     email: 'ravery@contractor.example.com',   role: 'guest', location: 'District Office',      locationSlug: 'district-office',      status: 'Active',   lastActive: 'Jun 12, 2026', dateAdded: 'Apr 18, 2026' },
  { id: 'gst3', name: 'Jesse Kim',       email: 'jkim@guest.district.k12.us',      role: 'guest', location: 'Washington Middle',    locationSlug: 'washington-middle',    status: 'Inactive', lastActive: 'Mar 9, 2026',  dateAdded: 'Feb 2, 2026'  },
  { id: 'gst4', name: 'Sam Delgado',     email: 'sdelgado@volunteer.example.com',  role: 'guest', location: 'Roosevelt Elementary', locationSlug: 'roosevelt-elementary', status: 'Active',   lastActive: 'Jun 10, 2026', dateAdded: 'May 20, 2026' },
];

// ── Display helpers ─────────────────────────────────────────────────────────
const ROLE_NAMES = new Map(USER_ROLES.map(r => [r.slug, r.name]));

/** Human-readable role name for a role slug ('teacher' → 'Teacher'). */
export function roleLabel(slug: string): string {
  return ROLE_NAMES.get(slug) ?? slug;
}

/** Look up any user by id, across the whole pool (used by the level-3 page). */
export function findUserById(id: string): UserRow | null {
  return USERS.find(u => u.id === id) ?? null;
}

// ── Row selectors (one per drill-down dimension) ─────────────────────────────
// Role is a real filter — roles are the meaningful dimension and each role table
// shows users of that role. Grade and Location use a deterministic, slug-seeded
// slice so every tile opens a populated, distinct-looking table in the prototype.
// TODO eng: replace the grade/location slices with real membership queries.

/** Deterministic slice of `items`, offset by a hash of `seed`. No randomness so
 *  renders are stable; capped at items.length so ids stay unique within a table. */
function seededSlice<T>(items: T[], seed: string, count: number): T[] {
  if (items.length === 0) return [];
  const sum = [...seed].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const offset = sum % items.length;
  const take = Math.min(count, items.length);
  return Array.from({ length: take }, (_, i) => items[(offset + i) % items.length]);
}

const STUDENTS = USERS.filter(u => u.role === 'student');

export function usersByRole(roleSlug: string): UserRow[] {
  return USERS.filter(u => u.role === roleSlug);
}

export function usersByGrade(gradeSlug: string): UserRow[] {
  // Grade cohorts are students; seeded slice keeps every grade tile populated.
  return seededSlice(STUDENTS, gradeSlug, 8);
}

export function usersByLocation(locationSlug: string): UserRow[] {
  // Anyone can be based at a building; seeded slice over the whole pool.
  return seededSlice(USERS, locationSlug, 10);
}

/** Real, navigable linked users of a given role — guardians for a student, students
 *  for a parent/staff member. Seeded by `seed` (the viewing user's id) so the set is
 *  stable and distinct per profile, and `excludeId` keeps a user out of their own
 *  linked list. Returns real rows so each linked card opens a populated profile.
 *  TODO eng: replace with real guardian / student link records. */
export function linkedUsers(seed: string, roleSlug: string, count: number, excludeId?: string): UserRow[] {
  const pool = USERS.filter(u => u.role === roleSlug && u.id !== excludeId);
  return seededSlice(pool, seed, count);
}
