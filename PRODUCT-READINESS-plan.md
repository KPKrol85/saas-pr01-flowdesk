# FlowDesk Product Readiness Plan

## Purpose

This roadmap defines the next improvement phase after the completed FlowDesk UI polish roadmap. It focuses on product readiness, demo quality, portfolio presentation, data realism, critical user flows, release hygiene, and future backend readiness.

The plan is intended to move FlowDesk from a polished frontend demo toward a stronger portfolio-ready SaaS product demo while preserving the current frontend-only architecture, Vanilla JavaScript ES Modules, localStorage demo persistence, PWA constraints, testing strategy, accessibility standards, performance budget, and lightweight component system.

## Scope Boundaries

This plan does not authorize:

- backend implementation
- real authentication implementation
- database implementation
- framework migration
- broad UI redesign
- product behavior changes outside a clearly scoped future task
- new dependencies unless a future task explicitly justifies them
- weakening current accessibility, testing, PWA, performance, or architecture standards
- manual edits to generated or minified files
- manual edits to `service-worker-assets.js`
- unrelated refactors

Generated files, minified files, service worker assets, and package files should stay untouched unless a future task explicitly includes the relevant build or release workflow.

## Assumptions

- FlowDesk remains a standalone frontend-only SaaS dashboard demo.
- Demo auth, RBAC, repository boundaries, sync metadata, and API contract documents are readiness layers, not production security.
- UI polish roadmap points 1-10 are complete and should be preserved.
- Future implementation work should follow `docs/definition-of-done.md`, `docs/design-system.md`, `docs/architecture.md`, `docs/pwa-strategy.md`, `docs/performance-budget.md`, and the existing test pyramid.
- Each roadmap point below is planned work. None of the points is marked as Done by this document.

## Roadmap Governance

- Treat every point as an independent future task.
- Inspect current repo context before changing files.
- Keep each future task scoped to one roadmap point unless the prompt explicitly expands scope.
- Update this document only for the roadmap point being completed.
- Do not mark unrelated roadmap points as complete.
- Preserve completed UI polish work and existing guardrails.

## 1. Product Story And Demo Narrative

**Priority:** High
**Risk Level:** Low
**Recommended Task Type:** documentation, UX/content polish, audit-only
**Status:** Done - audited the product narrative across README, app shell, login, dashboard, settings, quick add, import, export, reset, search, modal, drawer, toast, and confirm copy. Updated README first-minute product story, refined visible demo-boundary copy, and preserved frontend-only scope.

### Goal

Clarify what FlowDesk demonstrates, who it is for, and which service management problem the demo is solving.

### Scope

- Review the README, visible app copy, demo login framing, dashboard labels, settings warnings, and portfolio-facing descriptions.
- Align terminology across dashboard, clients, client detail, projects, project detail, calendar, settings, topbar, sidebar, drawer, modal, and toast copy.
- Keep the application positioned as a frontend-only SaaS product demo, not a production system.

### Specific Checks And Implementation Notes

- Check whether the first-time viewer can understand FlowDesk within the first minute.
- Ensure demo-only limitations are visible but not distracting.
- Identify unclear labels, Polish/English inconsistencies, or copy that sounds like an internal implementation note.
- Prefer concise product language over marketing claims that are not supported by the repo.
- Keep existing behavior and architecture unchanged unless a future implementation task explicitly scopes copy updates.

### Acceptance Criteria

- FlowDesk has a clear product narrative for portfolio reviewers.
- Demo-only limitations remain honest and explicit.
- Main app surfaces use consistent service management terminology.
- No architecture, routing, or behavior changes are introduced by the audit or documentation task.

### Suggested Verification

- Read `README.md` and main app copy against the narrative checklist.
- Review login, dashboard, clients, projects, calendar, and settings for terminology consistency.
- Run `git diff --check` for documentation or copy-only changes.

## 2. Demo Data Realism

**Priority:** High
**Risk Level:** Medium
**Recommended Task Type:** demo data, UX/content polish, tests
**Status:** Done - audited seeded clients, projects, events, contacts, tags, SLA, estimates, comments, history, due dates, dashboard density, archived records, and data safety. Improved `js/data/seed.js` with a coherent fictional service-management workspace, safer `.test` contact data, meaningful overdue/upcoming work, richer relationships, and preserved schema compatibility.

