# User Explorer — Engineering Tech Doc

> **Status:** living document. This is the holistic "how it fits together" reference for
> the eng team picking up User Explorer. It explains what the feature is, the domain model
> (especially the **customer type vs. role** distinction that drives the whole design), how
> the screens connect, and where this view links back into the rest of the product.
>
> It is **not** an API spec. Anything described as filler/mocked is flagged, and every place
> that needs real wiring is marked `TODO eng:` in the source.

---

## 1. What this is, and why it exists

**User Explorer is the first place in the product where you can see *every* user in a district
and find a specific person quickly.** Before this, there was no unified directory — users were
only ever reachable indirectly (through a ticket, an asset assignment, a report, etc.). The
Explorer fills that gap with three things:

1. A **landing page** that groups the directory by the dimensions people actually search on —
   **Role**, **Grade**, and **Location (building)**.
2. **Drill-down tables** under each group (sortable / filterable / column-configurable).
3. A **user detail page** that pulls a person's profile, linked people, tickets, assets, and notes
   into one view.

The feature matters most for **clients migrating off the legacy system**: roles are new, but
their old users (categorized only by *customer type*) must remain findable. See §3.

---

## 2. The screens (navigation hierarchy)

Three levels, all under `/users`. Routes live in [`src/app/app.routes.ts`](../src/app/app.routes.ts).

```
Level 1  /users                              Explorer landing — Role / Grade / Location group cards
Level 2  /users/role/<slug>                  Role drill-down table (one component per role)
         /users/role/all-roles               "All Roles" — the whole directory in one table  ◀ key view
         /users/grade/<slug>                  Grade drill-down (one shared component, scoped by :slug)
         /users/location/<slug>               Location drill-down (one shared component, scoped by :slug)
Level 3  /users/<category>/<groupSlug>/<userId>   User detail page (shared across every category)
```

- **Role tables are individual components** because their columns differ by role (a Student table
  shows Grade/Homeroom; an Agent table shows Department/Title). They live in
  `src/app/pages/users/role-tables/<role>-table/`.
- **Grade and Location tables are one shared component each**, scoped by the `:slug` route param.
- **All Roles** (`all-roles-table/`) is the everyone-view: the full pool in one table, with **Role**
  and **Customer Type** as filterable columns. This is the entry point for "find anyone" and the
  only table that surfaces role-less legacy users (§3).
- The **user detail page** (`user-detail/`) is shared. The breadcrumb reflects the group you came
  from; the profile itself is driven by the user's own role (or lack of one).

---

## 3. The core domain model — roles vs. customer types

This is the single most important concept in the feature. **Roles and customer types are two
different grouping systems from two different eras of the product, and they are not 1:1.**

### Customer type — the *legacy, universal* grouping

- How clients categorized people **for reporting**, *before roles existed*.
- **Essentially every user has one.** It is the old primary grouping dimension.
- Ships with **default types**: `Student`, `Employee`, `Parent / Guardian`, `Community Member`,
  `Other`.
- **The set is dynamic** — clients can define their own **custom** types on top of the defaults
  (the prototype seeds `Substitute`, `Vendor`, `Board Member` as examples of client-defined types).
- A customer type is **not** a role and does not imply portal access.

### Role — the *new, portal-only* grouping

- Roles are only meaningful inside the **authenticated portal**.
- Current roles: **Agent** (the merged former *Administrator* + *Technician*), **Teacher**,
  **Staff**, **Student**, **Parent / Guardian**, **Guest**. (See [`roles.ts`](../src/app/pages/users/roles.ts).)
- **Not every user has a role.** Clients who have **not adopted the authenticated portal** keep
  their users with a customer type but **no role**.

### Why this drives the design

Because the migration is **not 1:1** and not every client moves to the portal:

> **There will be users with a customer type and no role.** If the directory only knew about roles,
> those users would become invisible and clients would lose access to them.

That is exactly why **All Roles** exists and why it carries a **Customer Type** column: it keeps
every user — roled or not — findable. In the data, role-less users have `role: ''` and render a
grey **"No role"** badge; their Customer Type is the only grouping they carry.

| | Customer type | Role |
|---|---|---|
| Era | Legacy (pre-roles) | New |
| Coverage | ~All users | Portal-adopting clients only |
| Primary purpose | Reporting / categorization | Portal access & behavior |
| Value set | 5 defaults + client custom (dynamic) | Fixed list ([`roles.ts`](../src/app/pages/users/roles.ts)) |
| Can be empty? | Rarely | **Yes** — `role: ''` |

