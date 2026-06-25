import { Component, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, OnDestroy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { USERS, UserRow } from '../../users.data';

declare const OnfloTableInit: { initTable: (config: any) => void };

@Component({
  selector: 'app-all-roles-table',
  imports: [RouterLink],
  templateUrl: './all-roles-table.component.html',
  styleUrl: './all-roles-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ds-page-content', role: 'main' },
})
export class AllRolesTableComponent implements AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly host = inject(ElementRef).nativeElement as HTMLElement;

  // The everyone view — the whole pool, not a single-role slice. The Role column
  // (a colored badge) is the differentiator and is filterable.
  private readonly roleSlug = 'all-roles';
  readonly users = signal<UserRow[]>(USERS);

  // Role slug → display label + ds-label colour, mirroring the role cards.
  private readonly roleMeta: Record<string, { label: string; color: string }> = {
    'agent':           { label: 'Agent',             color: 'blue' },
    'teacher':         { label: 'Teacher',           color: 'purple' },
    'staff':           { label: 'Staff',             color: 'orange' },
    'student':         { label: 'Student',           color: 'green' },
    'parent-guardian': { label: 'Parent / Guardian', color: 'pink' },
    'guest':           { label: 'Guest',             color: 'teal' },
  };

  roleLabel(slug: string): string {
    return this.roleMeta[slug]?.label ?? slug;
  }

  roleColor(slug: string): string {
    return this.roleMeta[slug]?.color ?? 'grey';
  }

  readonly columns = [
    { name: 'Name',        width: 220, type: 'text',  _categorical: false, _badgeOptions: null },
    { name: 'Email',       width: 250, type: 'text',  _categorical: false, _badgeOptions: null },
    { name: 'Role',        width: 180, type: 'badge', _categorical: true,  _badgeOptions: [
      { l: 'Agent', c: 'blue' }, { l: 'Teacher', c: 'purple' }, { l: 'Staff', c: 'orange' },
      { l: 'Student', c: 'green' }, { l: 'Parent / Guardian', c: 'pink' }, { l: 'Guest', c: 'teal' },
    ] },
    { name: 'Building',    width: 200, type: 'text',  _categorical: true,  _badgeOptions: null },
    { name: 'Status',      width: 130, type: 'badge', _categorical: true,  _badgeOptions: [{ l: 'Active', c: 'green' }, { l: 'Inactive', c: 'grey' }] },
    { name: 'Last Active', width: 150, type: 'date',  _categorical: false, _badgeOptions: null },
  ];

  get totalWidth(): number {
    return this.columns.reduce((sum, col) => sum + col.width, 0) + 20;
  }

  private readonly onTableClick = (event: Event): void => {
    const row = (event.target as HTMLElement).closest('tbody tr');
    if (!row) return;
    const cells = Array.from(row.querySelectorAll('td')).map(td => (td.textContent ?? '').trim());
    const pool = this.users();
    const user = pool.find(u => cells.includes(u.email)) ?? pool.find(u => cells.includes(u.name));
    if (user) {
      this.router.navigate(['/users', 'role', this.roleSlug, user.id]);
    }
  };

  ngAfterViewInit(): void {
    OnfloTableInit.initTable({
      entity: 'User',
      entityPlural: 'users',
      columns: this.columns,
      features: { pivot: true, rowGroups: true, values: true, filter: true, columnPanel: true, contextMenu: true, paginator: true },
      rows: [],
      extraFilterGroups: [],
    });
    this.host.addEventListener('click', this.onTableClick);
    this.cdr.detach();
  }

  ngOnDestroy(): void {
    this.host.removeEventListener('click', this.onTableClick);
  }
}
