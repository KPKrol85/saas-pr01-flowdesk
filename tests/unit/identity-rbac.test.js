import { describe, expect, it } from 'vitest';
import { createDemoUserContext, validateMembership, validateOrganization, validateUser } from '../../js/domain/identity.js';
import { PERMISSIONS, ROLES, can, hasPermission } from '../../js/domain/rbac.js';
import { validateUserSession } from '../../js/domain/validators.js';

describe('identity and RBAC readiness', () => {
  it('validates frontend-only user, organization, and membership models', () => {
    const user = validateUser({ id: 'u1', name: 'Anna Manager', email: 'ANNA@FLOWDESK.TEST' });
    const organization = validateOrganization({ id: 'org1', name: 'Demo Org', plan: 'demo' });
    const membership = validateMembership({ id: 'm1', userId: 'u1', organizationId: 'org1', role: ROLES.MANAGER });

    expect(user.valid).toBe(true);
    expect(user.value.email).toBe('anna@flowdesk.test');
    expect(organization.valid).toBe(true);
    expect(membership.valid).toBe(true);
    expect(membership.value.role).toBe(ROLES.MANAGER);
  });

  it('normalizes invalid identity input into safe validation failures or fallbacks', () => {
    const invalidUser = validateUser({ id: 'u1', name: 'Broken', email: 'broken' });
    const membership = validateMembership({ role: 'Unknown' });

    expect(invalidUser.valid).toBe(false);
    expect(invalidUser.errors).toContainEqual(expect.objectContaining({ field: 'email' }));
    expect(membership.value.role).toBe(ROLES.VIEWER);
  });

  it('defines a stable permission matrix for future authorization', () => {
    expect(can(ROLES.OWNER, PERMISSIONS.ORGANIZATION_ADMIN)).toBe(true);
    expect(can(ROLES.MANAGER, PERMISSIONS.CLIENT_ARCHIVE)).toBe(true);
    expect(can(ROLES.MEMBER, PERMISSIONS.CLIENT_ARCHIVE)).toBe(false);
    expect(can(ROLES.VIEWER, PERMISSIONS.PROJECT_WRITE)).toBe(false);
  });

  it('checks permissions from a demo user context', () => {
    const context = createDemoUserContext({ role: ROLES.MEMBER });

    expect(hasPermission(context, PERMISSIONS.PROJECT_WRITE)).toBe(true);
    expect(hasPermission(context, PERMISSIONS.PROJECT_ARCHIVE)).toBe(false);
  });

  it('adds user, organization, and membership context to demo sessions', () => {
    const result = validateUserSession({ email: 'demo@flowdesk.pl', role: ROLES.MANAGER });

    expect(result.valid).toBe(true);
    expect(result.value.user).toMatchObject({ email: 'demo@flowdesk.pl' });
    expect(result.value.organization).toMatchObject({ id: 'org-flowdesk-demo' });
    expect(result.value.membership).toMatchObject({ role: ROLES.MANAGER });
  });

  it('does not create a valid demo session from empty storage', () => {
    const result = validateUserSession(null);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.objectContaining({ field: 'email' }));
  });
});
