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
// A hero subtitle segment. A segment carrying a `label` + `tooltip` renders as a
// "Label: value" pair with a hover / focus tooltip — used for the legacy customer
// type so an agent can tell it's a retained-for-old-clients field, not a role.
interface HeroSegment { text: string; label?: string; tooltip?: string; }
interface AssetRow { icon: string; name: string; tag: string; status: string; color: string; }
interface TicketStat { icon: string; label: string; value: string; tone: 'blue' | 'orange' | 'purple' | 'grey'; }
interface RecentTicket { subject: string; status: string; color: string; date: string; }
interface UserNote { author: string; initials: string; timestamp: string; body: string; }
interface LinkedField { label: string; value: string; }
interface LinkedPerson { id: string; role: string; name: string; initials: string; badge: string; fields: LinkedField[]; }
interface LinkedSection { title: string; badgeColor: string; people: LinkedPerson[]; }
// A fee (client-defined charge) or part (consumable used on an asset). Both render as a
// row in their section's table. Status shows as a grey ds-label pill — prod displays all
// fee/part statuses in grey (not color-coded), so the pill colour isn't data-driven.
interface FeeRow { name: string; amount: number; status: 'Paid' | 'Unpaid' | 'Waived'; ticket: string; }
interface PartRow { name: string; amount: number; status: 'Installed' | 'Queued' | 'Ordered'; ticket: string; }
// Roll-up shown in each section's summary callout: a status breakdown line plus the
// right-aligned totals (the emphasised one is the figure that matters most).
interface SummaryTotal { label: string; value: string; emphasis?: boolean; }
interface SectionSummary { sub: string; totals: SummaryTotal[]; }

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

  // Hero subtitle segments: Role · Customer Type · Building. Customer Type is a
  // legacy grouping most users carry (agents have none); it's shown as its own "Customer Type:
  // value" segment (omitted when absent) with a hover / focus tooltip, so an agent
  // can tell it's the retained-for-old-clients field rather than another role —
  // even when it repeats the role label (a Student whose legacy customer type is
  // also "Student"). Legacy users whose client never adopted the authenticated
  // portal have no role, so their role segment reads "No role" with the customer
  // type (their only grouping dimension) beside it.
  readonly heroSegments = computed<HeroSegment[]>(() => {
    const u = this.user();
    if (!u) return [];
    const segments: HeroSegment[] = [{ text: u.role ? roleLabel(u.role) : 'No role' }];
    if (u.customerType) {
      segments.push({
        label: 'Customer Type',
        text: u.customerType,
        tooltip: 'Legacy customer type — kept for older clients, not used going forward.',
      });
    }
    if (u.location) segments.push({ text: u.location });
    return segments;
  });

  // Avatar monogram from the user's name.
  readonly initials = computed(() => this.initialsOf(this.user()?.name ?? ''));

  // ── Basic Information — the fields shown here are dynamic: a district maps them
  // from its integration + field-mapping config, so the set (and any custom fields)
  // varies by role. All values are filler for the prototype.
  // TODO eng: render the district's actual mapped field set (standard + custom).
  readonly basicInfo = computed<InfoField[]>(() => {
    const u = this.user();
    if (!u) return [];
    const fields = this.fieldsFor(u.role, u);
    // Customer Type is a legacy grouping — surfaced right after Email for the users
    // that carry one (and the only grouping for role-less users). Agents (internal
    // support staff) have none, so the field is omitted for them.
    if (u.customerType) {
      fields.splice(1, 0, { label: 'Customer Type', value: u.customerType });
    }
    return fields;
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
      case 'agent':
        // Agent merges the former Administrator + Technician roles, so the field
        // set spans both — org placement plus access. Department / Title come
        // from the user's own record (Superintendent … Field Technician).
        return [
          { label: 'Email',        value: u.email },
          { label: 'Phone',        value: '(555) 555-0100' },
          { label: 'Mobile',       value: '(555) 740-3321' },
          { label: 'Department',   value: u.department ?? 'District Administration' },
          { label: 'Building',     value: u.location },
          { label: 'Staff ID',     value: 'E-10002' },
          { label: 'Title',        value: u.title ?? 'Agent' },
          { label: 'Access Level', value: 'Agent — Full' },
        ];
      case 'guest':
        return [
          { label: 'Email',          value: u.email },
          { label: 'Phone',          value: '(555) 555-0760' },
          { label: 'Sponsored By',   value: 'Front Office' },
          { label: 'Building',       value: u.location },
          { label: 'Access Level',   value: 'Guest — Limited' },
          { label: 'Access Expires', value: 'Aug 31, 2026' },
          { label: 'Date Added',     value: u.dateAdded },
        ];
      case 'parent': {
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
        title: 'Parent',
        badgeColor: 'purple',
        people: linkedUsers(u.id, 'parent', 2, u.id).map((p, i) => ({
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
    if (u.role === 'parent' || u.role === 'staff') {
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

  /** Format a whole-dollar amount for display: 251 → "$251". */
  money(amount: number): string {
    return `$${amount.toLocaleString('en-US')}`;
  }

  // ── Fees — client-defined charges (device damage, lost / replaced items, etc.). The
  // district sets up what each fee is and may waive it; the summary rolls the amounts up
  // into added / paid / waived / outstanding. Students only. Filler.
  // TODO eng: load this student's real fees + waivers.
  readonly fees = signal<FeeRow[]>([
    { name: 'Screen Repair',        amount: 176, status: 'Unpaid', ticket: '05512' },
    { name: 'Keyboard Replacement', amount: 50,  status: 'Paid',   ticket: '05488' },
    { name: 'Carrying Case',        amount: 25,  status: 'Waived', ticket: '05401' },
  ]);

  readonly feeSummary = computed<SectionSummary>(() => {
    const fees = this.fees();
    const totalFor = (status: FeeRow['status']) =>
      fees.filter(f => f.status === status).reduce((sum, f) => sum + f.amount, 0);
    const countFor = (status: FeeRow['status']) => fees.filter(f => f.status === status).length;
    const added = fees.reduce((sum, f) => sum + f.amount, 0);
    const paid = totalFor('Paid');
    const waived = totalFor('Waived');
    return {
      sub: `${countFor('Paid')} paid · ${countFor('Unpaid')} unpaid · ${countFor('Waived')} waived`,
      totals: [
        { label: 'Total Added',         value: this.money(added) },
        { label: 'Total Paid',          value: this.money(paid) },
        { label: 'Total Waived',        value: this.money(waived) },
        { label: 'Outstanding Balance', value: this.money(added - paid - waived), emphasis: true },
      ],
    };
  });

  // ── Parts — consumable components used on this student's assets during a repair (each
  // comes from a ticket). Tracked from order → queued → installed. Students only. Filler.
  // TODO eng: load real parts consumed for this student's assets.
  readonly parts = signal<PartRow[]>([
    { name: 'Replacement Keyboard', amount: 45, status: 'Installed', ticket: '05512' },
    { name: 'USB-C Charging Cable', amount: 12, status: 'Queued',    ticket: '05488' },
    { name: 'Battery Replacement',  amount: 38, status: 'Ordered',   ticket: '05377' },
  ]);

  readonly partSummary = computed<SectionSummary>(() => {
    const parts = this.parts();
    const countFor = (status: PartRow['status']) => parts.filter(p => p.status === status).length;
    const total = parts.reduce((sum, p) => sum + p.amount, 0);
    return {
      sub: `${countFor('Installed')} installed · ${countFor('Queued')} queued · ${countFor('Ordered')} ordered`,
      totals: [
        { label: 'Parts Added', value: `${parts.length}` },
        { label: 'Total Value', value: this.money(total), emphasis: true },
      ],
    };
  });

  // ── Navigation intent — design-mode stand-in. The Inbox and ticket detail
  // views don't exist in this prototype, so "View all" and the recent-activity
  // rows don't navigate; they open a small dialog describing what they WOULD
  // open, so eng / stakeholders can see the intent without leaving the page.
  // TODO eng: replace these popups with real navigation — "View all" → Inbox
  // filtered to this user; a row → that ticket's detail view.
  readonly intentDialog = signal<{ title: string; body: string } | null>(null);

  createTicketIntent(): void {
    const name = this.user()?.name ?? 'this user';
    this.intentDialog.set({
      title: 'Create ticket',
      body: `Opens a new ticket with ${name} pre-filled as the requester.`,
    });
  }

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

  assignAssetsIntent(): void {
    const name = this.user()?.name ?? 'this user';
    this.intentDialog.set({
      title: 'Manage assets',
      body: `Opens the asset assignment dialog to assign a new asset to ${name} or change a current assignment.`,
    });
  }

  showTicketRefIntent(ticket: string): void {
    this.intentDialog.set({
      title: 'Open ticket',
      body: `Opens ticket #${ticket} in the Inbox ticket view.`,
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
