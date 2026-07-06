# FlowDesk Final UI QA Checklist

## Purpose

This checklist makes the final FlowDesk UI polish pass repeatable after roadmap points 1-9. It verifies responsive behavior, theme behavior, reduced motion, keyboard access, long text handling, accessibility smoke coverage, PWA guardrails, performance guardrails, generated file hygiene, and final diff hygiene.

## Prerequisites

- UI roadmap points 1-9 are marked `Done` in `UI-improvements-plan.md`.
- Runtime CSS and JavaScript generated files are refreshed only through project scripts.
- No broad visual fixes, redesign work, new product behavior, or new dependencies are included in this QA pass.

## Surfaces Covered

- [x] dashboard
- [x] clients
- [x] client detail
- [x] projects
- [x] project detail
- [x] calendar
- [x] settings
- [x] topbar
- [x] sidebar
- [x] drawer
- [x] modal
- [x] toast
- [x] forms
- [x] confirm dialogs
- [x] global search
- [x] data-heavy rows, cards, lists, and kanban
- [x] destructive actions

## Viewport Checklist

Check every protected surface at:

- [x] 360px
- [x] 390px
- [x] 480px
- [x] 760px
- [x] 1024px
- [x] 1280px+

Required gates:

- [x] no unexpected horizontal overflow
- [x] no clipped primary actions
- [x] no hidden modal footer actions
- [x] no hidden drawer actions
- [x] data rows and cards wrap long labels without layout breakage
- [x] topbar controls remain reachable
- [x] mobile drawer opens, closes, and returns focus

## Environment Checklist

- [x] light theme
- [x] dark theme
- [x] browser `prefers-reduced-motion: reduce`
- [x] FlowDesk reduced motion setting
- [x] keyboard-only navigation
- [x] mouse interaction
- [x] touch-sized mobile targets where covered by viewport and control-size checks
- [x] long text and dense data
- [x] low-data or empty states where already supported by existing UI

## Interaction And Accessibility Gates

- [x] visible focus order for keyboard users
- [x] focus return after drawer close
- [x] focus return after modal close
- [x] Escape closes drawer
- [x] Escape closes modal
- [x] Escape closes user menu
- [x] confirm dialog supports confirm and cancel flows
- [x] destructive actions are visually distinct from neutral actions
- [x] disabled states are visible when controls are semantically disabled
- [x] helper text, error text, badges, metadata, and muted text remain readable in light and dark themes
- [x] reduced motion removes or simplifies nonessential transitions
- [x] toast messages remain understandable when motion is reduced
- [x] axe smoke checks pass for primary app views

## PWA And Performance Gates

- [x] `service-worker-assets.js` stays synchronized through `npm run pwa:manifest` and `npm run pwa:check`
- [x] app-shell manifest excludes docs, tests, reports, and generated minified files by policy
- [x] generated and minified files are not manually edited
- [x] performance budget remains within configured gzip limits
- [x] service worker update prompt remains user controlled
- [x] offline app-shell coverage remains tested through existing e2e tests

## Current QA Evidence

Automated evidence used for this pass:

- temporary Playwright smoke test for final QA was created, executed, and removed before finishing
- temporary smoke covered required viewport widths: 360, 390, 480, 760, 1024, and 1280px
- temporary smoke covered protected routes: dashboard, clients, client detail, projects, project detail, calendar, and settings
- temporary smoke covered mobile drawer open/close overflow and focus return
- temporary smoke covered dark theme, FlowDesk reduced motion setting, browser reduced motion emulation, toast visibility, modal focus return, and long imported data overflow
- existing e2e coverage verifies login, create/edit/archive/restore/delete/reset/import, global search, drawer behavior, modal focus, PWA update prompt, offline cache, localStorage failure, and mobile overflow
- existing a11y coverage verifies axe smoke checks for login, drawer, dashboard, clients, client detail, projects, project detail, calendar, and settings

Verification commands for this pass:

- `npm run lint`
- `npm run test:e2e`
- `npm run test:a11y`
- `npm run pwa:check`
- `npm run perf:budget`
- `npm run check`
- `git diff --check`

## Follow-Up Visual Fixes

No blocking visual fixes were found during this final QA pass. Any future visual work should be handled as a separate visual-fix pass and should not be bundled into this checklist task.

## Limitations

- No physical touch-device pass was run; touch suitability is inferred from viewport checks, control sizing, and Playwright interaction coverage.
- No manual screen-reader pass was run; accessibility evidence is limited to semantic inspection and axe-based smoke tests.
- Browser coverage used the configured Playwright Chromium project only.
