import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { USER_ROLES } from './roles';

@Component({
  selector: 'app-users',
  imports: [RouterLink],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  host: { class: 'ds-page-content', role: 'main' }
})
export class UsersComponent {
  readonly roles = USER_ROLES;
}
