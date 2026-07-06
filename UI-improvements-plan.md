# FlowDesk UI Improvements Plan

## Purpose

This document turns the FlowDesk UI polish notes into an implementation-ready roadmap for reaching a product-grade SaaS dashboard standard. The plan keeps the current FlowDesk architecture, Vanilla JavaScript component model, design tokens, PWA boundaries, and quality gates intact.

The work should improve visual consistency, responsive behavior, accessibility, data readability, and interaction quality without changing product behavior.

## Scope Boundaries

This plan does not authorize:

- redesigning the whole application
- changing product behavior or business workflows
- changing application architecture
- adding a frontend framework
- adding new dependencies
- adding heavy animations or decorative motion
- manually editing generated or minified files
- weakening accessibility, keyboard support, safe rendering, PWA behavior, or performance budgets

Future implementation tasks should use the existing FlowDesk design system, tokens, BEM-like naming, mobile-first breakpoints, components, and Definition of Done.

## Recommended Execution Order

Prioritize correctness and responsive stability before premium visual polish:

1. UI audit by view
2. Mobile navigation, hamburger, and responsive shell
3. Spacing system and layout rhythm
4. Typography, hierarchy, and data readability
5. Dashboard polish
6. Tables, lists, kanban, and data density
7. Forms, modals, drawers, and destructive actions
8. Subtle glass effect and visual surface polish
9. Microinteractions, states, and reduced motion
10. Visual QA, responsive QA, accessibility checks, and test checklist

## 1. UI Audit By View

**Status:** Done — completed the code-backed view-by-view UI audit and documented prioritized findings in `UI-audit.md`. Browser viewport limitations are documented in the audit notes.

### Goal

Create a prioritized, view-by-view UI issue list before changing layout or visual styling.

### Scope

- login
- dashboard
- clients
- client detail
- projects
- project detail
- calendar
- settings
- topbar
- sidebar
- drawer
- modal
- toast

### Specific Checks And Implementation Notes

- Check spacing, alignment, overflow, wrapping, visual hierarchy, and inconsistent component sizing.
- Inspect mobile, tablet, desktop, and wide desktop states before deciding fixes.
- Flag issues that affect interaction quality, not only appearance.
- Separate responsive bugs, accessibility risks, data readability issues, and decorative polish opportunities.
- Use screenshots or concise notes that future CODEX tasks can convert into scoped fixes.

### Acceptance Criteria

- Every major FlowDesk view and shell surface has been reviewed.
- Findings are grouped by view and priority.
- Issues distinguish must-fix layout defects from optional visual polish.
- No application code or CSS is changed during the audit-only task.

### Suggested Verification

- Manual viewport pass at 360px, 390px, 480px, 760px, 1024px, and 1280px+.
- Light theme and dark theme spot checks.
- Keyboard-only pass through topbar, sidebar, drawer, modal, and toast actions.

## 2. Mobile Navigation, Hamburger, And Responsive Shell

**Status:** Done — fixed mobile navigation state synchronization, drawer close behavior, focus return, visible close control, desktop hamburger visibility, and responsive shell safeguards.

### Goal

Make the mobile shell feel stable, predictable, and product-grade across the topbar, sidebar, and hamburger navigation.

### Scope

- hamburger button sizing and placement
- topbar layout on small screens
- sidebar open and close behavior
- backdrop behavior
- body scroll lock
- Escape close
- focus return after close
- active route visibility
- touch target sizing
- horizontal overflow prevention

### Specific Checks And Implementation Notes

- Keep interactive targets at least 44px where practical.
- Preserve route semantics and current navigation behavior.
- Ensure the sidebar does not push content off-screen or create horizontal scroll.
- Keep the topbar usable with long search text, user labels, and narrow mobile widths.
- Reuse existing shell classes, tokens, and component patterns before adding new selectors.
- Maintain reduced-motion behavior for shell transitions.

### Acceptance Criteria

- Mobile navigation opens and closes reliably by click, Escape, and backdrop where supported.
- Focus returns to the hamburger or invoking control after closing the sidebar.
- Active route remains visible and recognizable.
- No horizontal overflow appears at supported mobile widths.
- The shell keeps desktop behavior unchanged.

