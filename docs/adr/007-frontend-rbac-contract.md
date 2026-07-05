# ADR 007: Frontend RBAC contract with backend enforcement later

## Status

Accepted

## Context

FlowDesk now has frontend identity, membership, role and permission models, but no real backend or production authentication.

## Decision

Keep RBAC as a frontend contract and readiness layer.

Do not treat frontend RBAC as production security. A future backend must enforce authorization for every protected operation.

## Consequences

- UI can be prepared around stable role and permission names.
- Tests can protect the permission matrix.
- No production security claim is made.
- Backend RBAC, organization isolation and audit logs remain required before production use.