> **Mental model:** *customer type ≈ "what kind of person this is, for reporting."
> role ≈ "what this person can do in the portal."* A user can have either, both, or (for customer
> type) almost always at least that one.

---

## 4. How User Explorer links to the rest of the product

User Explorer is a hub — most columns and detail-page sections are windows into other systems.

| Area (nav) | Link from User Explorer | Where in the prototype |
|---|---|---|
| **Authenticated portal** | **Role** is the portal's access grouping. Users without a portal account have no role. | Role column / badge; `role: ''` legacy users |
| **Reporting** | **Customer type** is the historical reporting grouping; reports were built on it long before roles. Keeping it intact preserves report continuity for migrating clients. | Customer Type column (All Roles) + detail field |
| **Tickets / Inbox** | **Tickets Submitted** (count) and the detail page's ticket stats + recent tickets. "View all" → Inbox filtered to that user; a ticket row → that ticket's detail view. | All Roles "Tickets Submitted" column; detail "Tickets" section (intent dialogs stand in for navigation) |
| **Assets** | **Assets** (count assigned to / managed by the user); detail page asset rows → asset records. | All Roles "Assets" column; detail "Assets" section |
| **Integrations / field mapping** | The detail page's **Basic Information** field set is **district-configured** — each district maps standard + custom fields from its integration, so the field list varies by role. | `user-detail.component.ts` → `fieldsFor()` (filler today) |
| **Settings** | Where custom **customer types** and **role** configuration would be managed by an admin. | Not built in this prototype |
| **Home / Analytics** | Sibling top-level areas; not yet linked from the Explorer. | — |

> The cross-links above are **navigation intent** in the prototype. Tickets/asset/Inbox views
> aren't built here, so "View all", ticket rows, and asset rows open a small dialog describing what
> they *would* open (`user-detail.component.ts` → `showAllTicketsIntent` / `showTicketIntent` /
> `showAssetIntent`). Replace these with real routes at handoff.

---

## 5. Data model

One enriched pool feeds every table and the detail page:
[`src/app/pages/users/users.data.ts`](../src/app/pages/users/users.data.ts) (`USERS: UserRow[]`).
Each table picks the columns it cares about and selects rows via the helpers
(`usersByRole`, `usersByGrade`, `usersByLocation`, `linkedUsers`, `findUserById`).