### Suggested Verification

- Playwright or manual checks at 360px, 390px, 480px, 760px, and 1024px.
- Keyboard test for open, tab through, Escape, and focus return.
- Reduced motion enabled and disabled.
- `npm run test:e2e` if shell flows are touched.
- `npm run test:a11y` if focus or navigation semantics are touched.

## 3. Spacing System And Layout Rhythm

**Status:** Done — unified page, card, panel, list, form, modal, drawer, detail, and responsive spacing rhythm using the existing `--space-*` token scale.

### Goal

Unify spacing across FlowDesk without rebuilding the layout or changing view structure.

### Scope

- page headers
- dashboard blocks
- KPI cards
- panels and cards
- tables and lists
- forms
- modals
- drawers
- empty states
- detail page sections

### Specific Checks And Implementation Notes

- Use the existing `--space-*` token scale instead of one-off pixel values.
- Align repeated vertical gaps between page headers, filters, cards, and content groups.
- Keep compact operational density where data scanning matters.
- Avoid nested card visual patterns unless the current component model already requires them.
- Preserve responsive stacking and avoid layout jumps when content wraps.

### Acceptance Criteria

- Comparable sections use consistent vertical and horizontal rhythm.
- Spacing changes are token-based and predictable.
- Cards, tables, forms, modals, and drawers feel like one product system.
- No view loses useful information density.

### Suggested Verification

- Visual compare dashboard, clients, projects, calendar, and settings.
- Long text and empty state checks.
- `npm run lint` for CSS quality if styles are changed later.
- `git diff --check`.

## 4. Subtle Glass Effect And Visual Surface Polish

**Status:** Done — added restrained surface depth and glass polish across shell, cards, panels, modal, and drawer surfaces while preserving readability and performance.

### Goal

Add controlled depth and surface quality without turning FlowDesk into a visual redesign.

### Scope

- topbar glass surface
- sidebar surface
- elevated cards and panels
- modal and drawer surfaces
- subtle borders
- soft shadow hierarchy
- controlled backdrop blur

### Specific Checks And Implementation Notes

- Treat glass as a restrained enhancement, not a dominant visual style.
- Prefer existing tokens such as `--bg-glass`, `--bg-elev`, `--border`, and `--shadow-*`.
- Avoid aggressive blur, neon color, heavy gradients, and low-contrast overlays.
- Check readability in light and dark themes before accepting surface changes.
- Keep performance budgets in mind because backdrop filters and heavy effects can affect responsiveness.

### Acceptance Criteria

- Surfaces gain subtle depth while text and data remain clear.
- Light and dark themes both maintain adequate contrast.
- Modal, drawer, topbar, sidebar, and cards share a coherent elevation model.
- No heavy animation or expensive decorative layer is added.

### Suggested Verification

- Visual checks in light and dark themes.
- Reduced motion check for any transition touched by surface polish.
- `npm run perf:budget` if CSS or app-shell size changes materially.
- `npm run test:a11y` if contrast, focus, modal, or drawer styling changes.

## 5. Typography, Hierarchy, And Data Readability

**Status:** Done — improved typography hierarchy, KPI emphasis, metadata readability, muted text scanability, and badge status clarity across core FlowDesk views.

### Goal

Improve scanability so users can quickly identify the most important information on every screen.

### Scope

- page titles and descriptions
- card titles
- KPI values and labels
- table headers
- meta labels
- muted text
- badges
- helper text
- empty state copy

### Specific Checks And Implementation Notes

- Use existing `--fs-*`, line-height, text color, and weight patterns.
- Ensure page headers are clearly distinct from card titles and body text.
- Keep KPI values prominent without oversized marketing-style typography.
- Make muted text readable in both themes.
- Ensure badges communicate status and priority without relying on color alone.
- Preserve local Inter font usage.

### Acceptance Criteria

- Each view has a clear hierarchy from page header to content sections to supporting metadata.
- Tables, cards, and detail pages are easier to scan.
- KPI cards show strong but controlled numeric emphasis.
- Text remains readable at mobile widths and with long demo content.