### Goal

Improve the credibility of FlowDesk demo data so core views feel like a real service business workspace.

### Scope

- Review seeded clients, projects, events, contacts, segments, owners, tags, SLA fields, estimates, comments, history entries, priorities, due dates, and archived records.
- Keep data safe, fictional, and appropriate for a public portfolio demo.
- Preserve schema versioning, migrations, validation, and localStorage recovery rules.

### Specific Checks And Implementation Notes

- Check whether dashboard metrics, overdue work, upcoming events, client detail, and project detail have enough realistic data density.
- Add realism through coherent relationships, not random volume.
- Keep records internally consistent across `clients`, `projects`, and `events`.
- Avoid personal data that looks real, confidential, or copied from an actual client.
- Include edge-friendly seed data only when it supports visible product flows.

### Acceptance Criteria

- Seed data tells a believable service management story.
- Each main view has enough data to demonstrate its intended value.
- Related clients, projects, events, comments, and history remain coherent.
- Existing validators, migrations, unit tests, integration tests, and e2e flows still pass after future data changes.

### Suggested Verification

- Inspect `js/data/seed.js`, domain validators, migrations, and relationship selectors.
- Run `npm run test:unit`.
- Run `npm run test:integration`.
- Run targeted e2e smoke tests for dashboard, clients, projects, calendar, and settings if demo data changes affect visible flows.

## 3. Core User Flows

**Priority:** High
**Risk Level:** Medium
**Recommended Task Type:** audit-only, frontend implementation, UX/content polish, tests
**Status:** Done - audited demo login, dashboard review, add client, client detail, add project, project detail, checklist, calendar event, global search, export, import, reset, archive, restore, theme, reduced motion, and logout flows. Refined quick add routing, mutation feedback, and post-create visibility while preserving architecture, routing, data models, and frontend-only scope.

### Goal

Make the most important demo journeys feel intentional, complete, and easy to evaluate.

### Scope

- Audit and refine key flows: demo login, dashboard review, add client, open client detail, add project, open project detail, update checklist, add calendar event, global search, export, import, reset, archive, restore, and theme preference.
- Preserve existing hash routes and localStorage persistence.
- Keep flows accessible by keyboard and compatible with mobile shell behavior.

### Specific Checks And Implementation Notes

- Identify any flow that starts well but ends without a useful confirmation, next step, or visible state change.
- Ensure destructive or high-impact steps use existing confirm dialog patterns.
- Confirm toasts are concise and do not hide critical information.
- Prefer small targeted UX improvements over new feature scope.
- Protect existing Playwright critical flows from regressions.

### Acceptance Criteria

- Primary demo flows can be completed without confusion on desktop and mobile.
- Each successful mutation has clear visible feedback.
- Error and cancel paths remain understandable.
- Existing accessibility, reduced-motion, PWA, and performance guardrails remain intact.

### Suggested Verification

- Run manual smoke testing across the critical flows.
- Run `npm run test:e2e`.
- Run `npm run test:a11y` when UI behavior is touched.
- Run `git diff --check`.

## 4. Global Search Quality

**Priority:** Medium
**Risk Level:** Medium
**Recommended Task Type:** frontend implementation, UX/content polish, tests
**Status:** Done - audited global search targets, searchable fields, labels, metadata, destinations, no-match state, keyboard flow, pointer behavior, and responsive shell compatibility. Improved client contact matching, project and event context, deterministic lightweight ranking, result accessibility, and focused unit, e2e, and a11y coverage while preserving the existing topbar model and architecture.

### Goal

Make global search more useful, predictable, and portfolio-ready without turning it into a complex search engine.

### Scope

- Review current search targets for clients, projects, and events.
- Evaluate result labels, metadata, empty results, keyboard flow, ranking, and route destinations.
- Preserve the existing topbar search model and selectors unless a future task explicitly scopes implementation changes.

### Specific Checks And Implementation Notes

