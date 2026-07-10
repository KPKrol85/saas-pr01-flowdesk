# FlowDesk future SaaS readiness

## Status and document ownership

This document is the canonical decision register for future FlowDesk backend and
SaaS work. FlowDesk remains a frontend-only demo with demo authentication,
`localStorage` persistence, no backend, no live API, no tenant isolation, no
cloud sync, no billing provider, and no production account management.

Detailed responsibilities are intentionally kept elsewhere:

- [`backend-readiness.md`](backend-readiness.md) owns target architecture,
  security invariants, data ownership, migration boundaries, and delivery phases
- [`api-contracts.md`](api-contracts.md) owns the proposed HTTP contract
- [`observability.md`](observability.md) owns telemetry and request-correlation
  boundaries
- ADR [`008-provider-neutral-backend-boundary.md`](adr/008-provider-neutral-backend-boundary.md)
  records the proposed architecture decision

## Decision status

- **Accepted** - already true for the current frontend demo or explicitly
  approved for future implementation.
- **Proposed** - recommended baseline that still requires owner approval before
  implementation.
- **Deferred** - cannot be finalized without owner input, infrastructure,
  technology, legal, privacy, or cost constraints.

Merging documentation does not change a Proposed or Deferred decision to
Accepted.

## Accepted current boundaries

- `js/core/auth.demo.js` is demo-only and does not verify identity on a server.
- `js/domain/identity.js` provides local readiness models, not production
  accounts.
- `js/domain/rbac.js` is a frontend UX contract, not authorization.
- `js/repositories/localStorageRepositoryAdapter.js` is the active synchronous
  demo adapter.
- `js/domain/syncMetadata.js` is a readiness hook, not an outbox or sync engine.
- `js/core/observability.js` is local and does not provide production monitoring.
- Server-side identity, tenant isolation, authorization, validation,
  persistence, audit, and conflict decisions must become authoritative before
  production use.

## Priority 4 decision register

| ID    | Decision                                               | Recommended baseline                                                                     | Status                    | Owner                                  | Required before         | Resolution reference               |
| ----- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------- | -------------------------------------- | ----------------------- | ---------------------------------- |
| FB-01 | backend runtime, framework, and service hosting        | select for operational fit after scope and budget are known                              | Deferred                  | project owner + backend lead           | backend foundation      | future technology ADR              |
| FB-02 | API origin and network topology                        | prefer same-origin browser/API deployment where practical                                | Deferred                  | project owner + infrastructure owner   | backend foundation      | future deployment ADR              |
| FB-03 | identity provider, recovery, and MFA                   | provider-neutral integration; FlowDesk owns authorization                                | Deferred                  | project owner + security owner         | identity and sessions   | future identity ADR                |
| FB-04 | browser session transport                              | revocable server session in `Secure`, `HttpOnly` cookie with CSRF protection             | Proposed                  | project owner + security owner         | identity and sessions   | ADR 008 and backend readiness      |
| FB-05 | organization and workspace relationship                | one `Organization` equals one workspace and tenant boundary                              | Proposed                  | product owner                          | organization isolation  | ADR 008 and backend readiness      |
| FB-06 | multi-organization switching                           | one verified active organization context per request                                     | Proposed                  | product owner + backend lead           | organization isolation  | API contracts                      |
| FB-07 | final role matrix and hard-delete permissions          | preserve current role names; deny hard delete until explicit permissions are approved    | Deferred                  | product owner + security owner         | server RBAC             | future RBAC ADR or approved matrix |
| FB-08 | invitations, last Owner rule, and ownership re-auth    | one-time expiring invites; never allow removal of the last active Owner                  | Proposed                  | product owner + security owner         | organization lifecycle  | backend readiness                  |
| FB-09 | database, migration tooling, and schema strategy       | server-owned schema with tested migrations, backup gate, and roll-forward plan           | Deferred                  | backend lead + infrastructure owner    | persistence             | future persistence ADR             |
| FB-10 | recovery targets and rollback                          | define RPO, RTO, backup retention, restore tests, and rollback criteria                  | Deferred                  | project owner + infrastructure owner   | persistence             | operations plan                    |
| FB-11 | API pagination, rate limits, and idempotency retention | cursor pagination, bounded pages, stable idempotency scope                               | Proposed; values Deferred | backend lead + infrastructure owner    | online API              | API contracts                      |
| FB-12 | online concurrency                                     | use server revision with `ETag`/`If-Match`; reject stale writes                          | Proposed                  | backend lead + frontend lead           | online API              | API contracts                      |
| FB-13 | data retention, export, deactivation, and deletion     | deactivate first; permanent deletion only after policy and recovery gates                | Deferred                  | product owner + legal/privacy owner    | organization launch     | future data lifecycle ADR          |
| FB-14 | audit retention and access                             | immutable, tenant-scoped audit events with separate access and retention policy          | Deferred                  | security owner + legal/privacy owner   | audit and observability | observability/audit policy         |
| FB-15 | observability provider, region, sampling, and budget   | provider-neutral adapter with redaction and request correlation                          | Deferred                  | project owner + infrastructure owner   | audit and observability | observability plan                 |
| FB-16 | eligible demo-data import                              | explicit preview, validation, tenant assignment, idempotency, and audit; never automatic | Deferred                  | product owner                          | migration rollout       | import decision record             |
| FB-17 | offline writes as a product requirement                | ship online-first; add an outbox only after demonstrated need                            | Deferred                  | product owner                          | optional offline sync   | future offline ADR                 |
| FB-18 | conflict policy, tombstones, and conflict UX           | no silent merge for business records; user-visible resolution                            | Deferred                  | product owner + frontend/backend leads | optional offline sync   | future offline ADR                 |

