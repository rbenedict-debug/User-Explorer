import { Routes } from '@angular/router';
import { TicketsComponent } from './pages/tickets/tickets.component';
import { AssetsComponent } from './pages/assets/assets.component';
import { UsersComponent } from './pages/users/users.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { SettingsComponent } from './pages/settings/settings.component';

// Level-2 drill-down tables. Role tables are individual components (their columns
// differ by role); grade and location are one component each, scoped by :slug.
import { AllRolesTableComponent } from './pages/users/role-tables/all-roles-table/all-roles-table.component';
import { AgentTableComponent } from './pages/users/role-tables/agent-table/agent-table.component';
import { GuestTableComponent } from './pages/users/role-tables/guest-table/guest-table.component';
import { TeacherTableComponent } from './pages/users/role-tables/teacher-table/teacher-table.component';
import { StaffTableComponent } from './pages/users/role-tables/staff-table/staff-table.component';
import { StudentTableComponent } from './pages/users/role-tables/student-table/student-table.component';
import { ParentGuardianTableComponent } from './pages/users/role-tables/parent-guardian-table/parent-guardian-table.component';
import { GradeTableComponent } from './pages/users/grade-table/grade-table.component';
import { LocationTableComponent } from './pages/users/location-table/location-table.component';
import { UserDetailComponent } from './pages/users/user-detail/user-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { path: 'tickets', component: TicketsComponent },
  { path: 'assets', component: AssetsComponent },
  {
    path: 'users',
    children: [
      { path: '', component: UsersComponent },

      // Role drill-down — one table per role (each has role-specific columns),
      // plus All Roles (the whole directory in one table).
      { path: 'role/all-roles',       component: AllRolesTableComponent },
      { path: 'role/agent',           component: AgentTableComponent },
      { path: 'role/teacher',         component: TeacherTableComponent },
      { path: 'role/staff',           component: StaffTableComponent },
      { path: 'role/student',         component: StudentTableComponent },
      { path: 'role/parent',          component: ParentGuardianTableComponent },
      { path: 'role/guest',           component: GuestTableComponent },

      // Grade & location drill-down — one shared table each, scoped by slug.
      { path: 'grade/:slug',    component: GradeTableComponent },
      { path: 'location/:slug', component: LocationTableComponent },

      // Level-3 user page — shared across every category.
      // URL shape: users/<category>/<groupSlug>/<userId>
      { path: ':category/:groupSlug/:user', component: UserDetailComponent },
    ],
  },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'settings', component: SettingsComponent },
];
