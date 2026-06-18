import { Routes } from '@angular/router';
import { TicketsComponent } from './pages/tickets/tickets.component';
import { AssetsComponent } from './pages/assets/assets.component';
import { UsersComponent } from './pages/users/users.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { SettingsComponent } from './pages/settings/settings.component';

// Level-2 drill-down tables. Role tables are individual components (their columns
// differ by role); grade and location are one component each, scoped by :slug.
import { AdministratorTableComponent } from './pages/users/role-tables/administrator-table/administrator-table.component';
import { TechnicianTableComponent } from './pages/users/role-tables/technician-table/technician-table.component';
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

      // Role drill-down — one table per role (each has role-specific columns).
      { path: 'role/administrator',   component: AdministratorTableComponent },
      { path: 'role/technician',      component: TechnicianTableComponent },
      { path: 'role/teacher',         component: TeacherTableComponent },
      { path: 'role/staff',           component: StaffTableComponent },
      { path: 'role/student',         component: StudentTableComponent },
      { path: 'role/parent-guardian', component: ParentGuardianTableComponent },

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