## Organization and account lifecycle gates

Future implementation must satisfy the lifecycle rules in
[`backend-readiness.md`](backend-readiness.md) before account-management UI is
added:

- organization creation and initial Owner membership are atomic,
- invitations bind a verified identity to one organization,
- role changes, suspension, removal, ownership transfer, and deactivation are
  server-authorized and audited,
- the final active Owner cannot be removed or demoted,
- session revocation follows membership suspension or removal,
- export, retention, reactivation, and deletion behavior is approved before
  organization deactivation is exposed.

The current settings view is demo profile/preferences UI and is not proof that
these workflows exist.

## RBAC and permission gate

The frontend role names and permission strings may seed a server matrix, but
they do not approve it. Before server endpoints are implemented, the owner must
approve:

- operations available to each role,
- whether per-member overrides are permitted,
- explicit permissions for hard delete,
- restrictions on import, export, organization settings, and audit access,
- treatment of archived records and relationships,
- whether any plan limits will interact with permissions in a later product
  scope.

Until that approval, server authorization is deny-by-default and hard delete is
denied.

## Monetization planning boundary

Monetization is not part of Priority 4 implementation planning. All items below
remain Deferred and must not create backend endpoints, SDKs, pricing UI, feature
gates, or production claims in this task.

| ID     | Decision                                         | Status   | Owner                               |
| ------ | ------------------------------------------------ | -------- | ----------------------------------- |
| MON-01 | plan catalog and source of truth                 | Deferred | product owner                       |
| MON-02 | subscription owner and billing contact           | Deferred | product owner                       |
| MON-03 | trial, cancellation, downgrade, and grace period | Deferred | product owner + legal owner         |
| MON-04 | invoice and payment-history visibility           | Deferred | product owner + legal owner         |
| MON-05 | usage limits and enforcement                     | Deferred | product owner + backend lead        |
| MON-06 | feature gates and interaction with RBAC          | Deferred | product owner + security owner      |
| MON-07 | retention and export after cancellation          | Deferred | product owner + legal/privacy owner |
| MON-08 | payment provider boundary                        | Deferred | project owner + backend lead        |

The local `Organization.plan` field remains demo metadata and is not billing
state.

## Implementation gate

Priority 4 may be considered planning-complete only when all material rows
required for phases 1-5 have an approved resolution reference and ADR 008 can
move from Proposed to Accepted. Offline rows may remain Deferred only if the
approved product scope explicitly excludes offline writes.

Until then:

- no backend runtime or provider is implied,
- no API adapter or network request is authorized,
- no production auth, RBAC, tenant isolation, persistence, audit, or monitoring
  claim is valid,
- `TO-DO.md` must keep Priority 4 active.

## Out of scope now

This register does not authorize backend implementation, database schemas,
account-management UI, API requests, provider SDKs, billing, payments, pricing,
cloud sync, framework migration, generated-file edits, deployment changes, or
Netlify publication.
