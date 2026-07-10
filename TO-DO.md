# FlowDesk To-Do

## Purpose

This document is the current repository-level backlog for realistic future FlowDesk
work. It replaces older root roadmap documents as the compact place to decide what
should happen next.

Completed Priority 1 is recorded in `DONE.md`. Remaining priority numbers preserve
the original backlog order.

Items below are planning targets. They do not authorize backend implementation,
real authentication, billing, payment integrations, a database, framework migration,
new dependencies, or production security claims unless a future task scopes that work
explicitly.

## Operating Rules For Future Work

- keep FlowDesk frontend-only until a separate backend task is approved
- keep demo auth, `localStorage`, RBAC, sync metadata, and API contracts described as
  readiness layers only
- use existing HTML, CSS, Vanilla JavaScript ES Modules, components, tokens, BEM-like
  naming, tests, and documentation patterns
- do not manually edit generated or minified files
- do not add new dependencies for polish or convenience without a clear scoped reason
- keep future tasks small enough to review and commit as one logical change

## Priority 2 - Portfolio Release Package

Goal: prepare FlowDesk for a public portfolio demo without overstating production
readiness.

Current status:

- canonical public origin is confirmed as `https://saas-pr01-flowdesk.netlify.app/`
- direct demo login URL is confirmed as
  `https://saas-pr01-flowdesk.netlify.app/#/login`
- repository-level metadata and release documentation have been prepared for the
  confirmed public URLs
- the public Netlify deployment is maintained separately through `kp-code-portfolio`
  and must not be inspected, modified, or deployed from this repository
- Priority 2 remains active until the owner-managed deployment sync publishes the
  updated metadata and live `index.html`, `robots.txt`, and `sitemap.xml` match the
  confirmed canonical origin

Scope:

- choose the final deployment URL
- update deployment-specific metadata only after the final URL is known
- verify `canonical`, `og:url`, absolute `og:image`, `robots.txt`, and `sitemap.xml`
- run the release checklist before publishing
- keep demo auth, local demo data, and frontend-only boundaries visible

Acceptance criteria:

- public metadata points to the real deployment, not placeholders
- README public demo notes match the deployed behavior
- release checklist steps are completed or intentionally deferred with a note
- no backend, database, auth provider, billing, or cloud sync is introduced

Suggested verification:

- `npm run check`
- `npm run lighthouse`
- manual clean-browser smoke test against the deployed URL
- PWA installability and service worker registration check

## Priority 3 - Visual Evidence And Manual UI QA

Goal: create current, truthful portfolio visuals and close the remaining manual UI
review gaps that automated Chromium checks do not fully cover.

Current status:

- local visual evidence has been captured from the current FlowDesk application
  into `docs/qa/priority-3-screenshots/`
- scoped QA evidence is recorded in `docs/qa/priority-3-visual-evidence.md`
- Chromium visual smoke coverage has been completed for the captured app surfaces
- one confirmed visual issue was fixed: desktop clients table action labels no
  longer wrap inside words
- Firefox and WebKit visual smoke checks remain pending because matching
  Playwright browser executables are unavailable in the current environment
- manual physical-device touch testing, genuine screen-reader testing, and final
  owner-led portfolio review remain pending
- Priority 3 remains active until the pending manual and unavailable browser gates
  are completed and documented

Scope:

- manual real-device touch pass
- manual screen-reader pass
- cross-browser visual spot check beyond the configured Chromium coverage
- final owner-led visual review before publishing on KP_Code Digital Studio
- desktop dashboard
- clients
- projects
- calendar
- settings
- mobile shell
- optional client detail and project detail captures

Acceptance criteria:

- screenshots come from the current app, not mockups
- screenshots do not show production-only features
- screenshots avoid real customer data, credentials, tokens, or secrets
- images are refreshed after release-grade UI changes
- any future CSS polish is small, targeted, and tied to a confirmed visual issue
- no broad UI refactor, full redesign, design system rewrite, or framework migration

