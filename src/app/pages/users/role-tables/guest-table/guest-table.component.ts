import { Component, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, OnDestroy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { usersByRole, UserRow } from '../../users.data';

declare const OnfloTableInit: { initTable: (config: any) => void };

@Component({
  selector: 'app-guest-table',
  imports: [RouterLink],
  templateUrl: './guest-table.component.html',
  styleUrl: './guest-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ds-page-content', role: 'main' },
})
export class GuestTableComponent implements AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly host = inject(ElementRef).nativeElement as HTMLElement;

  private readonly roleSlug = 'guest';
  readonly users = signal<UserRow[]>(usersByRole(this.roleSlug));

  // Guests carry minimal directory info (no department / title) — limited,
  // often time-boxed access, so the table leans on dates over org metadata.
  readonly columns = [
    { name: 'Name',        width: 220, type: 'text',  _categorical: false, _badgeOptions: null },
    { name: 'Email',       width: 260, type: 'text',  _categorical: false, _badgeOptions: null },
    { name: 'Building',    width: 200, type: 'text',  _categorical: true,  _badgeOptions: null },
    { name: 'Status',      width: 130, type: 'badge', _categorical: true,  _badgeOptions: [{ l: 'Active', c: 'green' }, { l: 'Inactive', c: 'grey' }] },
    { name: 'Last Active', width: 150, type: 'date',  _categorical: false, _badgeOptions: null },
    { name: 'Date Added',  width: 150, type: 'date',  _categorical: false, _badgeOptions: null },
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
