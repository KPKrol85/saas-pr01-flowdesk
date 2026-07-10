# ADR 008: Provider-neutral server-authoritative backend boundary

## Status

Proposed

## Context

FlowDesk is a frontend-only demo with local demo authentication, synchronous
`localStorage` repositories, frontend RBAC, client validation, readiness-only
sync metadata, and local observability hooks.

These boundaries reduce future UI churn, but they do not provide production
identity, tenant isolation, authorization, persistence, validation, audit,
monitoring, or conflict handling. The current synchronous repository contract
also cannot be replaced directly by a network adapter without an asynchronous
store and UI-state migration.

The future architecture needs a coherent security and data-authority boundary
without selecting a provider, framework, database, or deployment platform
before owner constraints are known.

## Decision

If backend implementation is approved, FlowDesk will use a provider-neutral,
server-authoritative boundary with these rules:

1. The server owns authenticated session state, organization memberships,
   permissions, tenant isolation, domain persistence, validation, revisions,
   timestamps, and audit events.
2. `Organization` is the proposed initial workspace and tenant boundary. Every
   protected operation derives access from a verified server session and active
   membership; client-supplied organization identifiers are routing context
   only.
3. Authorization is deny-by-default. Frontend RBAC remains a UX contract and
   never substitutes for server checks.
4. Browser sessions are server-managed and revocable. A `Secure`, `HttpOnly`
   cookie with CSRF protection is the proposed baseline; final cookie policy
   depends on the approved deployment topology.
5. Server responses are canonical. IDs, tenant IDs, relationships, timestamps,
   audit fields, and revisions are server-controlled.
6. The frontend keeps its store/actions/selectors and repository boundary, but a
   future API migration introduces Promise-based repository results, loading and
   error states, idempotent retries, cancellation semantics, and explicit
   concurrency handling.
7. The first backend rollout is online-first. Offline writes, outbox storage,
   tombstones, and conflict UI are a separate optional phase.
8. Security audit events, operational logs, frontend telemetry, and UI activity
   history remain separate data products with separate access and retention.
9. Backend rollout follows the phases in
   [`../backend-readiness.md`](../backend-readiness.md) and the wire contract in
   [`../api-contracts.md`](../api-contracts.md).

## Consequences

- The current frontend runtime and demo persistence remain unchanged until a
  separately approved implementation task.
- A backend adapter is not a drop-in replacement for the current synchronous
  adapter; store and view async states require an explicit migration.
- Server-side tenant filters and relationship checks are mandatory for every
  read and write.
- Existing repository result shapes can remain stable at the top level, while
  new network, session, permission, rate-limit, and conflict error codes are
  introduced deliberately.
- `localStorage` can continue to hold local UI preferences but cannot be an auth
  authority or canonical cloud-data store.
- Import of demo data is explicit, validated, tenant-assigned, idempotent, and
  audited if it is approved later.
- Documentation can guide implementation without making production security or
  deployment claims.

## Rejected or deferred alternatives

- **Rejected:** treating demo auth, frontend RBAC, client validation, or
  `localStorage` as production security or persistence.
- **Rejected:** trusting a client-provided `organizationId` without deriving and
  checking membership from the server session.
- **Rejected:** replacing the synchronous adapter with network calls while
  leaving the store and UI synchronous.
- **Rejected:** silent last-write-wins for clients, projects, events, archive,
  restore, delete, or relationship changes.
- **Deferred:** named identity, monitoring, storage, database, queue, and hosting
  providers.
- **Deferred:** backend language/framework, infrastructure topology, secrets
  management, regions, and cost limits.
- **Deferred:** final role matrix, hard-delete permissions, account recovery,
  retention/deletion policy, and audit access.
- **Deferred:** whether offline writes are required and the final merge,
  tombstone, and conflict-resolution model.

## Unresolved owner decisions

ADR 008 cannot move to Accepted until the material decisions in
[`../future-saas-readiness.md`](../future-saas-readiness.md) have approved owners
and resolution references. At minimum this includes backend technology,
deployment topology, identity/session constraints, storage and recovery targets,
the server RBAC matrix, data and audit retention, observability constraints, and
the product decision on offline writes.