### Suggested Verification

- Manual review of dashboard, clients, client detail, projects, project detail, and calendar.
- Long client names, project names, status labels, and metadata checks.
- Light and dark theme contrast spot checks.
- `npm run test:a11y` if text contrast or semantic structure is changed.

## 6. Dashboard Polish

**Status:** Done — polished dashboard KPI alignment, card rhythm, responsive stacking, activity/event readability, priority indicators, overdue badges, quick-action rows, and empty states while preserving existing data and behavior.

### Goal

Make the dashboard feel like a real SaaS operations overview and the strongest first impression in FlowDesk.

### Scope

- KPI card alignment
- card heights and responsive stacking
- dashboard grid
- recent activity
- upcoming events
- overdue and high-priority indicators
- quick actions
- empty states where applicable

### Specific Checks And Implementation Notes

- Keep dashboard content operational, dense enough to scan, and visually calm.
- Align KPI card heights and value baselines.
- Ensure recent activity and upcoming events do not compete visually with KPI summaries.
- Check mobile and tablet layouts first because dashboard grids commonly break there.
- Preserve current data sources and dashboard behavior.

### Acceptance Criteria

- Dashboard cards align cleanly on desktop and stack predictably on mobile.
- Priority and overdue states are visible without visual noise.
- Quick actions remain accessible and consistent with button patterns.
- Dashboard polish does not introduce new product behavior.

### Suggested Verification

- Manual checks at 360px, 390px, 760px, 1024px, and 1280px+.
- Light and dark theme checks.
- Long content and low-data state checks.
- `npm run test:e2e` if dashboard flow or quick actions are touched.

## 7. Tables, Lists, Kanban, And Data Density

**Status:** Done — improved responsive data density, row actions, badges, archive states, kanban usability, calendar rows, and related-record scanability across FlowDesk data-heavy views.

### Goal

Improve every data-heavy surface so FlowDesk remains readable, responsive, and efficient to scan.

### Scope

- clients table or list
- projects kanban
- calendar list
- related records in client detail and project detail
- archive states
- tags and badges
- row hover and focus states
- mobile cards versus table behavior

### Specific Checks And Implementation Notes

- Prevent table overflow and clipped row actions on mobile.
- Keep action buttons discoverable without overcrowding rows.
- Make status, priority, owner, date, and tag metadata easy to compare.
- Ensure kanban columns remain usable at tablet and desktop widths.
- Keep hover states subtle and pair them with keyboard-visible focus states.
- Avoid reducing data density so much that operational views become slow to scan.

### Acceptance Criteria

- Clients, projects, calendar, and detail records stay readable across supported widths.
- Mobile layouts avoid horizontal scrolling unless a table pattern explicitly requires it.
- Status and priority labels are visually consistent across surfaces.
- Row, card, and kanban interactions have clear hover and focus states.

### Suggested Verification

- Manual data-density pass with long names, many tags, and mixed statuses.
- Mobile and tablet responsive checks.
- Keyboard navigation checks for row actions and kanban controls.
- `npm run test:e2e` if user flows through tables, lists, or kanban are touched.
- `npm run test:a11y` if roles, focus, labels, or controls are changed.

## 8. Forms, Modals, Drawers, And Destructive Actions

**Status:** Done — aligned form control sizing, modal focus management, drawer fit, confirm dialog layout, destructive action hierarchy, settings import textarea sizing, and calendar deletion confirmation.

### Goal

Bring all form and confirmation interactions to one coherent product standard.

### Scope

- input, select, and textarea spacing
- labels, helper text, and error states
- modal width and mobile behavior
- drawer width and mobile behavior
- confirm dialogs
- destructive button hierarchy
- close buttons
- focus-visible states

### Specific Checks And Implementation Notes

- Build on existing form controls, modal, drawer, confirm dialog, and button components.
- Do not create parallel form variants unless the current component API cannot support the need.
- Keep destructive actions visually distinct but not exaggerated.
- Preserve `aria-describedby`, `aria-invalid`, modal semantics, ESC behavior, and focus management.
- Ensure drawers and modals fit small screens without hidden actions.

