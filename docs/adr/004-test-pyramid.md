# ADR 004: Vitest, Playwright and axe test pyramid

## Status

Accepted

## Context

FlowDesk needs regression coverage for domain logic, DOM integration, user workflows, accessibility and PWA behavior.

## Decision

Use:

- Vitest for unit tests,
- Vitest + jsdom for integration tests,
- Playwright for e2e and visual smoke tests,
- axe through Playwright for accessibility checks.

## Consequences

- Core domain behavior is fast to test.
- Critical user flows are covered in a browser.
- Accessibility regressions are checked automatically.
- Browser tests are slower and should remain focused on high-value workflows.
