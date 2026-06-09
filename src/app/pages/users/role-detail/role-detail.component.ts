import { Component, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, OnDestroy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { USER_ROLES } from '../roles';
import { USERS, UserRow } from '../users.data';

// Provided globally by runtime/table-init.js (wired in angular.json scripts).
declare const OnfloTableInit: { initTable: (config: any) => void };

@Component({
  selector: 'app-role-detail',
  imports: [RouterLink],
  templateUrl: './role-detail.component.html',
  styleUrl: './role-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ds-page-content', role: 'main' }
})
export class RoleDetailComponent implements AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly host = inject(ElementRef).nativeElement as HTMLElement;

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map(p => p.get('role') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('role') ?? '' }
  );

  readonly role = computed(() => USER_ROLES.find(r => r.slug === this.slug()) ?? null);

  readonly users = signal<UserRow[]>(USERS);

  // Column defs — names must match the <th> labels exactly.
  readonly columns = [
    { name: 'Name',        width: 220, type: 'text',  _categorical: false, _badgeOptions: null },
    { name: 'Email',       width: 250, type: 'text',  _categorical: false, _badgeOptions: null },
    { name: 'Location',    width: 180, type: 'text',  _categorical: true,  _badgeOptions: null },
    { name: 'Status',      width: 130, type: 'badge', _categorical: true,  _badgeOptions: [
      { l: 'Active', c: 'green' }, { l: 'Inactive', c: 'grey' }
    ]},
    { name: 'Last Active', width: 160, type: 'date',  _categorical: false, _badgeOptions: null },
    { name: 'Date Added',  width: 150, type: 'date',  _categorical: false, _badgeOptions: null },
  ];

  get totalWidth(): number {
    return this.columns.reduce((sum, col) => sum + col.width, 0) + 20;
  }

  // Row click → open that user's page. table-init.js owns the row DOM (re-renders
  // via innerHTML), so we delegate from the host and identify the row by its email
  // cell rather than relying on bindings/attributes that get stripped on re-render.
  private readonly onTableClick = (event: Event): void => {
    const row = (event.target as HTMLElement).closest('tbody tr');
    if (!row) return;
    const cells = Array.from(row.querySelectorAll('td')).map(td => (td.textContent ?? '').trim());
    // Match by email (unique); fall back to name in case the Email column is hidden.
    const user = USERS.find(u => cells.includes(u.email)) ?? USERS.find(u => cells.includes(u.name));
    if (user) {
      this.router.navigate(['/users', this.slug(), user.id]);
    }
  };

  ngAfterViewInit(): void {
    OnfloTableInit.initTable({
      entity: 'User',
      entityPlural: 'users',
      columns: this.columns,
      features: {
        pivot: true, rowGroups: true, values: true,
        filter: true, columnPanel: true, contextMenu: true, paginator: true,
      },
      rows: [], // table-init.js reads rows from the rendered DOM
      extraFilterGroups: [],
    });
    this.host.addEventListener('click', this.onTableClick);
    // Hand full DOM control to table-init.js after Angular's initial render.
    this.cdr.detach();
  }

  ngOnDestroy(): void {
    this.host.removeEventListener('click', this.onTableClick);
  }
}