### Acceptance Criteria

- Form controls use consistent spacing, labels, helper text, and error treatment.
- Modals and drawers behave predictably on mobile and desktop.
- Destructive actions are clearly separated from neutral and primary actions.
- Focus order, Escape behavior, and close controls are accessible.

### Suggested Verification

- Manual create, edit, archive, reset, import, and confirm flows.
- Keyboard-only modal and drawer checks.
- Screen-width checks at 360px, 390px, 480px, 760px, and 1024px.
- `npm run test:e2e` for touched workflows.
- `npm run test:a11y` for modal, drawer, or form changes.

## 9. Microinteractions, States, And Reduced Motion

**Status:** Done — refined restrained hover, active, disabled, focus-visible, modal, drawer, toast, user-menu, and reduced-motion interaction states while preserving accessibility and performance.

### Goal

Add small interaction details that make the UI feel responsive while staying restrained and accessible.

### Scope

- hover states
- active states
- disabled states
- focus-visible states
- pressed button feedback
- drawer and modal transitions
- toast entrance and dismissal
- reduced motion support
- subtle readiness states only where already supported

### Specific Checks And Implementation Notes

- Keep motion short, functional, and tied to user feedback.
- Respect `prefers-reduced-motion` and the FlowDesk reduced motion setting.
- Avoid decorative-only animation and large layout movement.
- Ensure disabled states are visibly disabled and semantically disabled where applicable.
- Keep focus-visible states stronger than hover states for keyboard users.

### Acceptance Criteria

- Interactive controls provide consistent hover, active, disabled, and focus-visible feedback.
- Motion does not distract from data scanning.
- Reduced motion mode removes or simplifies transitions.
- Toast, drawer, and modal state changes remain understandable without animation.

### Suggested Verification

- Manual interaction pass with mouse, keyboard, and touch.
- Reduced motion browser setting and FlowDesk setting checks.
- `npm run test:a11y` if focus states or interactive semantics change.
- `npm run perf:budget` if CSS effects add measurable app-shell size.

## 10. Visual QA, Responsive QA, Accessibility Checks, And Test Checklist

**Status:** Done — created a repeatable final UI QA checklist and completed responsive, theme, reduced-motion, keyboard, accessibility, PWA, performance, and diff hygiene checks.

### Goal

Make UI polish verifiable through a repeatable checklist instead of subjective visual approval.

### Scope

- responsive viewport checks
- light and dark theme checks
- reduced motion checks
- keyboard navigation checks
- long text and data overflow checks
- accessibility smoke checks
- performance and PWA guardrails
- final diff hygiene

### Specific Checks And Implementation Notes

- Treat QA as part of every UI polish task, not a separate final cleanup.
- Cover dashboard, clients, client detail, projects, project detail, calendar, settings, topbar, sidebar, drawer, modal, and toast.
- Use realistic long demo data when checking overflow and wrapping.
- Confirm no manual edits are made to generated or minified files.
- Use project gates based on the touched surface and risk level.

### Acceptance Criteria

- Each UI task includes viewport evidence or documented manual checks.
- No regressions in focus order, keyboard access, text readability, or responsive layout.
- No new horizontal overflow at supported mobile widths.
- PWA and performance constraints are considered when runtime CSS, JS, or app-shell assets change.

### Suggested Verification

- 360px mobile
- 390px mobile
- 480px
- 760px
- 1024px
- 1280px+
- light theme
- dark theme
- reduced motion
- keyboard navigation
- long text and data overflow
- `npm run lint`
- `npm run test:e2e` when UI flows change
- `npm run test:a11y` when components or interactions change
- `npm run pwa:check` when runtime app-shell files change
- `npm run perf:budget` when CSS, JS, or app-shell size changes
- `npm run check` for larger UI polish changes
- `git diff --check`

## Future Task Template

Each implementation area can be converted into a separate CODEX task by defining:

- target view or component
- exact UI issue list
- allowed files
- responsive viewport requirements
- accessibility requirements
- verification commands
- screenshots or manual QA evidence required before completion
