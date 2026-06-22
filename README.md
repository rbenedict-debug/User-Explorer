# User Explorer

A working UI prototype of the **User Explorer** — a directory for browsing a district's
users (students, parents/guardians, teachers, staff, administrators, technicians) and
drilling into an individual user's profile.

🔗 **Live demo:** https://rbenedict-debug.github.io/User-Explorer/

Built with the [Onflo Design System](https://github.com/rbenedict-debug/Design-System)
in **design mode** (the CSS class API only) — a realistic, clickable mockup for
stakeholder review ahead of engineering handoff. All data is representative filler, and
spots that need real wiring are flagged inline with `<!-- TODO eng: ... -->`.

## What's in it

- **User Explorer landing** — browse users by role, grade, or location.
- **Drill-down tables** — a per-role / grade / location list for each group.
- **User profile** — hero + basic info, linked relationships (guardians ↔ students),
  a tickets summary, assigned assets, and notes.
  - Linked guardian/student cards **navigate to that person's real profile**.
  - "View all", recent-activity, and asset cards open a design-mode **intent popup**
    describing where they'd go, since those destinations aren't built in the prototype.

## Run locally

Requires **Node 22+**.

```bash
npm install   # installs Angular + the Onflo Design System (a public git dependency)
npm start     # ng serve → http://localhost:4200
```

> Peer-dependency warnings during install are expected in design mode and safe to ignore.

## Deployment

Pushing to `main` triggers [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml),
which builds the app and publishes it to GitHub Pages. The live demo updates
automatically — there is no manual deploy step and no separate `gh-pages` branch.

## Tech

Angular 21 (standalone components) · Onflo Design System (design mode) · GitHub Actions → Pages.
