# FlowDesk future SaaS readiness

## Status

This document is planning-only. FlowDesk remains a frontend-only SaaS demo with demo authentication, local demo persistence, no backend, no database, no live API, no cloud sync, no billing provider and no production account management.

The goal is to identify the product and architecture decisions that must exist before future backend, account, workspace, subscription or audit-log implementation starts.

## Current demo boundaries

- `js/core/auth.demo.js` creates a local demo session and does not verify a user on a server.
- `js/domain/identity.js` provides demo `User`, `Organization` and `Membership` models.
- `js/domain/rbac.js` defines stable role and permission names for UI readiness only.
- `js/repositories/localStorageRepositoryAdapter.js` is the active persistence adapter.
- `js/domain/syncMetadata.js` is a readiness hook, not a production sync queue.
- Settings show demo profile, role, organization, preferences and local data tools, not real account management.

## Backend prerequisites

Before implementation, a backend task must define:

- authentication provider or session strategy,
- organization and workspace ownership model,
- server-side organization isolation for every resource,
- server-side RBAC enforcement for every protected operation,
- persistence model and migration strategy,
- server-side validation for all mutations and imports,
- audit logging for security-relevant and destructive actions,
- monitoring, request correlation and operational logging,
- production security headers and deployment responsibilities.

Frontend validation, demo RBAC and local migrations may improve UX, but they cannot be the source of truth for production data or permissions.

## Account and workspace model gaps

Future implementation must clarify:

- account signup, invite, accept invite, login, logout and password/session lifecycle,
- user profile ownership and what data can be edited by the user,
- organization creation, transfer of ownership and deletion,
- membership invitations, role changes, revocation and disabled users,
- workspace switching if one user belongs to multiple organizations,
- organization-level settings such as name, timezone, locale and default preferences,
- data export and deletion rights for organization owners,
- whether personal preferences are user-level or organization-level.

The current demo context is a single local workspace and should not be treated as proof of multi-tenant behavior.

## RBAC and permission boundaries

The frontend currently exposes `Owner`, `Manager`, `Member` and `Viewer` role names with stable permission strings. A production backend must still decide:

- which endpoints each role can access,
- whether permissions are role-only or can be overridden per member,
- how destructive actions, import, export and billing administration are restricted,
- how archived, restored and deleted records are audited,
- how plan limits interact with permissions,
- how permission errors map back to form, toast or repository failures.

Frontend role checks should remain UX hints until server authorization exists.

## Monetization planning boundaries

FlowDesk does not implement billing. Future monetization planning should define:

- plan catalog ownership and plan names,
- whether `Organization.plan` is read-only from billing state or edited by admins,
- subscription owner and billing contact,
- trial, cancellation, downgrade and grace-period behavior,
- invoice and payment history visibility,
- usage limits such as members, active clients, active projects, exports or storage,
- feature gates for advanced reporting, audit logs or multi-workspace access,
- data export and retention behavior after cancellation,
- integration boundary for a future payment provider.

Do not add pricing tables, payment provider SDKs, billing logic or plan enforcement until these decisions are explicitly scoped.

## Audit log requirements

A future audit log should capture enough context to support accountability without storing excessive sensitive data:

- actor user id and organization id,
- action name and affected resource type/id,
- timestamp and request id,
- before/after summary for high-risk changes,
- result status and failure reason where useful,
- source metadata such as session id or IP only if privacy policy allows it,
- retention, export and access rules.

Audit log requirements apply especially to login/session events, membership changes, role changes, imports, exports, resets, archive/restore/delete actions, plan changes and billing-adjacent actions.

## API prerequisites

`docs/api-contracts.md` describes future endpoints at a contract level. Before coding an API adapter, later tasks should define:

- exact response and error envelopes,
- pagination, filtering and sorting rules,
- optimistic concurrency fields such as `revision` or `etag`,
- conflict resolution UX,
- request id propagation into observability,
- mapping from API errors to `repositoryFail`,
- permission and plan-limit error codes,
- audit-log event contracts.

The frontend should continue to normalize backend responses before trusting them.

## Out of scope now

This readiness document does not authorize:

- backend implementation,
- real authentication,
- database schemas,
- API requests or adapters,
- payment provider integration,
- billing or pricing logic,
- cloud sync,
- account or organization management implementation,
- audit log implementation,
- production security claims.

Any later implementation should be a separate scoped task with updated acceptance criteria and verification gates.
