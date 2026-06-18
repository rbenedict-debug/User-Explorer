// Grades and locations for the User Explorer sections, plus the slug → group
// lookup used by the drill-down (table) and user pages for titles/breadcrumbs.
// Both lists are intentionally FLAT: districts split grades differently (not
// all have a middle school) and the system has no building-type metadata, so
// the UI can't assume any grouping beyond the items themselves.
// All counts are filler — to be refined.
import { USER_ROLES } from './roles';

export interface GradeEntry {
  slug: string;
  tile: string;  // short tile label ('PK', 'K', '1' … '12')
  name: string;  // full name for titles/aria ('Pre-K', 'Grade 3')
  count: string; // filler
}

// Rendered in canonical grade order — the order itself is what makes the
// section scannable. The set comes from the district's data.
export const GRADES: GradeEntry[] = [
  { slug: 'pre-k',        tile: 'PK', name: 'Pre-K',        count: '388 users' },
  { slug: 'kindergarten', tile: 'K',  name: 'Kindergarten', count: '612 users' },
  { slug: 'grade-1',      tile: '1',  name: 'Grade 1',      count: '645 users' },
  { slug: 'grade-2',      tile: '2',  name: 'Grade 2',      count: '638 users' },
  { slug: 'grade-3',      tile: '3',  name: 'Grade 3',      count: '651 users' },
  { slug: 'grade-4',      tile: '4',  name: 'Grade 4',      count: '660 users' },
  { slug: 'grade-5',      tile: '5',  name: 'Grade 5',      count: '642 users' },
  { slug: 'grade-6',      tile: '6',  name: 'Grade 6',      count: '681 users' },
  { slug: 'grade-7',      tile: '7',  name: 'Grade 7',      count: '702 users' },
  { slug: 'grade-8',      tile: '8',  name: 'Grade 8',      count: '694 users' },
  { slug: 'grade-9',      tile: '9',  name: 'Grade 9',      count: '678 users' },
  { slug: 'grade-10',     tile: '10', name: 'Grade 10',     count: '662 users' },
  { slug: 'grade-11',     tile: '11', name: 'Grade 11',     count: '645 users' },
  { slug: 'grade-12',     tile: '12', name: 'Grade 12',     count: '634 users' },
];

export interface LocationEntry {
  slug: string;
  name: string;
  address: string; // filler
  count: string;   // filler
}

// Kept alphabetical — with no building-type metadata, name order plus the
// section filter is how users find a building in a long list.
export const LOCATIONS: LocationEntry[] = [
  { slug: 'adams-elementary',          name: 'Adams Elementary',                address: '940 Adams Street',       count: '612 users' },
  { slug: 'brookfield-elementary',     name: 'Brookfield Elementary',           address: '12 Brookfield Lane',     count: '588 users' },
  { slug: 'cedar-park-elementary',     name: 'Cedar Park Elementary',           address: '2105 Cedar Park Road',   count: '642 users' },
  { slug: 'crestwood-middle',          name: 'Crestwood Middle',                address: '400 Crestwood Drive',    count: '814 users' },
  { slug: 'district-office',           name: 'District Office',                 address: '45 Civic Plaza',         count: '164 users' },
  { slug: 'eastview-middle',           name: 'Eastview Middle',                 address: '415 Eastview Parkway',   count: '902 users' },
  { slug: 'fairview-elementary',       name: 'Fairview Elementary',             address: '78 Fairview Avenue',     count: '559 users' },
  { slug: 'franklin-early-learning',   name: 'Franklin Early Learning Center',  address: '230 Franklin Street',    count: '318 users' },
  { slug: 'garfield-elementary',       name: 'Garfield Elementary',             address: '1800 Garfield Blvd',     count: '605 users' },
  { slug: 'hamilton-middle',           name: 'Hamilton Middle',                 address: '92 Hamilton Way',        count: '776 users' },
  { slug: 'jefferson-elementary',      name: 'Jefferson Elementary',            address: '320 Birch Avenue',       count: '631 users' },
  { slug: 'kennedy-high',              name: 'Kennedy High',                    address: '1 Kennedy Drive',        count: '1,648 users' },
  { slug: 'lakeside-elementary',       name: 'Lakeside Elementary',             address: '55 Lakeshore Road',      count: '577 users' },
  { slug: 'lincoln-high',              name: 'Lincoln High',                    address: '1 Lincoln Way',          count: '1,812 users' },
  { slug: 'maplewood-elementary',      name: 'Maplewood Elementary',            address: '88 Maplewood Drive',     count: '596 users' },
  { slug: 'northside-early-learning',  name: 'Northside Early Learning Center', address: '64 North Hill Road',     count: '287 users' },
  { slug: 'oak-ridge-elementary',      name: 'Oak Ridge Elementary',            address: '510 Oak Ridge Parkway',  count: '623 users' },
  { slug: 'roosevelt-elementary',      name: 'Roosevelt Elementary',            address: '1450 Oak Street',        count: '644 users' },
  { slug: 'sunset-hill-elementary',    name: 'Sunset Hill Elementary',          address: '9 Sunset Hill Road',     count: '568 users' },
  { slug: 'transportation-operations', name: 'Transportation & Operations',     address: '9 Depot Road',           count: '57 users' },
  { slug: 'washington-middle',         name: 'Washington Middle',               address: '700 Washington Blvd',    count: '841 users' },
  { slug: 'westbrook-high',            name: 'Westbrook High',                  address: '600 Westbrook Parkway',  count: '1,503 users' },
];

// ── Slug lookup across every explorer group ────────────────────────────────
// Roles, grades, and locations all drill into the same users table route
// (users/:group); the detail pages resolve the heading text through this.
export interface UserGroupRef {
  slug: string;
  name: string;
}

const ALL_GROUPS: UserGroupRef[] = [...USER_ROLES, ...GRADES, ...LOCATIONS];

export function findUserGroup(slug: string): UserGroupRef | null {
  return ALL_GROUPS.find(group => group.slug === slug) ?? null;
}
