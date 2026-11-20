# MyRoutine Atelier

**A personal routine and timetable workspace.** Plan your schedule, organise recurring routines, review your week and keep a local copy of your data.

## Product direction

MyRoutine is designed as a calm, premium productivity workspace:
- Responsive dashboard for phone, tablet and desktop
- Routine cards and dedicated routine workspace
- Timetable editor, calendar and schedule viewer
- Search, templates, analytics and print tools
- Notifications and local backup / restore
- Dark Atelier visual system with keyboard-accessible controls
- Installable web-app shell with an offline fallback
- Built-in focus timer with 25 / 50 / 90-minute presets and local daily session totals
- Smart Routine Engine for weekly recurring-pattern review, overlapping time detection, missing assignments and flexible gap suggestions
- Intelligent Daily Planner with date selection, weekly-load balancing suggestions, editable subject choices and explicit approval before saving
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

## Data and privacy

Routine data is managed by the existing client-side data/storage modules. Keep regular exports using the backup feature, especially before clearing browser data, changing devices or testing a new browser profile. Do not assume browser-local data automatically synchronises between devices.

## Deployment

Any static host that serves the repository root can host MyRoutine (for example GitHub Pages, Netlify or Cloudflare Pages). Configure the published directory as the repository root. Ensure these files are served from the site root so the service worker can control the app:
- `/sw.js`
- `/manifest.webmanifest`
- `/offline.html`
- `/icons/*`

If deploying under a subpath (for example a project site at `/MyRoutine/`), update the manifest `start_url` / `scope`, service-worker registration scope and asset paths before deployment.

## Project structure

- `index.html` — application shell and home/workspace UI
- `myroutine.js`, `routine-*.js` — existing routine engine and feature modules
- `atelier-modules.js` — coordinated styling for independently mounted modules
- `manifest.webmanifest`, `icons/` — install metadata and app icons
- `sw.js`, `offline.html` — offline shell and fallback page
- `pwa.js` — installation, connectivity, command palette and focus timer
- `routine-smart.js` — read-only routine analysis and schedule recommendations
- `routine-daily-planner.js` — daily plan suggestions and user-approved schedule updates

## Change safety

The Atelier redesign is maintained on `redesign/atelier-productivity` until it has been reviewed and tested. Routine data structures and the existing feature-module API are intentionally retained.