- Check whether search matches meaningful fields such as client names, contacts, project names, statuses, priorities, tags, events, and owners.
- Confirm results clearly communicate type, destination, and context.
- Avoid hidden behavior that is not represented in tests.
- Consider lightweight ranking rules before adding new dependencies.
- Ensure mobile search access remains compatible with completed responsive shell work.

### Acceptance Criteria

- Search results are relevant, readable, and easy to open.
- Empty and no-match states are clear.
- Keyboard and pointer interactions remain accessible.
- Search implementation stays small and aligned with existing selectors.

### Suggested Verification

- Inspect `js/core/selectors.js`, topbar behavior, and search e2e coverage.
- Run `npm run test:unit` for selector changes.
- Run `npm run test:e2e` for route-opening behavior.
- Run `npm run test:a11y` if search UI is changed.

## 5. Import, Export, Reset, And Data Recovery UX

**Priority:** High
**Risk Level:** Medium
**Recommended Task Type:** UX/content polish, frontend implementation, tests

### Goal

Make demo data management safer, clearer, and easier to trust during a public demo.

### Scope

- Review settings flows for JSON export, validated import, malformed import rejection, reset demo data, localStorage recovery, and storage-unavailable mode.
- Preserve current validation, migrations, repository boundaries, and localStorage adapter behavior.
- Keep destructive actions behind existing confirmation patterns.

### Specific Checks And Implementation Notes

- Ensure export clearly communicates that data is local demo JSON.
- Ensure import warns that local demo data will be replaced.
- Confirm malformed JSON, invalid schemas, missing relationships, and recovered data paths have useful feedback.
- Make reset and recovery flows understandable without exposing implementation-heavy language.
- Do not add real backup, cloud sync, or backend persistence in this roadmap point.

### Acceptance Criteria

- Export, import, reset, and recovery flows are understandable and safe for demo users.
- Invalid data never silently corrupts the local demo state.
- Recovery paths preserve existing schema migration and validation behavior.
- Destructive actions remain confirmable and cancellable.

### Suggested Verification

- Inspect settings view, actions, migrations, validators, storage helper, and related tests.
- Run `npm run test:unit`.
- Run `npm run test:integration`.
- Run the e2e import/export/reset flows.

## 6. Empty, Low-Data, And Edge States

**Priority:** Medium
**Risk Level:** Low
**Recommended Task Type:** demo data, UX/content polish, frontend implementation, tests

### Goal

Make FlowDesk resilient and professional when records are missing, archived, filtered out, malformed, or sparse.

### Scope

- Review dashboard, clients, client detail, projects, project detail, calendar, settings, search, drawer, modal, and toast states.
- Cover empty lists, filtered lists, archived records, missing related records, deleted records, invalid routes, unavailable storage, malformed imports, and low-data dashboards.
- Preserve existing empty state component patterns.

### Specific Checks And Implementation Notes

- Confirm every empty or filtered state explains what happened and offers an appropriate next action when useful.
- Avoid adding fake records only to hide weak empty-state design.
- Check long names, missing email, missing phone, missing project relation, and archived record behavior.
- Keep no-data states accessible and visually consistent with the design system.

### Acceptance Criteria

- Empty and low-data states do not look broken.
- Missing or archived relationships are represented clearly.
- Invalid routes and deleted records guide users back to a useful path.
- Existing tests continue to cover important edge paths.

### Suggested Verification

- Inspect empty state usage across views and components.
- Run `npm run test:integration`.
- Run targeted Playwright checks for empty, archived, and invalid route paths.
- Run `npm run test:a11y` if UI states change.

## 7. Data Integrity And Validation Rules

**Priority:** High
**Risk Level:** High
**Recommended Task Type:** architecture readiness, frontend implementation, tests

### Goal

Strengthen client-side data integrity without pretending frontend validation replaces backend security.

### Scope

- Review model factories, validators, migrations, actions, repository results, relationship consistency, import validation, and RBAC readiness boundaries.
- Keep validation compatible with current demo flows and future API contracts.
- Do not implement backend validation or real authorization in this point.

