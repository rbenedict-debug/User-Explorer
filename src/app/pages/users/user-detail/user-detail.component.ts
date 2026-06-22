import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { findUserGroup } from '../explorer-groups';
import { UserRow, findUserById, linkedUsers, roleLabel } from '../users.data';

// Each section renders from a small typed model so real data can be swapped in
// later without touching the template. Filler values are flagged inline.
// A field holds either a single value or several stacked values (e.g. a guardian
// with multiple emails / phones).
interface InfoField { label: string; value: string | string[]; }
interface AssetRow { icon: string; name: string; tag: string; status: string; color: string; }
interface TicketStat { icon: string; label: string; value: string; tone: 'blue' | 'orange' | 'purple' | 'grey'; }
interface RecentTicket { subject: string; status: string; color: string; date: string; }
interface UserNote { author: string; initials: string; timestamp: string; body: string; }
interface LinkedField { label: string; value: string; }
interface LinkedPerson { id: string; role: string; name: string; initials: string; badge: string; fields: LinkedField[]; }
interface LinkedSection { title: string; badgeColor: string; people: LinkedPerson[]; }

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
    this.route.paramMap.pipe(map(p => ({
      category: p.get('category') ?? '',
      groupSlug: p.get('groupSlug') ?? '',
      user: p.get('user') ?? '',
    }))),
    {
      initialValue: {
        category: this.route.snapshot.paramMap.get('category') ?? '',
        groupSlug: this.route.snapshot.paramMap.get('groupSlug') ?? '',
        user: this.route.snapshot.paramMap.get('user') ?? '',
      }
    }
  );

  // The group this user was opened from — a role, grade, or location. Drives the
  // breadcrumb only; the profile itself is driven by the user's own role below.
  readonly group = computed(() => findUserGroup(this.params().groupSlug));
  readonly category = computed(() => this.params().category);
  readonly user = computed(() => findUserById(this.params().user));

  // The user's own role name (independent of how they were reached).
  readonly userRoleName = computed(() => roleLabel(this.user()?.role ?? ''));

  // Avatar monogram from the user's name.
  readonly initials = computed(() => this.initialsOf(this.user()?.name ?? ''));

  // ── Basic Information — the fields shown here are dynamic: a district maps them
  // from its integration + field-mapping config, so the set (and any custom fields)
  // varies by role. All values are filler for the prototype.
  // TODO eng: render the district's actual mapped field set (standard + custom).
  readonly basicInfo = computed<InfoField[]>(() => {
    const u = this.user();
    if (!u) return [];
    return this.fieldsFor(u.role, u);
  });

  /** Normalize a field's value to a list so the template renders single- and
   *  multi-value fields (a guardian's several emails / phones) the same way. */
  fieldValues(field: InfoField): string[] {
    return Array.isArray(field.value) ? field.value : [field.value];
  }

  private fieldsFor(slug: string, u: UserRow): InfoField[] {
    switch (slug) {
      case 'student':
        return [
          { label: 'Email',           value: u.email },
          { label: 'Mobile',          value: '(555) 271-0098' },
          { label: 'Grade',           value: '10th Grade' },
          { label: 'Homeroom',        value: 'Room 214' },
          { label: 'Building',        value: 'Main Building' },
          { label: 'Student ID',      value: 'S-100482' },
          { label: 'Graduation Year', value: '2028' },
          { label: 'Bus Route',       value: 'Route 12' },
        ];
      case 'teacher':
        return [
          { label: 'Email',        value: u.email },
          { label: 'Phone',        value: '(555) 555-0142' },
          { label: 'Mobile',       value: '(555) 318-7742' },
          { label: 'Department',   value: 'Mathematics' },
          { label: 'Room',         value: 'Room 118' },
          { label: 'Building',     value: 'Main Building' },
          { label: 'Staff ID',     value: 'E-20485' },
          { label: 'Subject Area', value: 'Algebra II' },
        ];
      case 'staff':
        return [
          { label: 'Email',      value: u.email },
          { label: 'Phone',      value: '(555) 555-0204' },
          { label: 'Mobile',     value: '(555) 902-1156' },
          { label: 'Department', value: 'Front Office' },
          { label: 'Building',   value: 'Main Building' },
          { label: 'Staff ID',   value: 'E-31077' },
          { label: 'Title',      value: 'Office Coordinator' },
          { label: 'Start Date', value: u.dateAdded },
        ];
      case 'administrator':
        return [
          { label: 'Email',        value: u.email },
          { label: 'Phone',        value: '(555) 555-0100' },
          { label: 'Mobile',       value: '(555) 740-3321' },
          { label: 'Department',   value: 'District Administration' },
          { label: 'Building',     value: 'District Office' },
          { label: 'Staff ID',     value: 'E-10002' },
          { label: 'Title',        value: 'Principal' },
          { label: 'Access Level', value: 'District Admin' },
        ];
      case 'technician':
        return [
          { label: 'Email',          value: u.email },
          { label: 'Phone',          value: '(555) 555-0550' },
          { label: 'Mobile',         value: '(555) 663-8890' },
          { label: 'Department',     value: 'IT Services' },
          { label: 'Coverage Area',  value: 'North Campus' },
          { label: 'Staff ID',       value: 'E-44820' },
          { label: 'Title',          value: 'Field Technician' },
          { label: 'Certifications', value: 'CompTIA A+' },
        ];
      case 'parent-guardian': {
        // Parents carry minimal direct details — most of the record is their
        // linked students (rendered in the Linked Students section below). Contact
        // info is the exception: some guardians have several emails / phones, so a
        // couple of examples (par2, par3) show the stacked multi-value layout while
        // the rest show a single contact each.
        const surname = u.name.split(' ').filter(Boolean).slice(-1)[0]?.toLowerCase() ?? 'family';
        if (u.id === 'par2' || u.id === 'par3') {
          const emails = [u.email, `${surname}.work@example.com`];
          const phones = u.id === 'par2'
            ? [u.phone ?? '—', '(555) 119-3380']
            : [u.phone ?? '—', '(555) 119-3402', '(555) 442-1187'];
          return [
            { label: 'Email',             value: emails },
            { label: 'Phone',             value: phones },
            { label: 'Preferred Contact', value: 'Email' },
          ];
        }
        return [
          { label: 'Email',             value: u.email },
          { label: 'Phone',             value: u.phone ?? '(555) 228-4471' },
          { label: 'Preferred Contact', value: 'Phone' },
        ];
      }
      default:
        return [
          { label: 'Email',        value: u.email },
          { label: 'Mobile',       value: '(555) 271-0098' },
          { label: 'Primary Site', value: u.location },
          { label: 'Building',     value: 'Main Building' },
          { label: 'Date Added',   value: u.dateAdded },
        ];
    }
  }

  // ── Linked relationships — students show their guardians; parents (and staff who
  // are also parents) show their linked students. These are REAL users from the pool
  // (deterministically seeded by this user's id), so each card opens a populated
  // profile and the fields come straight from that linked user's record.
  // TODO eng: load this user's actual guardian / student links.
  readonly linkedSection = computed<LinkedSection | null>(() => {
    const u = this.user();
    if (!u) return null;

    if (u.role === 'student') {
      return {
        title: 'Parent / Guardian',
        badgeColor: 'purple',
        people: linkedUsers(u.id, 'parent-guardian', 2, u.id).map((p, i) => ({
          id: p.id,
          role: p.role,
          name: p.name,
          initials: this.initialsOf(p.name),
          badge: `Parent ${i + 1}`,
          fields: [
            { label: 'Mobile', value: p.phone ?? '—' },
            { label: 'Email',  value: p.email },
          ],
        })),
      };
    }

    // Parents — and staff members who are also parents — show their linked students.
    if (u.role === 'parent-guardian' || u.role === 'staff') {
      return {
        title: 'Linked Students',
        badgeColor: 'brand',
        people: linkedUsers(u.id, 'student', 2, u.id).map(s => ({
          id: s.id,
          role: s.role,
          name: s.name,
          initials: this.initialsOf(s.name),
          badge: 'Student',
          fields: [
            { label: 'Grade',      value: s.gradeLabel ?? '—' },
            { label: 'School',     value: s.location },
            { label: 'Student ID', value: s.studentId ?? '—' },
            { label: 'Homeroom',   value: s.homeroom ?? '—' },
          ],
        })),
      };
    }

    return null;
  });

  /** Two-letter monogram from a full name ('Ella Carter' → 'EC'). */
  private initialsOf(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  }

  // ── Filler section data — layout placeholders until real sources are wired.
  // TODO eng: replace with real asset assignments for this user.
  readonly assets: AssetRow[] = [
    { icon: 'laptop_chromebook', name: 'Chromebook 11 G9',      tag: 'CHB-2041', status: 'Assigned', color: 'green' },
    { icon: 'tablet_mac',        name: 'iPad (9th gen)',        tag: 'IPD-0088', status: 'Assigned', color: 'green' },
    { icon: 'headphones',        name: 'Logitech H390 Headset', tag: 'ACC-1190', status: 'On loan',  color: 'yellow' },
  ];

  // TODO eng: replace with real ticket aggregates for this user.
  readonly ticketStats: TicketStat[] = [
    { icon: 'inbox',        label: 'Unopened',        value: '2',  tone: 'blue' },
    { icon: 'autorenew',    label: 'In Progress',     value: '1',  tone: 'orange' },
    { icon: 'pending',      label: 'Pending Details', value: '1',  tone: 'purple' },
    { icon: 'check_circle', label: 'Closed',          value: '14', tone: 'grey' },
  ];

  // TODO eng: replace with this user's real recent tickets.
  readonly recentTickets: RecentTicket[] = [
    { subject: 'Chromebook won’t charge',  status: 'In Progress',     color: 'orange', date: 'Jun 7, 2026' },
    { subject: 'Password reset request',   status: 'Pending Details', color: 'purple', date: 'Jun 4, 2026' },
    { subject: 'Projector not displaying', status: 'Closed',          color: 'grey',   date: 'May 28, 2026' },
  ];

  // ── Navigation intent — design-mode stand-in. The Inbox and ticket detail
  // views don't exist in this prototype, so "View all" and the recent-activity
  // rows don't navigate; they open a small dialog describing what they WOULD
  // open, so eng / stakeholders can see the intent without leaving the page.
  // TODO eng: replace these popups with real navigation — "View all" → Inbox
  // filtered to this user; a row → that ticket's detail view.
  readonly intentDialog = signal<{ title: string; body: string } | null>(null);

  showAllTicketsIntent(): void {
    const name = this.user()?.name ?? 'this user';
    this.intentDialog.set({
      title: 'View all tickets',
      body: `Opens the Inbox filtered to every ticket for ${name}.`,
    });
  }

  showTicketIntent(ticket: RecentTicket): void {
    this.intentDialog.set({
      title: 'Open ticket',
      body: `Opens “${ticket.subject}” in the Inbox ticket view.`,
    });
  }

  showAssetIntent(asset: AssetRow): void {
    this.intentDialog.set({
      title: 'Open asset',
      body: `Opens the asset record for “${asset.name}” (Asset #${asset.tag}).`,
    });
  }

  @HostListener('document:keydown.escape')
  closeIntentDialog(): void {
    this.intentDialog.set(null);
  }

  // ── Notes — agent-authored notes about this user. Filler entries; notes added
  // via the composer prepend to the list (local-only, not persisted in design mode).
  // TODO eng: persist notes (create + load) for this user.
  readonly notes = signal<UserNote[]>([
    { author: 'Devon Clark',  initials: 'DC', timestamp: 'May 30, 2026', body: 'Goes by a preferred first name. Updated the display name to match and kept the legal name in the SIS record.' },
    { author: 'Front Office', initials: 'FO', timestamp: 'May 22, 2026', body: 'Prefers email for non-urgent contact; avoid phone calls during the school day.' },
  ]);

  addNote(body: string): void {
    const text = body.trim();
    if (!text) return;
    this.notes.update(list => [
      { author: 'You', initials: 'Y', timestamp: 'Just now', body: text },
      ...list,
    ]);
  }
}