| Field | Type | Meaning / notes |
|---|---|---|
| `id` | string | Stable row id; used for routing and click-to-open. |
| `name`, `email` | string | Identity; the row-click handler matches on these. |
| `role` | string | Role slug (matches `roles.ts`). **`''` = no role** (client hasn't adopted the portal). |
| `customerType` | string? | Legacy reporting grouping (see §3). Default set + client custom. |
| `location` / `locationSlug` | string | Building display name / slug (matches `LOCATIONS` in `explorer-groups.ts`). |
| `phone` | string? | Contact phone. |
| `assignedAssets` | number? | Assets assigned to / managed by the user (techs manage many; parents 0). |
| `openTickets` | number? | Tickets currently **in the user's queue** (agents/staff). *Distinct from `totalTickets`.* |
| `totalTickets` | number? | Total tickets the user has **submitted** (the "Tickets Submitted" column). |
| `status`, `lastActive` | — | Present in the model, **intentionally not shown in All Roles** (can't track reliably for the whole pool). Other role tables still use them. |
| `dateAdded` | string | Account created date. |
| `grade*`, `homeroom`, `studentId`, `guardian` | — | Student-only. |
| `department`, `title` | string? | Agents / staff / teachers. |
| `linkedStudents` | number? | Parent/guardian. |

`grade` / `location` membership uses a **deterministic seeded slice** (`seededSlice`) so every tile
opens a populated, distinct-looking table in the prototype. **`TODO eng:`** replace with real
membership queries.

### All Roles table columns (current)

`Name · Email · Phone · Role · Customer Type · Building · Tickets Submitted · Assets`
(Status and Last Active were intentionally removed.) Column config lives in
`all-roles-table.component.ts`; it must stay in sync with the `<thead>`/`<tbody>` in the template.

---

## 6. Architecture & build

### Design mode (read this before changing UI)

This repo is an **Onflo Design System prototype in _design mode_** — it builds realistic UI for
handoff, using the **CSS class API only**. See [`CLAUDE.md`](../CLAUDE.md) and the design-system
agent guide. Practically:

- **Allowed:** DS class API (`class="ds-button"`, `ds-table`, `ds-label`, …), base Angular
  (`@for`, `@if`, signals), static markup, inline SVG for charts.
- **Not installed / not used:** `@angular/material`, AG Grid, Highcharts. Do **not** add them — the
  mode is owned by the design-system owner, not changed per-feature.
- Anything that would need real eng (AG Grid, live charts, reactive forms, persistence) is a
  **visual stand-in** flagged with `<!-- TODO eng: ... -->`.

### Tables

Tables are **static `<table class="ds-table">` markup driven by `runtime/table-init.js`** (wired in
`angular.json` `scripts`). `table-init.js` reads rows from the rendered DOM and simulates AG Grid
behavior (sort, filter panel, column show/hide/reorder/pin, pivot, row groups, pagination, context
menus) in design mode. At eng handoff each table becomes a real **AG Grid + `onfloTheme`** grid —
that's the `TODO eng:` after each `</tbody>`.

- The column config object (`columns`, `features`, `extraFilterGroups`) lives in each table
  component's `ngAfterViewInit` → `initTable({...})`.
- After init, the component calls `this.cdr.detach()` to hand DOM control to `table-init.js`.
- Because `table-init.js` re-renders rows via `innerHTML` (stripping Angular's encapsulation
  attribute), row styling is pierced with `:host ::ng-deep` and row clicks are delegated from the
  host element (see `onTableClick` in the table components).

### Project layout

```
src/app/
  app.routes.ts                      route table (§2)
  pages/
    users/
      roles.ts                       USER_ROLES — role slugs, labels, colors, counts
      explorer-groups.ts             GRADES, LOCATIONS, findUserGroup()
      users.data.ts                  USERS pool + UserRow + row selectors  ◀ single source of truth
      users.component.*              Level-1 Explorer landing
      role-tables/<role>-table/      Level-2 per-role tables (+ all-roles-table)
      grade-table/, location-table/  Level-2 shared tables (scoped by :slug)
      user-detail/                   Level-3 user profile
    tickets/ assets/ analytics/ settings/ home/   sibling top-level areas
```

### Deployment

Live prototype: **https://rbenedict-debug.github.io/User-Explorer/** — single `main` branch,
auto-deploys via GitHub Actions on push. `npm run build` produces `dist/`.

---

## 7. What's real vs. mocked (handoff checklist)

Everything below is a `TODO eng:` in the source. Search the repo for `TODO eng` for the live list.

- **Tables → AG Grid.** Replace each static `ds-table` + `table-init.js` with AG Grid + `onfloTheme`.
- **Membership queries.** `usersByGrade` / `usersByLocation` use a seeded slice — wire real queries.
- **Ticket aggregates.** `totalTickets`, `openTickets`, the detail page's ticket stats and recent
  tickets are filler — source from the ticketing system.
- **Asset assignments.** `assignedAssets` and the detail page asset rows are filler — source from Assets.
- **Field mapping.** `user-detail.component.ts` → `fieldsFor()` returns hard-coded fields; render the
  district's actual mapped standard + custom field set per role.
- **Customer types.** Seeded from defaults + sample custom types; source the real set (including each
  client's custom types) from the legacy import.
- **Linked people.** Guardian/student links are deterministically seeded; load real link records.
- **Navigation intent.** "View all", ticket rows, asset rows open describe-only dialogs — replace with
  real routes into Inbox / asset records.
- **Notes.** Local-only in design mode; persist create + load.
- **Filtering.** In design mode the filter panel is a UI simulation (row hiding is the eng concern).

---

## 8. Glossary

- **Role** — new, portal-only access grouping. Optional (`role: ''` = none).
- **Customer type** — legacy, near-universal reporting grouping. Default set + client custom.
- **Agent** — merged former *Administrator* + *Technician* role.
- **All Roles** — the everyone-view table; the only one that surfaces role-less users.
- **Design mode** — DS class-API-only prototype build; no Material/AG Grid/Highcharts.
- **`table-init.js`** — design-system runtime that turns static `ds-table` markup into an
  interactive, AG-Grid-like table for the prototype.