Suggested verification:

- run the app locally or against the final deployment URL
- capture desktop and mobile viewports
- inspect screenshots before adding them to any portfolio surface
- document the real-device, screen-reader, and cross-browser results in a scoped QA
  note if issues are found

## Priority 4 - Future Backend Planning

Goal: prepare an implementation-ready backend decision without changing current
frontend behavior.

Scope:

- authentication provider or session strategy
- organization and workspace lifecycle
- server-side RBAC enforcement
- persistence and migration strategy
- API adapter strategy
- server-side validation
- audit logging
- request correlation and observability provider boundary
- offline sync and conflict resolution model

Current status (2026-07-10):

- the current frontend readiness layers and their demo-only limitations are
  mapped in `docs/backend-readiness.md`
- provider-neutral session, organization lifecycle, tenant isolation,
  server-side RBAC, persistence, validation, audit, correlation, and phased
  migration boundaries are documented
- `docs/api-contracts.md` now defines Proposed organization scoping, stable
  envelopes, pagination, idempotency, online concurrency, error mapping, and a
  Deferred offline-sync contract
- `docs/future-saas-readiness.md` is the canonical Proposed/Deferred owner
  decision register
- `docs/adr/008-provider-neutral-backend-boundary.md` records the architecture
  decision with status Proposed
- Priority 4 remains active because backend technology, deployment topology,
  identity provider, storage/recovery targets, final RBAC delete policy, data and
  audit retention, observability constraints, and offline/conflict scope still
  require owner approval
- no backend runtime, API adapter, network request, dependency, deployment, or
  current frontend behavior was added by this planning milestone

Acceptance criteria:

- backend work is documented as a future architecture task
- frontend readiness layers are not described as production security
- data ownership, permissions, validation, and audit requirements are explicit
- any future implementation references `docs/backend-readiness.md`,
  `docs/api-contracts.md`, and `docs/future-saas-readiness.md`

Suggested verification:

- add or update ADRs before implementation
- review API contracts before changing repositories
- keep frontend-only behavior unchanged until backend work is explicitly scoped

## Priority 5 - Future Product Expansion

Goal: expand the Service Management product only after the current demo remains
stable and reviewable.

Candidate areas:

- reports and analytics
- SLA alerts and escalation rules
- recurring service templates
- operational checklists
- notifications
- client or project attachments
- team notes
- integrations with external tools
- advanced filtering, saved views, or bulk actions

Acceptance criteria:

- each feature has a clear user workflow and acceptance criteria
- existing data integrity rules and demo boundaries remain intact
- UI density stays suitable for a SaaS operations dashboard
- tests match the risk and touched surfaces

Suggested verification:

- unit tests for domain logic
- integration tests for view behavior
- e2e tests for critical workflows
- a11y tests for new interactive surfaces

## Priority 6 - Optional Technical Evolution

Goal: evaluate technical migration only when the current stack becomes a real
maintenance blocker.

Candidate decisions:

- TypeScript adoption
- Vite or another bundler
- framework migration
- stronger visual regression tooling
- dedicated Lighthouse CI dependency

Acceptance criteria:

- the migration has an ADR and measurable maintenance reason
- the current Vanilla JavaScript ES Modules architecture is respected until the
  decision is approved
- migration work is not mixed with unrelated product or UI changes

Suggested verification:

- migration spike in a separate branch or task
- explicit rollback plan
- full local quality gate before merging

## Parking Lot

- pricing and monetization research
- payment provider comparison
- billing portal design
- production account management
- real cloud sync
- conflict resolution UI
- organization settings
- audit log UI
- role management UI
- public case-study page in the broader KP_Code portfolio

## Out Of Scope For The Current Demo

- backend implementation
- real authentication
- database schemas
- live API requests
- payment provider integration
- billing or pricing logic
- customer data storage
- production security claims
- cloud sync
- production monitoring adapter
- framework migration without ADR-backed approval
