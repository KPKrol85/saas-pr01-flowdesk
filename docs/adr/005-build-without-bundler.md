# ADR 005: Build and minification without a bundler

## Status

Accepted

## Context

FlowDesk currently uses native ES Modules and static files. Introducing a bundler would add migration work and more tooling decisions.

## Decision

Keep the current build strategy:

- PostCSS and cssnano for CSS output,
- Terser for `js/main.js` minification,
- no bundler for the full module graph yet.

## Consequences

- The development model remains transparent.
- The service worker must cache runtime ES modules explicitly through the generated manifest.
- `js/main.min.js` is not a full production bundle.
- A future bundler migration should be considered when module count, deployment needs or TypeScript justify it.
