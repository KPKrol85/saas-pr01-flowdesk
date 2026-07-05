# FlowDesk versioning

## Current convention

FlowDesk uses semantic versioning language for named milestones:

```text
MAJOR.MINOR.PATCH
```

Current package version starts at `1.0.0` because the project is a polished demo milestone, not a production SaaS release.

## Version meanings

| Segment | Meaning                                                                                                                 |
| ------- | ----------------------------------------------------------------------------------------------------------------------- |
| MAJOR   | large architecture or product direction changes, migration to backend, framework migration, breaking data model changes |
| MINOR   | new user-visible workflows, major domain expansion, new app modules, new infrastructure gates                           |
| PATCH   | bug fixes, documentation, test coverage, small hardening, non-breaking polish                                           |

## Demo maturity labels

Use changelog language to clarify maturity:

- `demo milestone` - portfolio/demo-ready increment
- `production readiness` - architecture/process hardening
- `production release` - only after real backend, auth, deployment and monitoring exist

Do not describe FlowDesk as production-ready while it remains frontend-only with demo auth and `localStorage`.

## Release process

For a named release:

1. Update `package.json` version.
2. Update `CHANGELOG.md`.
3. Run the release checklist.
4. Tag using `vMAJOR.MINOR.PATCH` if the repository workflow supports tags.
5. Deploy the built static app.

For ordinary development changes, package version does not need to change.
