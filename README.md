# MyRoutine Atelier

**A personal routine and timetable workspace.** Plan your schedule, organise recurring routines, review your week and keep a local copy of your data.

## Product direction

MyRoutine is designed as a calm, premium productivity workspace:
- Responsive dashboard for phone, tablet and desktop
- Routine cards and dedicated routine workspace with grouped Plan / Review / Preferences navigation
- Timetable editor, calendar and schedule viewer
- Search, templates, analytics and print tools
- Notifications and local backup / restore
- Dark Atelier visual system with keyboard-accessible controls
- Installable web-app shell with an offline fallback
- Built-in focus timer with 25 / 50 / 90-minute presets and local daily session totals
- Smart Routine Engine for weekly recurring-pattern review, overlapping time detection, missing assignments and flexible gap suggestions
- Intelligent Daily Planner with date selection, weekly-load balancing suggestions, editable subject choices and explicit approval before saving
- Task Desk for one-time deadlines and daily / weekly recurring tasks, with overdue and due-today views; task data stays in this browser
- Unified Command Center combining today’s timetable, deadline priorities, local task completion and focus-session summaries
- Analytics Studio with 7/30-day focus trends, historical task completion, actual subject-tagged focus time and planned timetable distribution
- Local activity history for completed tasks and completed focus sessions
- Consistency & Streak Engine with active-day streaks, personal records, 7/30-day consistency and an adjustable daily focus reference goal
- Drag-and-drop timetable assignment moves and swaps, with keyboard-accessible previous / next period controls

## Run locally

This is a static HTML, CSS and JavaScript application. Serve the repository root with any static web server. Service workers and installation prompts require **HTTPS** (or localhost).

For example, with Python installed:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

