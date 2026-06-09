// Single source of truth for user rows — used by the role table and the user page.
// Filler data, same set for every role for now (to be refined).
export interface UserRow {
  id: string;
  name: string;
  email: string;
  location: string;
  status: 'Active' | 'Inactive';
  lastActive: string;
  dateAdded: string;
}

export const USERS: UserRow[] = [
  { id: 'u1',  name: 'Alex Johnson',   email: 'ajohnson@district.k12.us',  location: 'Lincoln High',         status: 'Active',   lastActive: 'Jun 8, 2026',  dateAdded: 'Aug 14, 2023' },
  { id: 'u2',  name: 'Sam Rivera',     email: 'srivera@district.k12.us',   location: 'Roosevelt Elementary', status: 'Active',   lastActive: 'Jun 9, 2026',  dateAdded: 'Sep 1, 2022' },
  { id: 'u3',  name: 'Jordan Lee',     email: 'jlee@district.k12.us',      location: 'Washington Middle',    status: 'Active',   lastActive: 'Jun 5, 2026',  dateAdded: 'Jan 10, 2024' },
  { id: 'u4',  name: 'Taylor Morgan',  email: 'tmorgan@district.k12.us',   location: 'District Office',      status: 'Inactive', lastActive: 'Mar 22, 2026', dateAdded: 'Feb 3, 2021' },
  { id: 'u5',  name: 'Casey Nguyen',   email: 'cnguyen@district.k12.us',   location: 'Lincoln High',         status: 'Active',   lastActive: 'Jun 9, 2026',  dateAdded: 'Nov 18, 2023' },
  { id: 'u6',  name: 'Riley Patel',    email: 'rpatel@district.k12.us',    location: 'Jefferson Elementary', status: 'Active',   lastActive: 'Jun 7, 2026',  dateAdded: 'Aug 25, 2022' },
  { id: 'u7',  name: 'Morgan Brooks',  email: 'mbrooks@district.k12.us',   location: 'Washington Middle',    status: 'Active',   lastActive: 'Jun 2, 2026',  dateAdded: 'Mar 14, 2024' },
  { id: 'u8',  name: 'Jamie Carter',   email: 'jcarter@district.k12.us',   location: 'Roosevelt Elementary', status: 'Inactive', lastActive: 'Dec 12, 2025', dateAdded: 'Oct 9, 2020' },
  { id: 'u9',  name: 'Avery Sullivan', email: 'asullivan@district.k12.us', location: 'District Office',      status: 'Active',   lastActive: 'Jun 9, 2026',  dateAdded: 'Jun 1, 2023' },
  { id: 'u10', name: 'Drew Foster',    email: 'dfoster@district.k12.us',   location: 'Lincoln High',         status: 'Active',   lastActive: 'Jun 6, 2026',  dateAdded: 'Sep 19, 2021' },
  { id: 'u11', name: 'Quinn Reyes',    email: 'qreyes@district.k12.us',    location: 'Jefferson Elementary', status: 'Active',   lastActive: 'Jun 8, 2026',  dateAdded: 'Jan 30, 2024' },
  { id: 'u12', name: 'Cameron Hayes',  email: 'chayes@district.k12.us',    location: 'Washington Middle',    status: 'Active',   lastActive: 'May 28, 2026', dateAdded: 'Apr 5, 2022' },
];
