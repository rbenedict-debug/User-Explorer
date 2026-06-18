import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { findUserGroup } from '../explorer-groups';
import { UserRow, findUserById, roleLabel } from '../users.data';

// Each section renders from a small typed model so real data can be swapped in
// later without touching the template. Filler values are flagged inline.
interface InfoField { label: string; value: string; }
interface AssetRow { icon: string; name: string; tag: string; status: string; color: string; }
interface TicketStat { icon: string; label: string; value: string; tone: 'blue' | 'orange' | 'grey'; }
interface RecentTicket { subject: string; status: string; color: string; date: string; }
interface UserNote { author: string; initials: string; timestamp: string; body: string; }
interface LinkedField { label: string; value: string; }
interface LinkedPerson { name: string; initials: string; badge: string; fields: LinkedField[]; }
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
  readonly initials = computed(() => {
    const name = this.user()?.name ?? '';
    return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  });

  // ── Basic Information — the fields shown here are dynamic: a district maps them
  // from its integration + field-mapping config, so the set (and any custom fields)
  // varies by role. All values are filler for the prototype.
  // TODO eng: render the district's actual mapped field set (standard + custom).
  readonly basicInfo = computed<InfoField[]>(() => {
    const u = this.user();
    if (!u) return [];
    return this.fieldsFor(u.role, u);
  });

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
      case 'parent-guardian':
        // Parents carry minimal direct details — most of the record is their
        // linked students (rendered in the Linked Students section below).
        return [
          { label: 'Email',      value: u.email },
          { label: 'Mobile',     value: '(555) 228-4471' },
          { label: 'Home Phone', value: '(555) 119-3380' },
        ];
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
  // are also parents) show their linked students. A parent's own record is minimal,
  // so the linked students carry most of the detail. Role-driven filler; linked
  // names reuse this user's surname. In production this is per-user link data, not
  // derived from the primary role.
  // TODO eng: load real guardian / student links for this user.
  readonly linkedSection = computed<LinkedSection | null>(() => {
    const slug = this.user()?.role ?? '';
    const surname = (this.user()?.name ?? '').split(' ').filter(Boolean).slice(-1)[0] ?? '';
    const lc = surname.toLowerCase();

    if (slug === 'student') {
      return {
        title: 'Guardians',
        badgeColor: 'pink',
        people: [
          { name: `Patricia ${surname}`, initials: this.monogram('Patricia', surname), badge: 'Mother', fields: [
            { label: 'Mobile', value: '(555) 274-1180' },
            { label: 'Email',  value: `p.${lc}@example.com` },
          ] },
          { name: `Marcus ${surname}`, initials: this.monogram('Marcus', surname), badge: 'Father', fields: [
            { label: 'Mobile', value: '(555) 274-2245' },
            { label: 'Email',  value: `m.${lc}@example.com` },
          ] },
        ],
      };
    }

    // Parents — and staff members who are also parents — show their linked students.
    if (slug === 'parent-guardian' || slug === 'staff') {
      return {
        title: 'Linked Students',
        badgeColor: 'green',
        people: [
          { name: `Ella ${surname}`, initials: this.monogram('Ella', surname), badge: 'Student', fields: [
            { label: 'Grade',      value: '9th Grade' },
            { label: 'School',     value: 'Lincoln High' },
            { label: 'Student ID', value: 'S-100731' },
            { label: 'Homeroom',   value: 'Room 112' },
          ] },
          { name: `Noah ${surname}`, initials: this.monogram('Noah', surname), badge: 'Student', fields: [
            { label: 'Grade',      value: '6th Grade' },
            { label: 'School',     value: 'Washington Middle' },
            { label: 'Student ID', value: 'S-100920' },
            { label: 'Homeroom',   value: 'Room 204' },
          ] },
        ],
      };
    }

    return null;
  });

  private monogram(first: string, last: string): string {
    return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
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
    { icon: 'inbox',        label: 'New',         value: '2',  tone: 'blue' },
    { icon: 'autorenew',    label: 'In Progress', value: '1',  tone: 'orange' },
    { icon: 'check_circle', label: 'Closed',      value: '14', tone: 'grey' },
  ];

  // TODO eng: replace with this user's real recent tickets.
  readonly recentTickets: RecentTicket[] = [
    { subject: 'Chromebook won’t charge',  status: 'Open',        color: 'yellow', date: 'Jun 7, 2026' },
    { subject: 'Password reset request',   status: 'In Progress', color: 'blue',   date: 'Jun 4, 2026' },
    { subject: 'Projector not displaying', status: 'Resolved',    color: 'green',  date: 'May 28, 2026' },
  ];

  // ── Notes — agent-authored notes about this user. Filler entries; notes added
  // via the composer prepend to the list (local-only, not persisted in design mode).
  // TODO eng: persist notes (create + load) for this user.
  readonly notes = signal<UserNote[]>([
    { author: 'Maria Chen',   initials: 'MC', timestamp: 'Jun 6, 2026',  body: 'Confirmed identity in person at the front office and refreshed the recovery email on file.' },
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