Opening `index.html` directly with a `file://` URL is not a supported way to test service-worker or install features.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl + K` / `⌘ + K` | Open the command palette |
| `?` | Open the command palette when not typing |
| `Esc` | Close the command palette or supported overlays |
| `Ctrl + N` / `⌘ + N` | Create a routine |
| Top-bar timer icon or command palette | Open the focus timer |
| Smart planner button | Review conflicts and recurring weekly coverage |
| Daily plan button | Preview a balanced day and approve suggested subject assignments |
| Drag an assigned timetable slot | Move or swap an assignment to another day / period |
| Up / down controls beside a slot | Move its assignment to the previous / next period without dragging |

The command palette can also be opened from the search icon in the top bar. The focus timer has its own top-bar shortcut and is also available from the command palette.

## Install as an app

Deploy the site over HTTPS, then use the browser's **Install app** or **Add to Home Screen** action. The app manifest and vector app icons are in the repository root.

## Offline behaviour

The service worker caches the app shell and same-origin JavaScript assets. Previously loaded screens can be served when the network is unavailable. External services (including the hosted icon library) may still require a connection. Browser storage is device- and browser-specific; offline caching is **not** a substitute for exporting a backup.

To force a fresh shell after a deployment, publish the updated `sw.js` and reload the app. The worker removes older MyRoutine shell caches when the new worker activates.

## In-app privacy notice

A non-blocking first-visit disclosure explains the browser-local data model and links to the full legal centre. Dismissing it records only a local acknowledgement in the current browser; it is not represented as legal consent. The notice does not request permissions or transmit preference data.

## Settings & privacy dashboard

The in-app Settings & Privacy dashboard provides a MyRoutine-namespaced storage inventory, JSON export and validated restore, explicit app-data deletion, accessibility preferences (text size, reduced motion and higher contrast), and notification controls. Backups include MyRoutine-prefixed localStorage values only. Deletion is limited to those keys and does not clear unrelated website storage or browser caches. Notification permission is requested only after the user presses the permission button. These controls are local to the current browser; they do not create an account or cloud sync.

## Legal and privacy

The `/legal.html` page contains the published privacy policy, terms of use, data and storage disclosures, cookies/local storage explanation, security notes, sharing, retention/deletion, children's privacy, intellectual property, disclaimers, liability and contact guidance. The policy describes the current browser-local storage model and explicitly avoids promising cloud sync or account services that are not implemented. The legal page is a project-level template and should be reviewed by a qualified legal professional before commercial use; configure a verified privacy contact before launch.

## Data and privacy

Routine data is managed by the existing client-side data/storage modules. Keep regular exports using the backup feature, especially before clearing browser data, changing devices or testing a new browser profile. Do not assume browser-local data automatically synchronises between devices.

## Deployment

Any static host that serves the repository root can host MyRoutine (for example GitHub Pages, Netlify or Cloudflare Pages). Configure the published directory as the repository root. Ensure these files are served from the site root so the service worker can control the app:
- `/sw.js`
- `/manifest.webmanifest`
- `/offline.html`
- `/icons/*`

If deploying under a subpath (for example a project site at `/MyRoutine/`), update the manifest `start_url` / `scope`, service-worker registration scope and asset paths before deployment.

## Workspace navigation

The routine workspace exposes a grouped, horizontally scrollable navigation strip. Plan contains timetable, editor, calendar and templates; Review contains search, analytics, sharing and print; Preferences contains reminders, backup and settings. Existing module entry points are reused, so navigation does not fork feature state or change saved data. The strip remains reachable on small screens and supports keyboard focus.

## Project structure

The static application keeps stable root-level asset URLs for existing deployments and service-worker compatibility. The large inline shell assets have been extracted into dedicated files:

- `index.html` — semantic application shell, home/workspace markup and script order
- `app-shell.css` — primary application layout and shell styling (extracted from inline styles)
- `app-shell.js` — shell controller, navigation actions and workspace orchestration (extracted from inline script)
- `myroutine-design-system.css` — shared design tokens, responsive refinements and component styling
- `settings-privacy.js`, `privacy-notice.js` — local privacy controls and first-visit disclosure
- `myroutine.js` — core routine data model, normalisation and public application API
- `routine-storage.js`, `routine-data.js`, `routine-backup.js` — persistence, data access and import/export
- `routine-ui.js`, `routine-dashboard.js`, `routine-view.js`, `routine-editor.js` — shared UI, dashboard and timetable surfaces
- `routine-calendar.js`, `routine-search.js`, `routine-templates.js`, `routine-share.js`, `routine-print.js` — focused routine tools
- `routine-settings.js`, `routine-notifications.js` — user preferences and reminder controls
- `routine-analytics.js`, `routine-analytics-studio.js`, `routine-task-desk.js`, `routine-command-center.js`, `routine-streak-engine.js` — planning, task and insight modules
- `routine-smart.js`, `routine-daily-planner.js` — read-only schedule analysis and user-approved daily planning
- `atelier-modules.js`, `atelier-polish.css` — visual integration for independently mounted modules
- `manifest.webmanifest`, `icons/` — install metadata and app icons
- `sw.js`, `offline.html`, `pwa.js` — offline shell, installation, connectivity and focus tools

### Runtime boundaries

The core engine owns routine data and exposes the `window.MyRoutine` API. Feature modules consume that API and communicate through documented window module objects and `myroutine:*` DOM events. The shell owns top-level navigation and workspace orchestration; feature modules should not duplicate shell state. Storage and backup code remain separate from presentation code. Keep the existing root-level filenames until every deployment path and module reference has been migrated and tested; this extraction intentionally avoids a risky mass rename.

## Change safety

The Atelier redesign is maintained on `redesign/atelier-productivity` until it has been reviewed and tested. Routine data structures and the existing feature-module API are intentionally retained.


### Dashboard command-centre refinement

- The active workspace dashboard remains the single owner of `#workspacePanel`; the redundant secondary dashboard mount was removed to prevent competing renderers.
- Added an Overview action to the workspace navigation so users can return to the routine command centre without leaving the workspace.
- Refined the dashboard hero, metrics, timetable rows, week grid and quick actions with a scoped navy visual treatment and mobile layouts.
- No routine data schema, storage keys, or existing feature workflows were changed.


### Mobile tools and icon access

- Replaced passive feature tiles with direct, keyboard-accessible tool launch cards.
- Added task desk, daily planner, smart review and command centre entry points to the workspace navigation.
- Consolidated the floating module launchers out of the viewport to prevent overlap with page content; the tools remain accessible through the cards and navigation.
- Added text-glyph fallbacks inside icon placeholders so controls remain identifiable when the external icon library is unavailable.
- Mobile feature cards use a compact two-column layout, with a single-column fallback on very narrow screens.


### Offline-safe icon rendering

- Added local CSS glyph fallbacks for common Lucide icon names. Empty icon nodes now remain identifiable when the external Lucide CDN is blocked, slow, or unavailable.
- SVG icons remain preferred when Lucide successfully loads; the fallback only appears for empty icon nodes.
- Bumped the service-worker cache to v18.
