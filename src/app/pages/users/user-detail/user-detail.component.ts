import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { USER_ROLES } from '../roles';
import { USERS } from '../users.data';

@Component({
  selector: 'app-user-detail',
  imports: [RouterLink],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
  host: { class: 'ds-page-content', role: 'main' }
})
export class UserDetailComponent {
  private readonly route = inject(ActivatedRoute);

  private readonly params = toSignal(
    this.route.paramMap.pipe(map(p => ({ role: p.get('role') ?? '', user: p.get('user') ?? '' }))),
    {
      initialValue: {
        role: this.route.snapshot.paramMap.get('role') ?? '',
        user: this.route.snapshot.paramMap.get('user') ?? '',
      }
    }
  );

  readonly role = computed(() => USER_ROLES.find(r => r.slug === this.params().role) ?? null);
  readonly user = computed(() => USERS.find(u => u.id === this.params().user) ?? null);
}