### Specific Checks And Implementation Notes

- Identify fields where validation is too loose for a professional product demo.
- Confirm relationship rules for clients, projects, events, archived records, deleted records, and restored records.
- Check whether errors can be mapped cleanly to forms, toasts, or repository failures.
- Preserve safe rendering expectations for user-entered data.
- Avoid breaking imported older state without a migration path.

### Acceptance Criteria

- Invalid records are rejected, normalized, or recovered through documented paths.
- Relationship consistency is preserved after create, update, archive, restore, delete, import, and reset flows.
- Error shapes remain predictable for UI and repository boundaries.
- Tests cover high-risk validation and migration paths.

### Suggested Verification

- Run `npm run test:unit`.
- Run `npm run test:integration`.
- Run targeted e2e flows for create, archive, restore, import, and reset.
- Run `git diff --check`.

## 8. Portfolio And Public Presentation Readiness

**Priority:** Medium
**Risk Level:** Low
**Recommended Task Type:** documentation, UX/content polish, release hygiene

### Goal

Prepare FlowDesk to be presented publicly as a polished SaaS demo with clear boundaries and reliable first impressions.

### Scope

- Review README, screenshots or future screenshot strategy, public demo notes, metadata, robots, sitemap, manifest names, Open Graph readiness, demo credentials, and visible disclaimers.
- Keep claims evidence-based and consistent with the current repository.
- Avoid turning this into a marketing site or unrelated landing page redesign.

### Specific Checks And Implementation Notes

- Confirm public-facing documentation explains the app, stack, constraints, and how to run it.
- Ensure demo credentials and demo-only boundaries are easy to find.
- Review whether production URLs, canonical values, and metadata need a future deployment-specific task.
- Check that app screenshots or visual evidence, if added later, are generated from the current UI and not mocked beyond the product.
- Do not claim backend, production auth, database, or real customer readiness.

### Acceptance Criteria

- A portfolio reviewer can understand the project, run it, and evaluate its scope quickly.
- Public-facing claims match implemented functionality.
- Demo limitations are explicit without undermining the product presentation.
- Release or deployment-specific metadata is tracked clearly if not completed.

### Suggested Verification

- Review README, release checklist, manifest, sitemap, robots, and app metadata.
- Run `npm run check` for release-bound public changes when applicable.
- Run `git diff --check`.

## 9. Release Hygiene And Repository Cleanliness

**Priority:** High
**Risk Level:** Low
**Recommended Task Type:** release hygiene, documentation, tests

### Goal

Keep the standalone FlowDesk repository clean, repeatable, and safe to release or share.

### Scope

- Review `.gitignore`, generated files policy, package scripts, GitHub Actions, release checklist, changelog, versioning, PWA manifest generation, performance budget, and documentation map.
- Preserve committed generated files that are intentionally part of the current workflow.
- Avoid deleting or rewriting valid project files.

### Specific Checks And Implementation Notes

- Confirm ignored local artifacts do not appear in `git status --short`.
- Confirm minified app files and `service-worker-assets.js` are updated only by scripts.
- Check that release steps match current package scripts.
- Confirm docs do not reference outdated repository paths or old project locations.
- Keep repository hygiene tasks separate from product feature work.

### Acceptance Criteria

- The repository status is easy to review before release.
- Local-only artifacts, reports, logs, and cache folders remain ignored.
- Release checklist and package scripts stay aligned.
- No accidental source, generated, or dependency artifacts are included.

### Suggested Verification

- Run `git status --short`.
- Run `npm run pwa:check`.
- Run `npm run build` when generated outputs are expected.
- Run `npm run check` before a release-grade change.
- Run `git diff --check`.

## 10. Future Backend And Monetization Readiness

**Priority:** Medium
**Risk Level:** High
**Recommended Task Type:** architecture readiness, documentation, audit-only

### Goal

Clarify future backend, account, plan, permission, billing, and monetization boundaries without implementing backend or billing logic.

### Scope

- Review backend readiness, API contracts, identity models, RBAC, organization context, repository boundaries, sync metadata, settings, and public demo copy.
- Identify gaps that would block future backend work, multi-user flows, subscription plans, audit logs, or organization-level settings.
- Keep this as readiness planning unless a future prompt explicitly scopes implementation.

