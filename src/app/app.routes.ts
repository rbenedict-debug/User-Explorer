import { Routes } from '@angular/router';
import { TicketsComponent } from './pages/tickets/tickets.component';
import { AssetsComponent } from './pages/assets/assets.component';
import { UsersComponent } from './pages/users/users.component';
import { RoleDetailComponent } from './pages/users/role-detail/role-detail.component';
import { UserDetailComponent } from './pages/users/user-detail/user-detail.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: 'tickets', pathMatch: 'full' },
  { path: 'tickets', component: TicketsComponent },
  { path: 'assets', component: AssetsComponent },
  {
    path: 'users',
    children: [
      { path: '', component: UsersComponent },
      { path: ':role', component: RoleDetailComponent },       // role table (level 2)
      { path: ':role/:user', component: UserDetailComponent }, // user page (level 3)
    ],
  },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'settings', component: SettingsComponent },
];
