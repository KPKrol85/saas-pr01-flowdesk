# ADR 006: Generated app-shell manifest for PWA cache

## Status

Accepted

## Context

The service worker needs a reliable list of runtime assets. Manually maintaining a long app-shell list is easy to break as modules are added.

## Decision

Generate `service-worker-assets.js` with `scripts/generate-service-worker-manifest.js`.

The service worker imports that manifest and uses versioned cache names derived from the generated hash.

## Consequences

- Runtime asset changes are captured by `npm run pwa:manifest`.
- CI can validate freshness with `npm run pwa:check`.
- Test files, docs, screenshots, `node_modules` and minified artifacts stay out of app-shell.
- Developers must regenerate the manifest after adding runtime modules.