### Specific Checks And Implementation Notes

- Separate demo-only frontend contracts from real backend responsibilities.
- Check whether future API contracts cover current product flows and likely SaaS account needs.
- Identify where UI may need future plan, role, or permission messaging without enforcing fake security.
- Consider future monetization concepts only as product planning, not live payments or billing implementation.
- Do not add payment providers, auth providers, backend routes, database schemas, or network requests in this roadmap point.

### Acceptance Criteria

- Future backend readiness gaps are documented without changing current app behavior.
- API, RBAC, sync, and organization boundaries remain internally consistent.
- Monetization notes are clearly framed as future product planning.
- No backend, database, real auth, or billing implementation is introduced.

### Suggested Verification

- Review `docs/backend-readiness.md`, `docs/api-contracts.md`, `docs/architecture.md`, domain identity, RBAC, repositories, and settings.
- Run `git diff --check` for documentation-only work.
- For future code-affecting readiness changes, run the full relevant test gate defined by `docs/definition-of-done.md`.

## Recommended Execution Order

1. Product Story And Demo Narrative
2. Demo Data Realism
3. Core User Flows
4. Import, Export, Reset, And Data Recovery UX
5. Empty, Low-Data, And Edge States
6. Global Search Quality
7. Data Integrity And Validation Rules
8. Portfolio And Public Presentation Readiness
9. Release Hygiene And Repository Cleanliness
10. Future Backend And Monetization Readiness

This order prioritizes product clarity, believable demo data, and safe demo workflows before deeper validation, release hygiene, and future backend planning.

## Future Task Template

Use this template when converting any roadmap point into a future `PROMPT - CODEX` task.

```md
# PROMPT - CODEX

You are a senior product-minded frontend developer working on the FlowDesk project.

## Project Context

FlowDesk is a standalone frontend-only SaaS-style Service Management Dashboard demo located at:

`C:\Users\KPKro\MY FILES\repos\saas-pr01-flowdesk`

The project uses HTML, CSS, Vanilla JavaScript ES Modules, hash routing, localStorage demo persistence, PWA files, tests, documentation, generated/minified build outputs, and a lightweight UI component system.

## Roadmap Point

Address product-readiness roadmap point: `[number] - [title]`.

## Task Objective

[Describe the precise change or audit outcome.]

## Allowed Files

- [List exact files or directories allowed for this task.]

## Forbidden Files

- Do not edit unrelated source files.
- Do not edit generated or minified files manually.
- Do not edit service worker assets manually.
- Do not change package files unless explicitly required.
- Do not change GitHub Actions unless explicitly required.

## Behavior Constraints

- Preserve current architecture.
- Preserve completed UI polish work.
- Preserve PWA, performance, accessibility, and test guardrails.
- Avoid unrelated refactors.
- Do not implement backend, database, real auth, or billing unless explicitly scoped.

## Acceptance Criteria

- [Point-specific criteria.]

## Verification

- [Exact commands to run.]
- `git diff --check`

## Expected Final Summary

- files inspected
- files changed
- behavior changed or unchanged
- verification performed
- limitations or follow-up notes
```

## Notes For Future Codex Tasks

- Inspect existing project context before editing files.
- Identify the exact roadmap point being addressed.
- Keep each task focused on one logical scope of work.
- Avoid unrelated refactors, rewrites, and broad redesigns.
- Preserve current architecture, repository boundaries, localStorage demo persistence, and hash routing.
- Preserve completed UI polish work from `UI-improvements-plan.md`.
- Preserve tests, PWA, performance, accessibility, and release guardrails.
- Use existing components, tokens, BEM-like naming, selectors, actions, validators, and repositories before adding new abstractions.
- Update `PRODUCT-READINESS-plan.md` status only for the roadmap point completed by a future task.
- Do not mark unrelated roadmap points as complete.
- Keep generated and minified files script-generated.
- Document assumptions honestly and avoid claiming production backend, real auth, database, or billing readiness before those systems exist.
