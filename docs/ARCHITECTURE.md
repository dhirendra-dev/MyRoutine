# MyRoutine architecture

## Current structure

MyRoutine is a static, browser-first application. Root-level asset paths are retained for compatibility with the current deployment and service worker.

## Layers

1. **Application shell** — `index.html` owns the semantic page structure; `app-shell.js` owns home/workspace orchestration; `app-shell.css` owns shell presentation.
2. **Core domain** — `myroutine.js` owns the routine data model, normalisation and the public `window.MyRoutine` API.
3. **Persistence** — `routine-storage.js`, `routine-data.js` and `routine-backup.js` own browser persistence, data access and import/export.
4. **Feature modules** — editor, viewer, calendar, templates, search, sharing, printing, analytics, task desk, daily planner and consistency tools remain independently scoped.
5. **Shared UI** — `routine-ui.js` provides reusable interface helpers; `routine-dashboard.js` owns routine dashboard rendering.
6. **Design system** — `app-shell.css`, `myroutine-design-system.css`, `atelier-modules.js` and `atelier-polish.css` provide the shell, tokens/components and module-level styling.
7. **Platform** — `pwa.js`, `sw.js`, `manifest.webmanifest` and `offline.html` own install/offline behavior.

## Integration contracts

- Preserve the public `window.MyRoutine` API and its data schema unless a separately reviewed migration is added.
- Feature modules should expose one named `window.MyRoutine…` module API and avoid owning unrelated features.
- Use `myroutine:ready`, `myroutine:changed`, `myroutine:updated` and `myroutine:saved` for cross-module lifecycle updates.
- Keep browser storage and import/export logic out of rendering modules.
- Do not request browser permissions during startup. Permission prompts must follow a direct user action.
- Keep all static asset URLs aligned between `index.html` and the service-worker app shell.

## Safe refactor sequence

1. Extract inline shell CSS and JavaScript without changing runtime order (completed).
2. Keep legacy filenames as stable public asset paths while documenting module ownership (completed).
3. Add automated syntax, asset-reference and smoke tests before changing script loading strategy.
4. Only then consider moving modules into folders or introducing ES modules/build tooling. Such a migration must preserve local data and be tested against installed PWA caches.
