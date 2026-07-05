# ADR 003: Hash routing for static SPA hosting

## Status

Accepted

## Context

FlowDesk is deployed as a static SPA demo and must work on simple static hosting without server-side route handling.

## Decision

Use hash routing through `window.location.hash`.

Routes use paths such as `#/dashboard`, `#/clients/:id` and `#/projects/:id`.

## Consequences

- Static hosting is simple and predictable.
- Protected route guards work entirely on the client.
- URLs are less polished than history API URLs.
- A future production app can move to history routing if hosting and backend routing support it.
