# ADR 001: Vanilla JavaScript ES Modules for this stage

## Status

Accepted

## Context

FlowDesk is a frontend-only SaaS-style demo. The current scope prioritizes clean architecture, safe rendering, tests, PWA behavior and documentation over framework-level complexity.

## Decision

Keep the application on Vanilla JavaScript ES Modules for the current milestone.

Do not migrate to React, Vue, Svelte, TypeScript, Vite or Next.js until a concrete product or maintenance need justifies the cost.

## Consequences

- The runtime remains lightweight and easy to inspect.
- Architecture boundaries must stay explicit because no framework enforces them.
- UI reuse depends on local components and conventions.
- A future framework migration remains possible, but should be a deliberate ADR-backed decision.
