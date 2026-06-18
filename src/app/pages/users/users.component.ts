import { AfterViewInit, Component, ElementRef, HostListener, computed, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { USER_ROLES } from './roles';
import { GRADES, LOCATIONS } from './explorer-groups';
import { USERS, UserRow } from './users.data';

// A role, grade, or location surfaced in the search panel.
interface GroupHit {
  slug: string;
  name: string;
  kind: 'Role' | 'Grade' | 'Location';
  icon: string;
  count: string;
}

const SEARCHABLE_GROUPS: GroupHit[] = [
  ...USER_ROLES.map(r => ({ slug: r.slug, name: r.name, kind: 'Role' as const, icon: r.icon, count: r.count })),
  ...GRADES.map(g => ({ slug: g.slug, name: g.name, kind: 'Grade' as const, icon: 'school', count: g.count })),
  ...LOCATIONS.map(l => ({ slug: l.slug, name: l.name, kind: 'Location' as const, icon: 'location_city', count: l.count })),
];

// Past this many rows, the menu shows the "keep typing" hint; the list itself
// is never truncated — it scrolls inside the viewport-capped panel.
const MANY_RESULTS_HINT_THRESHOLD = 8;

@Component({
  selector: 'app-users',
  imports: [RouterLink],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  host: { class: 'ds-page-content', role: 'main' }
})
export class UsersComponent implements AfterViewInit {
  readonly roles = USER_ROLES;
  readonly grades = GRADES;
  readonly totalLocations = LOCATIONS.length;

  // ── Global search (mock — filters local filler data) ──────────────────────
  readonly query = signal('');
  readonly searchOpen = signal(false);

  private readonly roleNames = new Map(USER_ROLES.map(r => [r.slug, r.name]));

  // Groups match on their name or their kind, so "grade" also surfaces
  // Pre-K and Kindergarten, "role" lists every role, etc.
  private readonly groupMatches = computed(() => {
    const q = this.normalizedQuery();
    if (!q) return [];
    return SEARCHABLE_GROUPS.filter(g =>
      g.name.toLowerCase().includes(q) || g.kind.toLowerCase().includes(q)
    );
  });

  private readonly userMatches = computed(() => {
    const q = this.normalizedQuery();
    if (!q) return [];
    return USERS.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.location.toLowerCase().includes(q)
    );
  });

  readonly groupResults = computed(() => this.groupMatches());
  readonly userResults = computed(() => this.userMatches());
  readonly panelOpen = computed(() => this.searchOpen() && this.normalizedQuery().length > 0);
  readonly manyResults = computed(() =>
    this.groupMatches().length + this.userMatches().length > MANY_RESULTS_HINT_THRESHOLD
  );

  private normalizedQuery(): string {
    return this.query().trim().toLowerCase();
  }

  onSearchInput(value: string): void {
    this.query.set(value);
    this.searchOpen.set(true);
  }

  clearSearch(input: HTMLInputElement): void {
    this.query.set('');
    input.value = '';
    input.focus();
  }

  closeSearch(): void {
    this.searchOpen.set(false);
  }

  // Close the results panel when clicking anywhere outside the search.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.user-search')) {
      this.searchOpen.set(false);
    }
  }

  roleName(user: UserRow): string {
    return this.roleNames.get(user.role) ?? 'User';
  }

  // ── Drill-down links ────────────────────────────────────────────────────────
  // Every group opens under its category segment: users/<category>/<slug>.
  private readonly kindSegment: Record<GroupHit['kind'], string> = {
    Role: 'role', Grade: 'grade', Location: 'location',
  };

  groupLink(group: GroupHit): string[] {
    return ['/users', this.kindSegment[group.kind], group.slug];
  }

  // Users open through their role table (level-3 lives under every category).
  userLink(user: UserRow): string[] {
    return ['/users', 'role', user.role, user.id];
  }

  // ── Location section filter ────────────────────────────────────────────────
  // Buildings are a long flat list (no type metadata in the system), so the
  // section gets its own type-to-filter field over name + address.
  readonly locationFilter = signal('');

  readonly filteredLocations = computed(() => {
    const q = this.locationFilter().trim().toLowerCase();
    if (!q) return LOCATIONS;
    return LOCATIONS.filter(l =>
      l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q)
    );
  });

  clearLocationFilter(input: HTMLInputElement): void {
    this.locationFilter.set('');
    input.value = '';
    input.focus();
  }

  // Reserve the unfiltered grid height on the results wrapper so typing in
  // the building filter doesn't shrink the page and yank the scroll position.
  private readonly locationsGrid = viewChild<ElementRef<HTMLElement>>('locationsGrid');
  readonly locationResultsMinHeight = signal(0);

  ngAfterViewInit(): void {
    this.measureLocationResults();
  }

  // Column count (and therefore grid height) changes with viewport width —
  // re-measure, but only while the full list is showing.
  @HostListener('window:resize')
  remeasureLocationResults(): void {
    if (!this.locationFilter().trim()) {
      this.measureLocationResults();
    }
  }

  private measureLocationResults(): void {
    const grid = this.locationsGrid()?.nativeElement;
    if (grid) {
      this.locationResultsMinHeight.set(grid.offsetHeight);
    }
  }
}
