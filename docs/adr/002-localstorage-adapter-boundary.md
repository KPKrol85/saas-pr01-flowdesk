# ADR 002: localStorage demo adapter with repository boundary

## Status

Accepted

## Context

FlowDesk persists demo data locally, but future product work may require a backend API, real auth, organization isolation and server-side validation.

## Decision

Use `localStorage` only as the active demo adapter behind repository and persistence boundaries.

Repositories expose collection operations for clients, projects and events. Views should continue to use store/actions/selectors and should not read `localStorage` directly.

## Consequences

- The current demo keeps local persistence.
- Data from `localStorage` remains untrusted and passes through migrations and validation.
- A future API adapter can replace the local adapter with lower UI churn.
- Production still requires backend storage and authorization.
