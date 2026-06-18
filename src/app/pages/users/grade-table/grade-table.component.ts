import { Component, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { findUserGroup } from '../explorer-groups';
import { usersByGrade, UserRow } from '../users.data';

declare const OnfloTableInit: { initTable: (config: any) => void };

@Component({
  selector: 'app-grade-table',
  imports: [RouterLink],
  templateUrl: './grade-table.component.html',
  styleUrl: './grade-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ds-page-content', role: 'main' },
})
export class GradeTableComponent implements AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly host = inject(ElementRef).nativeElement as HTMLElement;

  // Arrived fresh from a grade tile; read the slug once for the heading + rows.
  readonly slug = this.route.snapshot.paramMap.get('slug') ?? '';
  readonly group = findUserGroup(this.slug);
  readonly users = signal<UserRow[]>(usersByGrade(this.slug));

  readonly columns = [
    { name: 'Name',            width: 220, type: 'text',   _categorical: false, _badgeOptions: null },
    { name: 'Email',           width: 250, type: 'text',   _categorical: false, _badgeOptions: null },
    { name: 'Building',        width: 200, type: 'text',   _categorical: true,  _badgeOptions: null },
    { name: 'Homeroom',        width: 130, type: 'text',   _categorical: false, _badgeOptions: null },
    { name: 'Assigned Assets', width: 150, type: 'number', _categorical: false, _badgeOptions: null },
    { name: 'Status',          width: 130, type: 'badge',  _categorical: true,  _badgeOptions: [{ l: 'Active', c: 'green' }, { l: 'Inactive', c: 'grey' }] },
    { name: 'Last Active',     width: 150, type: 'date',   _categorical: false, _badgeOptions: null },
  ];

  get totalWidth(): number {
    return this.columns.reduce((sum, col) => sum + col.width, 0) + 20;
  }

  // table-init.js re-renders rows via innerHTML (stripping Angular's encapsulation
  // attribute), so delegate the row click from the host and match by email/name.
  private readonly onTableClick = (event: Event): void => {
    const row = (event.target as HTMLElement).closest('tbody tr');
    if (!row) return;
    const cells = Array.from(row.querySelectorAll('td')).map(td => (td.textContent ?? '').trim());
    const pool = this.users();
    const user = pool.find(u => cells.includes(u.email)) ?? pool.find(u => cells.includes(u.name));
    if (user) {
      this.router.navigate(['/users', 'grade', this.slug, user.id]);
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
