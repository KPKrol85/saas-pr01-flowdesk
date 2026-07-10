# FlowDesk Priority 3 Visual Evidence And Manual UI QA

## Status

Date: 2026-07-10

Tested source:

- repository: `saas-pr01-flowdesk` repository root
- branch: `main`
- base commit before this QA pass: `da7acf0`
- source of truth: current local FlowDesk application, not the separately maintained Netlify copy

Priority 3 remains active. This pass completed local visual evidence, Chromium visual smoke coverage, and one targeted visual fix. Physical-device checks, a genuine screen-reader pass, unavailable browser-engine checks, and final owner-led portfolio review remain pending.

## Local Run Method

- Playwright web server from the repository config: `npx serve . --listen 4173`
- local URL: `http://127.0.0.1:4173`
- browser state: clean context with `localStorage` and `sessionStorage` cleared before each capture
- demo data: seeded fictional FlowDesk records only
- capture method: temporary Playwright capture spec, removed after evidence generation

## Screenshot Evidence

Screenshots are stored in `docs/qa/priority-3-screenshots/`.

| Surface                  | Route or state             | Viewport  | Screenshot                                 |
| ------------------------ | -------------------------- | --------- | ------------------------------------------ |
| desktop dashboard        | `#/dashboard`              | 1440x1100 | `flowdesk-desktop-dashboard-1440x1100.png` |
| desktop clients          | `#/clients`                | 1440x1100 | `flowdesk-desktop-clients-1440x1100.png`   |
| desktop projects         | `#/projects`               | 1440x1100 | `flowdesk-desktop-projects-1440x1100.png`  |
| desktop calendar         | `#/calendar`               | 1440x1100 | `flowdesk-desktop-calendar-1440x1100.png`  |
| desktop settings         | `#/settings`               | 1440x1100 | `flowdesk-desktop-settings-1440x1100.png`  |
| mobile shell with drawer | dashboard with drawer open | 390x844   | `flowdesk-mobile-shell-drawer-390x844.png` |

Client detail and project detail screenshots were not added in this pass because the primary portfolio surfaces already cover the current dashboard, data table, kanban, calendar, settings, and mobile shell evidence without duplicating lower-value captures.

## Visual Inspection Results

Completed checks:

- screenshots were captured from the real local application
- screenshots use seeded demo data only
- no real customer data, tokens, secrets, local paths, debug overlays, or production-only claims are visible
- desktop dashboard, clients, projects, calendar, settings, and mobile shell screenshots were manually inspected
- no unintended horizontal overflow was detected during capture
- no broken navigation, modal, drawer, or shell state was visible
- no overlapping content, unreadable text, loading state, error state, or debug state was visible in the final captures
- dashboard and settings continue below the viewport naturally; this is viewport continuation, not component clipping

Confirmed issue fixed:

- desktop clients table action buttons allowed `Archiwizuj` to wrap inside the word in a narrow action column
- `css/views.css` now keeps `.data-actions .btn` from shrinking or wrapping labels in desktop action groups

## Browser Coverage

Completed:

- Chromium visual smoke: `npx playwright test tests/e2e/visual-smoke.spec.js --project=chromium --reporter=line`
- result: 8 passed

Attempted but unavailable:

- Firefox visual smoke through a temporary cross-browser config
- WebKit visual smoke through a temporary cross-browser config

Limitation:

- the repository Playwright config defines only the `chromium` project
- Firefox/WebKit spot checks were attempted without changing permanent config or installing new runtimes
- Playwright could not launch the expected Firefox runtime executable under
  `firefox-1532/firefox/firefox.exe`
- Playwright could not launch the expected WebKit runtime executable under
  `webkit-2311/Playwright.exe`
- no new browser runtimes were installed for this task

## Owner Manual QA Checklist

These checks still require owner participation or a physical/manual environment. They are not completed by this automated pass.

- physical mobile-device touch pass on a real phone
- touch target review for topbar controls, mobile drawer, forms, dialogs, and destructive confirmations
- mobile scrolling review across dashboard, clients, projects, calendar, and settings
- manual screen-reader pass for login, navigation, modal/dialog flows, form errors, toast announcements, and settings controls
- keyboard and focus-flow review while using the screen reader
- Firefox visual spot check after a matching Playwright Firefox runtime is available
- WebKit visual spot check after a matching Playwright WebKit runtime is available
- final owner-led review before publishing screenshots in KP_Code Digital Studio

## Verification Commands

Commands run during this pass before final cleanup:

- `npx playwright test tests/e2e/tmp-priority3-visual-evidence.spec.js --reporter=line` - 6 passed
- `npx playwright test tests/e2e/visual-smoke.spec.js --project=chromium --reporter=line` - 8 passed
- `npx playwright test tests/e2e/visual-smoke.spec.js --config=tmp-playwright-cross-browser.config.js --reporter=line` - attempted; Firefox and WebKit unavailable because expected executables were missing

Final verification for the completed diff:

- `npm run build` - passed; regenerated `css/style.min.css` and `service-worker-assets.js`
- first `npm run check` - stopped on Markdown formatting for this evidence note
- `npx prettier docs/qa/priority-3-visual-evidence.md TO-DO.md --write` - applied documentation formatting
- final `npm run check` - passed
- `npm run lighthouse` - passed
- `git diff --check` - passed
