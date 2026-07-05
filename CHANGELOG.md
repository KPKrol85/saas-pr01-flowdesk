# Changelog

All notable FlowDesk changes should be documented here.

The project uses semantic versioning language for named milestones. See `docs/versioning.md`.

## 1.0.0 - 2026-07-05

### Added

- repeatable quality toolchain with linting, formatting, test scripts and CI
- Vitest unit and integration tests
- Playwright e2e, visual smoke and axe accessibility checks
- formal domain models, validation, schema migrations and recovery rules
- store actions, selectors, persistence adapter and repository boundaries
- safe rendering helpers and frontend hardening
- reusable UI component system and design system documentation
- expanded Service Management workflows for clients, projects, details, search, archive, import and metrics
- backend-readiness docs, identity models, RBAC contract and sync metadata hooks
- generated service worker app-shell manifest, controlled update prompt and performance budget tooling
- architecture docs, ADRs, Definition of Done, release checklist and observability readiness

### Notes

- FlowDesk remains a frontend-only demo with fake auth and `localStorage` persistence
- production use requires real backend auth, server-side validation, RBAC, storage, monitoring and hosting security headers
